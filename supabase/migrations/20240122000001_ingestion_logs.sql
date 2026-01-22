-- Create Ingestion Logs Table
create table if not exists public.ingestion_logs (
    id uuid default uuid_generate_v4() primary key,
    source text not null default 'n8n', -- e.g., 'n8n', 'script'
    batch_size int default 0,
    inserted int default 0,
    updated int default 0,
    ignored int default 0,
    errors int default 0,
    status text not null, -- 'SUCCESS', 'PARTIAL', 'ERROR'
    executed_at timestamptz default now(),
    details jsonb default '{}'::jsonb -- For error messages or metadata
);

-- Enable RLS
alter table public.ingestion_logs enable row level security;

-- Policies
-- Backend (Service Role) can insert
create policy "Service Role can insert logs"
on public.ingestion_logs
for insert
to service_role
with check (true);

-- Frontend (Authenticated) can view logs
create policy "Authenticated users can view logs"
on public.ingestion_logs
for select
to authenticated
using (true);

-- Indexes
create index idx_ingestion_logs_executed_at on public.ingestion_logs(executed_at desc);
