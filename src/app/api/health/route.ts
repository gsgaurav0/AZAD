import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database/health';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/health
 * Public or cron-invoked database health check endpoint.
 *
 * Query options:
 * - ?cron=daily : Flags request as automated daily heartbeat
 * - ?record=true|false : Whether to record check in database (defaults to true)
 * - ?source=... : Tag source (e.g. 'uptime_robot', 'admin_portal')
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cron = searchParams.get('cron');
    const recordParam = searchParams.get('record');

    const shouldRecord = recordParam !== 'false';
    const source = cron ? `cron_${cron}` : (searchParams.get('source') || 'health_api');

    const result = await checkDatabaseHealth({
      record: shouldRecord,
      source,
    });

    const statusCode = result.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'X-Database-Status': result.database.connected ? 'connected' : 'disconnected',
        'X-Database-Latency-Ms': String(result.latencyMs),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: err.message || 'Internal health check error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
