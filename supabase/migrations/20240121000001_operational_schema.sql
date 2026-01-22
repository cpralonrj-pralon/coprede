-- Recreate Incidents Table with Operational Fields

-- Drop existing table if strictly necessary (or alter if preserving data is key, but assuming schema change is priority for dev)
drop table if exists public.incidents cascade;

create table public.incidents (
  id uuid default uuid_generate_v4() primary key,
  
  -- Identifiers
  id_mostra text not null,
  nm_origem text not null,
  
  -- Core Status
  nm_tipo text,
  nm_status text,
  dh_inicio timestamptz,
  ds_sumario text,
  
  -- Topology & Location
  nm_cidade text,
  topologia text,
  tp_topologia text,
  regional text,
  grupo text,
  cluster text,
  subcluster text,
  
  -- Categorization
  nm_cat_prod2 text,
  nm_cat_prod3 text,
  nm_cat_oper2 text,
  nm_cat_oper3 text,
  
  -- Audit
  payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Constraint for Idempotency
  constraint incidents_origin_external_key unique (nm_origem, id_mostra)
);

-- Re-enable RLS
alter table public.incidents enable row level security;

-- Policies
create policy "Authenticated users can view incidents"
on public.incidents for select
to authenticated
using ( true );

-- Indexes for performance
create index idx_incidents_status on public.incidents(nm_status);
create index idx_incidents_dh_inicio on public.incidents(dh_inicio);
create index idx_incidents_regional on public.incidents(regional);
create index idx_incidents_grupo on public.incidents(grupo);
create index idx_incidents_cluster on public.incidents(cluster);
create index idx_incidents_topologia on public.incidents(topologia);

-- Update Realtime
alter publication supabase_realtime add table public.incidents;

-- Trigger for Updated At
create trigger on_incidents_updated
  before update on public.incidents
  for each row execute procedure public.handle_updated_at();

-- Note: reusing handle_updated_at function from previous migration
