import { createAdminClient } from '@/lib/supabase/admin';

export interface TableCheckInfo {
  status: 'ok' | 'error';
  count?: number;
  error?: string;
}

export interface DatabaseHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: string;
  latencyMs: number;
  database: {
    connected: boolean;
    provider: 'supabase_postgresql';
    read: 'ok' | 'failed';
    write: 'ok' | 'skipped' | 'failed';
    tables: Record<string, TableCheckInfo>;
  };
  lastDailyCheck?: string;
  schedule: {
    cadence: 'daily';
    cron: string;
    configured: boolean;
    description: string;
  };
  error?: string;
}

/**
 * Executes a comprehensive health check against Supabase PostgreSQL:
 * 1. Measures round-trip query latency (READ)
 * 2. Checks critical production tables
 * 3. Records the check in `cms_settings` table (WRITE)
 * 4. Also records into `health_checks` table if present
 */
export async function checkDatabaseHealth(options?: {
  record?: boolean;
  source?: string;
}): Promise<DatabaseHealthResult> {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  const shouldRecord = options?.record ?? true;
  const source = options?.source || 'api';

  try {
    const admin = createAdminClient();

    // 1. Primary ping query to measure latency
    const pingStart = performance.now();
    const { count: categoriesCount, error: pingError } = await admin
      .from('categories')
      .select('id', { count: 'exact', head: true });

    const pingDuration = Math.round(performance.now() - pingStart);

    if (pingError) {
      return {
        status: 'unhealthy',
        message: 'Database query failed',
        timestamp,
        latencyMs: pingDuration,
        database: {
          connected: false,
          provider: 'supabase_postgresql',
          read: 'failed',
          write: 'skipped',
          tables: {
            categories: { status: 'error', error: pingError.message },
          },
        },
        schedule: {
          cadence: 'daily',
          cron: '0 0 * * *',
          configured: true,
          description: 'Automated daily database health request via Vercel Cron & API daemon',
        },
        error: pingError.message,
      };
    }

    // 2. Parallel table checks
    const targetTables = ['products', 'orders', 'profiles', 'coupons', 'inquiries', 'cms_settings'];
    const tables: Record<string, TableCheckInfo> = {
      categories: { status: 'ok', count: categoriesCount ?? 0 },
    };

    let hasDegraded = false;

    const settled = await Promise.allSettled(
      targetTables.map(async (table) => {
        const { count, error } = await admin.from(table).select('id', { count: 'exact', head: true });
        return { table, count, error };
      })
    );

    for (const res of settled) {
      if (res.status === 'fulfilled') {
        const { table, count, error } = res.value;
        if (error) {
          tables[table] = { status: 'error', error: error.message };
          hasDegraded = true;
        } else {
          tables[table] = { status: 'ok', count: count ?? 0 };
        }
      } else {
        hasDegraded = true;
      }
    }

    // 3. Persistent Write Check (proves database is writeable and maintains daily log)
    let writeStatus: 'ok' | 'skipped' | 'failed' = 'skipped';
    let lastDailyCheck = timestamp;

    if (shouldRecord) {
      try {
        const healthPayload = {
          status: hasDegraded ? 'degraded' : 'healthy',
          latencyMs: pingDuration,
          checkedAt: timestamp,
          triggeredBy: source,
          tables,
        };

        const { error: upsertErr } = await admin.from('cms_settings').upsert(
          {
            key: 'database_health_status',
            value: healthPayload,
            updated_at: timestamp,
          },
          { onConflict: 'key' }
        );

        if (upsertErr) {
          console.warn('Failed to upsert health log into cms_settings:', upsertErr.message);
          writeStatus = 'failed';
        } else {
          writeStatus = 'ok';
        }

        // Optional health_checks table insert
        try {
          await admin.from('health_checks').insert({
            status: hasDegraded ? 'degraded' : 'healthy',
            latency_ms: pingDuration,
            checked_at: timestamp,
            details: healthPayload,
            triggered_by: source,
          });
        } catch {
          // Table may not have been created yet, which is safe to ignore
        }
      } catch (writeErr) {
        console.warn('Error recording database health check:', writeErr);
        writeStatus = 'failed';
      }
    } else {
      // Read last recorded check if not recording now
      try {
        const { data: storedHealth } = await admin
          .from('cms_settings')
          .select('value, updated_at')
          .eq('key', 'database_health_status')
          .single();

        if (storedHealth) {
          lastDailyCheck = storedHealth.value?.checkedAt || storedHealth.updated_at || timestamp;
        }
      } catch {
        // Safe fallback
      }
    }

    return {
      status: hasDegraded ? 'degraded' : 'healthy',
      message: hasDegraded
        ? 'Database responded but some tables reported errors'
        : 'Database is operational and healthy',
      timestamp,
      latencyMs: pingDuration,
      database: {
        connected: true,
        provider: 'supabase_postgresql',
        read: 'ok',
        write: writeStatus,
        tables,
      },
      lastDailyCheck,
      schedule: {
        cadence: 'daily',
        cron: '0 0 * * *',
        configured: true,
        description: 'Automated daily database health request via Vercel Cron & API daemon',
      },
    };
  } catch (err: any) {
    return {
      status: 'unhealthy',
      message: 'Failed to connect to database',
      timestamp,
      latencyMs: Math.round(performance.now() - startTime),
      database: {
        connected: false,
        provider: 'supabase_postgresql',
        read: 'failed',
        write: 'failed',
        tables: {},
      },
      schedule: {
        cadence: 'daily',
        cron: '0 0 * * *',
        configured: true,
        description: 'Automated daily database health request via Vercel Cron & API daemon',
      },
      error: err.message || 'Unknown database error',
    };
  }
}
