-- Clean up bad data before adding constraints
DO $$ 
BEGIN 
    -- 1. Remove rows where cod_incidente is NULL
    DELETE FROM public.reincidencia_abrangencia WHERE cod_incidente IS NULL;

    -- 2. Remove duplicates, keeping the most recently updated one
    DELETE FROM public.reincidencia_abrangencia a USING public.reincidencia_abrangencia b 
    WHERE a.id < b.id 
    AND a.cod_incidente = b.cod_incidente;

    -- 3. Now safely make it NOT NULL
    ALTER TABLE public.reincidencia_abrangencia ALTER COLUMN cod_incidente SET NOT NULL;

    -- 4. Add unique constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reincidencia_abrangencia_cod_incidente_key') THEN
        ALTER TABLE public.reincidencia_abrangencia ADD CONSTRAINT reincidencia_abrangencia_cod_incidente_key UNIQUE (cod_incidente);
    END IF;
END $$;
