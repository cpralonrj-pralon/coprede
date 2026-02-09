
-- 0. Dependencies & Utilities (Fixes missing function error)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Recreate Incidents Table with Operational Fields
-- This drops the existing (empty or incorrect) table and creates the correct one.
drop table if exists public.incidents cascade;

-- CRITICAL: Clear history because parent incidents are being deleted
TRUNCATE TABLE public.incident_history;

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

-- Indexes
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

-- 2. Restore FK to incident_history
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_history') THEN
        ALTER TABLE incident_history 
        ADD CONSTRAINT incident_history_incident_id_fkey 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Add Treatment Columns (from recent migration)
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS nm_organizacao_tratamento text,
ADD COLUMN IF NOT EXISTS nm_grupo_tratamento text;

-- 4. Fix Incident History Schema and Triggers
ALTER TABLE public.incident_history
ADD COLUMN IF NOT EXISTS campo_alterado text,
ADD COLUMN IF NOT EXISTS valor_anterior text,
ADD COLUMN IF NOT EXISTS valor_novo text,
ADD COLUMN IF NOT EXISTS alterado_por text,
ADD COLUMN IF NOT EXISTS alterado_em timestamptz DEFAULT now();

-- Create or Replace Function to Log Specific Changes
CREATE OR REPLACE FUNCTION public.log_incident_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for Organization Change
    IF (OLD.nm_organizacao_tratamento IS DISTINCT FROM NEW.nm_organizacao_tratamento) THEN
        INSERT INTO public.incident_history (incident_id, status_anterior, status_novo, campo_alterado, valor_anterior, valor_novo, alterado_por, alterado_em)
        VALUES (NEW.id, OLD.nm_status, NEW.nm_status, 'nm_organizacao_tratamento', OLD.nm_organizacao_tratamento, NEW.nm_organizacao_tratamento, 'system_trigger', now());
    END IF;

    -- Check for Group Change
    IF (OLD.nm_grupo_tratamento IS DISTINCT FROM NEW.nm_grupo_tratamento) THEN
        INSERT INTO public.incident_history (incident_id, status_anterior, status_novo, campo_alterado, valor_anterior, valor_novo, alterado_por, alterado_em)
        VALUES (NEW.id, OLD.nm_status, NEW.nm_status, 'nm_grupo_tratamento', OLD.nm_grupo_tratamento, NEW.nm_grupo_tratamento, 'system_trigger', now());
    END IF;

    -- Check for Status Change
    IF (OLD.nm_status IS DISTINCT FROM NEW.nm_status) THEN
        INSERT INTO public.incident_history (incident_id, status_anterior, status_novo, campo_alterado, valor_anterior, valor_novo, alterado_por, alterado_em)
        VALUES (NEW.id, OLD.nm_status, NEW.nm_status, 'nm_status', OLD.nm_status, NEW.nm_status, 'system_trigger', now());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create Trigger (Drop first to avoid duplicates)
DROP TRIGGER IF EXISTS on_incident_change_tracking ON public.incidents;

CREATE TRIGGER on_incident_change_tracking
AFTER UPDATE ON public.incidents
FOR EACH ROW
EXECUTE PROCEDURE public.log_incident_changes();

-- Enable RLS and Add Policy for History
ALTER TABLE public.incident_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT * FROM pg_policies 
        WHERE tablename = 'incident_history' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" 
        ON "public"."incident_history" 
        FOR SELECT 
        USING (true);
    END IF;
END $$;
