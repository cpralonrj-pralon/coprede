
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const schemaSQL_1 = `
-- Recreate Incidents Table with Operational Fields
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
`;

const schemaSQL_2_FK = `
-- Restore FK to incident_history
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
`;

const schemaSQL_3_Cols = `
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS nm_organizacao_tratamento text,
ADD COLUMN IF NOT EXISTS nm_grupo_tratamento text;
`;

const schemaSQL_4_History = `
-- 2. Ensure Schema Completeness (Idempotent)
ALTER TABLE public.incident_history
ADD COLUMN IF NOT EXISTS campo_alterado text,
ADD COLUMN IF NOT EXISTS valor_anterior text,
ADD COLUMN IF NOT EXISTS valor_novo text,
ADD COLUMN IF NOT EXISTS alterado_por text,
ADD COLUMN IF NOT EXISTS alterado_em timestamptz DEFAULT now();

-- 3. Create or Replace Function to Log Specific Changes
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

-- 4. Create Trigger (Drop first to avoid duplicates)
DROP TRIGGER IF EXISTS on_incident_change_tracking ON public.incidents;

CREATE TRIGGER on_incident_change_tracking
AFTER UPDATE ON public.incidents
FOR EACH ROW
EXECUTE PROCEDURE public.log_incident_changes();

-- 5. Enable RLS and Add Policy
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
`;

async function runSQL(name, sql) {
    console.log(`Executing ${name}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }); // Requires exec_sql RPC

    // WAIT! I don't know if 'exec_sql' RPC exists. 
    // Initial schema (Step 432) did NOT create it.
    // I likely CANNOT run raw SQL via JS client without it.

    if (error) {
        console.error(`RPC exec_sql failed (maybe not installed?): ${error.message}`);
        // Fallback? I cannot use the JS client to run DDL unless I have a superuser RPC function exposed.
        // But wait, I have the 'SUPABASE_SERVICE_ROLE_KEY'. 
        // The JS client STILL doesn't support generic `.query()` or `.execute()`.
        // It only supports `.rpc()`.

        // CRITICAL: If I cannot run SQL via JS client, how do I apply migrations?
        // I usually assume the user has Supabase CLI or I can use the tool logic.
        // BUT, I can try to use the REST API `POST /v1/query`? No that's not standard.

        // Let's check if 'exec_sql' exists? 
        // Or maybe I can use the backend (NestJS) to run it?
        // NestJS uses TypeORM or Prisma?
        // No, looking at `supabase.service.ts` (implied), it uses `Just Supabase Client`.

        // I AM STUCK if I can't run SQL.
        // BUT, I can use the `pg` library directly!
        // Supabase provides a direct connection string (Port 5432 or 6543).
        // The user's conversation 1 said "The corporate network blocks direct TCP connections to the PostgreSQL port (5432)".
        // SO I CANNOT USE `pg` library.

        // I MUST use the HTTP API.
        // If I don't have an RPC for executing SQL, I can create one?
        // I can't create one without executing SQL... chicken and egg.

        // Wait, `n8n` uses HTTP Request?
        // Does the user have an RPC function for SQL?
        // Let's look at `20240121000000_init_schema.sql` again. It has function definitions, but no `exec_sql`.

        // Maybe I can use the **backend** I just started on port 3005?
        // Does it have an endpoint to run SQL? Unlikely.

        // BUT, I can add a temporary endpoint to the backend to run SQL using its internal access?
        // The backend uses `supabase-js` client too (IncidentsService: line 31).
        // So the backend has the same limitation.

        // Wait! `IncidentsService` lines 81-82: `.select('id, id_mostra')`.
        // It uses the client.

        // Is there ANY way to run SQL?
        // Maybe the user has the Supabase CLI installed?
        // `npx supabase db push`?
        // I can check if `supabase` CLI is available.

        return false;
    }
    console.log(`Success: ${name}`);
    return true;
}

// I will attempt to check for 'supabase' CLI in the next step.
// For now, I'll write the file but comment out the execution part and log a warning.
// Actually, I should check if CLI works FIRST.

