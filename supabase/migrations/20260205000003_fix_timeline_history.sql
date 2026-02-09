-- 1. Robust Column Migration (Handle valor_antigo -> valor_anterior)
DO $$
BEGIN
    -- Check if the OLD column 'valor_antigo' exists
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='incident_history' and column_name='valor_antigo') THEN
        
        -- Check if the NEW column 'valor_anterior' ALSO exists (The case that caused the error)
        IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='incident_history' and column_name='valor_anterior') THEN
            -- Migrate data from old to new if new is null
            UPDATE public.incident_history SET valor_anterior = valor_antigo WHERE valor_anterior IS NULL;
            -- Drop the old column
            ALTER TABLE public.incident_history DROP COLUMN valor_antigo;
        
        -- If NEW column doesn't exist, simply rename
        ELSE
            ALTER TABLE public.incident_history RENAME COLUMN valor_antigo TO valor_anterior;
        END IF;
    END IF;
END $$;

-- 2. Ensure Schema Completeness (Idempotent)
ALTER TABLE public.incident_history
ADD COLUMN IF NOT EXISTS campo_alterado text,
ADD COLUMN IF NOT EXISTS valor_anterior text,
ADD COLUMN IF NOT EXISTS valor_novo text,
ADD COLUMN IF NOT EXISTS alterado_por text,
ADD COLUMN IF NOT EXISTS alterado_em timestamptz DEFAULT now();

-- 3. Create or Replace Function to Log Specific Changes (Fixed Search Path)
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

-- 4. Create Trigger (Drop first to avoid duplicates if re-running)
DROP TRIGGER IF EXISTS on_incident_change_tracking ON public.incidents;

CREATE TRIGGER on_incident_change_tracking
AFTER UPDATE ON public.incidents
FOR EACH ROW
EXECUTE PROCEDURE public.log_incident_changes();

-- 5. Enable RLS and Add Policy (Fix Read Access)
ALTER TABLE public.incident_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Allow Read Access (Select) for everyone (Authenticated and Anon)
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
