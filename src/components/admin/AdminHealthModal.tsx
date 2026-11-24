'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { DatabaseHealthResult } from '@/lib/database/health';

interface AdminHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckCompleted?: (result: DatabaseHealthResult) => void;
}

export default function AdminHealthModal({
  isOpen,
  onClose,
  onCheckCompleted,
}: AdminHealthModalProps) {
  const [data, setData] = useState<DatabaseHealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async (record = true, source = 'admin_ui') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/health?record=${record}&source=${source}`, {
        cache: 'no-store',
      });
      const json: DatabaseHealthResult = await res.json();
      setData(json);
      if (onCheckCompleted) {
        onCheckCompleted(json);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with database health endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth(true, 'admin_modal_open');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isHealthy = data?.status === 'healthy';
  const isDegraded = data?.status === 'degraded';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#DDD2C0] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-white border-b border-[#DDD2C0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9A8029]/10 border border-[#9A8029]/30 flex items-center justify-center text-[#9A8029]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#2B1A16]">
                  Database Health & Telemetry
                </h3>
                {data && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                      isHealthy
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isDegraded
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isHealthy ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : isDegraded ? (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-600" />
                    )}
                    {data.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#2B1A16]/60">
                Automated daily heartbeat & real-time connection latency diagnostic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#2B1A16]/50 hover:text-[#2B1A16] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Database Health Check Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Latency */}
            <div className="bg-white p-4 rounded-xl border border-[#DDD2C0]">
              <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Query Latency
                </span>
                <Activity className="w-4 h-4 text-[#9A8029]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#2B1A16]">
                {data ? `${data.latencyMs} ms` : '...'}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">
                Round-trip PostgreSQL query
              </span>
            </div>

            {/* Metric 2: Provider */}
            <div className="bg-white p-4 rounded-xl border border-[#DDD2C0]">
              <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Engine & Read/Write
                </span>
                <Database className="w-4 h-4 text-[#9A8029]" />
              </div>
              <div className="font-serif text-lg font-bold text-[#2B1A16] truncate">
                Supabase Postgres
              </div>
              <span className="text-[10px] text-[#2B1A16]/60 font-medium">
                Read: {data?.database.read || 'ok'} • Write: {data?.database.write || 'ok'}
              </span>
            </div>

            {/* Metric 3: Automated Daily Ping */}
            <div className="bg-white p-4 rounded-xl border border-[#DDD2C0]">
              <div className="flex items-center justify-between text-[#2B1A16]/60 mb-1">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Daily Request
                </span>
                <Calendar className="w-4 h-4 text-[#9A8029]" />
              </div>
              <div className="font-serif text-sm font-bold text-[#2B1A16]">
                Active (00:00 UTC)
              </div>
              <span className="text-[10px] text-[#9A8029] font-medium">
                Vercel Cron: 0 0 * * *
              </span>
            </div>
          </div>

          {/* Daily Schedule Banner */}
          <div className="bg-[#EFE8DD]/40 border border-[#DDD2C0] rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#9A8029] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#2B1A16]">
                Automated Daily Request Engine Configured
              </p>
              <p className="text-[#2B1A16]/70">
                Your database receives an automated daily health request at{' '}
                <strong className="text-[#2B1A16]">00:00 UTC</strong> to guarantee continuous
                uptime, prevent sleep/idle pause, and record latency telemetry in{' '}
                <code className="text-[#9A8029] bg-white px-1.5 py-0.5 rounded border border-[#DDD2C0]">
                  cms_settings
                </code>
                .
              </p>
              {data?.lastDailyCheck && (
                <p className="text-[11px] text-[#2B1A16]/60 pt-1 font-mono">
                  Last recorded ping:{' '}
                  {new Date(data.lastDailyCheck).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Table Breakdown */}
          {data?.database.tables && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2B1A16] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#9A8029]" />
                  Verified Production Tables
                </span>
                <span className="text-[11px] font-mono text-[#2B1A16]/50">
                  {Object.keys(data.database.tables).length} tables checked
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(data.database.tables).map(([tableName, info]) => (
                  <div
                    key={tableName}
                    className="p-2.5 rounded-lg bg-white border border-[#DDD2C0] flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-[#2B1A16] truncate max-w-[110px]">
                      {tableName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        info.status === 'ok'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {info.status === 'ok' ? `${info.count ?? 0} rows` : 'error'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Endpoint Reference */}
          <div className="pt-2 border-t border-[#DDD2C0]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-[#2B1A16]/60">
              API Endpoint:{' '}
              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[#9A8029] hover:underline inline-flex items-center gap-1"
              >
                /api/health
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <button
              onClick={() => fetchHealth(true, 'admin_manual')}
              disabled={loading}
              className="px-4 py-2 bg-[#2B1A16] hover:bg-[#3D2620] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Pinging Database...' : 'Send Health Request Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
