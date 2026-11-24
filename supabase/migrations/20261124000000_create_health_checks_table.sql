-- ==============================================================================
-- MEWAK LUXURY TECH - DATABASE HEALTH AUDIT LOG SCHEMA
-- ==============================================================================

create table if not exists public.health_checks (
  id uuid default gen_random_uuid() primary key,
  status text not null check (status in ('healthy', 'degraded', 'unhealthy')),
  latency_ms integer not null,
  checked_at timestamptz default now(),
  details jsonb default '{}'::jsonb,
  triggered_by text default 'cron'
);

-- Index for timeline and recent logs query
create index if not exists idx_health_checks_checked_at on public.health_checks(checked_at desc);

-- Row Level Security
alter table public.health_checks enable row level security;

-- Policies: service role full access
create policy "Service role full access on health_checks"
  on public.health_checks
  for all
  to service_role
  using (true)
  with check (true);

-- Authenticated admins can view health audit logs
create policy "Authenticated users can read health_checks"
  on public.health_checks
  for select
  to authenticated
  using (true);
