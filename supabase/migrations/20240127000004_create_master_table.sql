-- 0. CLEANUP LEGACY TRIGGERS (Fix for 'indicadores_operacionais' error)
DROP TRIGGER IF EXISTS trg_sync_master_legacy ON public.coprede_master_incidents;
DROP FUNCTION IF EXISTS public.sync_master_to_legacy();

-- 1. Create Master Table (Data Lake - Mirror of Source)
-- Columns exactly as provided by source system to ensure 1:1 mirroring.
CREATE TABLE IF NOT EXISTS public.coprede_master_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campos Originais (Source)
    id_mostra TEXT UNIQUE NOT NULL, -- Chave Primária Original
    nm_origem TEXT,
    nm_tipo TEXT,
    nm_status TEXT,
    dh_inicio TIMESTAMPTZ,
    ds_sumario TEXT,
    nm_cidade TEXT,
    topologia TEXT,     -- Node (HFC) ou PON (GPON)?
    tp_topologia TEXT,  -- Tipo de Tecnologia?
    nm_cat_prod2 TEXT,
    nm_cat_prod3 TEXT,
    nm_cat_oper2 TEXT,  -- Tecnologia (HFC/GPON) geralmente vem aqui ou nm_tipo
    nm_cat_oper3 TEXT,
    regional TEXT,
    grupo TEXT,
    cluster TEXT,
    subcluster TEXT,

    -- Campos de Gestão/Controle (Nossos)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    enviado_toa BOOLEAN DEFAULT false,
    reincidente BOOLEAN DEFAULT false,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_master_id_mostra ON public.coprede_master_incidents(id_mostra);
CREATE INDEX IF NOT EXISTS idx_master_dh_inicio ON public.coprede_master_incidents(dh_inicio);
CREATE INDEX IF NOT EXISTS idx_master_topologia ON public.coprede_master_incidents(topologia);

-- 2. Mirror Function (Production 'incidents' -> Master 'coprede_master_incidents')
CREATE OR REPLACE FUNCTION public.mirror_production_to_master()
RETURNS TRIGGER AS $$
BEGIN
    -- This function grabs whatever is inserted/updated in the PROD 'incidents' table
    -- and pushes it to the hidden MASTER table.
    -- DELETEs are ignored to preserve history in Master.

    INSERT INTO public.coprede_master_incidents (
        id_mostra, nm_origem, nm_tipo, nm_status, 
        dh_inicio, ds_sumario, nm_cidade, 
        topologia, tp_topologia, 
        nm_cat_prod2, nm_cat_prod3, nm_cat_oper2, nm_cat_oper3, 
        regional, grupo, cluster, subcluster,
        raw_data,
        updated_at
    )
    VALUES (
        NEW.id_mostra, NEW.nm_origem, NEW.nm_tipo, NEW.nm_status,
        NEW.dh_inicio::timestamptz, NEW.ds_sumario, NEW.nm_cidade,
        NEW.topologia, NEW.tp_topologia,
        NEW.nm_cat_prod2, NEW.nm_cat_prod3, NEW.nm_cat_oper2, NEW.nm_cat_oper3,
        NEW.regional, NEW.grupo, NEW.cluster, NEW.subcluster,
        to_jsonb(NEW),
        NOW()
    )
    ON CONFLICT (id_mostra) DO UPDATE SET
        nm_status = EXCLUDED.nm_status,
        ds_sumario = EXCLUDED.ds_sumario,
        nm_cidade = EXCLUDED.nm_cidade,
        topologia = EXCLUDED.topologia,
        tp_topologia = EXCLUDED.tp_topologia,
        regional = EXCLUDED.regional,
        grupo = EXCLUDED.grupo,
        updated_at = NOW(),
        raw_data = EXCLUDED.raw_data;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger Definition on PRODUCTION Table
DROP TRIGGER IF EXISTS trg_mirror_to_master ON public.incidents;

CREATE TRIGGER trg_mirror_to_master
AFTER INSERT OR UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION public.mirror_production_to_master();

-- 4. RLS for Master Table
ALTER TABLE public.coprede_master_incidents ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'coprede_master_incidents' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON public.coprede_master_incidents FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'coprede_master_incidents' AND policyname = 'Enable insert for authenticated and anon') THEN
        CREATE POLICY "Enable insert for authenticated and anon" ON public.coprede_master_incidents FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'coprede_master_incidents' AND policyname = 'Enable update for authenticated and anon') THEN
        CREATE POLICY "Enable update for authenticated and anon" ON public.coprede_master_incidents FOR UPDATE USING (true);
    END IF;
END $$;
