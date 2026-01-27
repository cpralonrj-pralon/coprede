-- 1. Restore Incident History (if missing)
-- Check if table exists, if not create it.
create table if not exists public.incident_history (
  id uuid default uuid_generate_v4() primary key,
  incident_id uuid references public.incidents(id) on delete cascade,
  old_status text,
  new_status text,
  changed_at timestamptz default now(),
  changed_by text default 'system'
);

-- Enable RLS for history
alter table public.incident_history enable row level security;

-- Policies for History
create policy "Authenticated users can view history"
on public.incident_history for select
to authenticated
using ( true );

-- 2. Create Analytic Domain: Indicadores Residencial
create table if not exists public.indicadores_residencial (
  id uuid default uuid_generate_v4() primary key,
  
  -- Dimensions (Unique Key Components)
  referencia date not null, -- First day of month usually
  regional text not null,
  cidade text not null,
  cluster text not null,
  subcluster text not null,
  
  -- Metrics: Base & Impact
  clientes_base int default 0,
  clientes_afetados int default 0,
  
  -- Metrics: Quality
  disponibilidade numeric(5,2), -- 99.99
  indisponibilidade numeric(5,2),
  
  -- Metrics: Service
  tma numeric(10,2), -- Average call duration
  tme numeric(10,2), -- Average wait time
  
  -- Metrics: Tickets
  chamados_abertos int default 0,
  chamados_fechados int default 0,
  sla numeric(5,2),
  
  -- Meta
  fonte text, -- 'Excel', 'SGO', etc
  payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Constraint for Idempotency (One record per cluster per month)
  constraint indicadores_residencial_unique_key 
    unique (referencia, regional, cidade, cluster, subcluster)
);

-- Indexes for Analytics
create index idx_indicadores_ref on public.indicadores_residencial(referencia);
create index idx_indicadores_reg on public.indicadores_residencial(regional);
create index idx_indicadores_cluster on public.indicadores_residencial(cluster);

-- RLS for Indicators
alter table public.indicadores_residencial enable row level security;

create policy "Authenticated users can view indicators"
on public.indicadores_residencial for select
to authenticated
using ( true );

-- Realtime
alter publication supabase_realtime add table public.indicadores_residencial;
