-- Drop the incorrect unique constraint on cod_incidente (which blocked multiple nodes per incident)
ALTER TABLE public.reincidencia_abrangencia DROP CONSTRAINT IF EXISTS reincidencia_abrangencia_cod_incidente_key;

-- Create a robust composite unique index to identify distinct network elements per incident
-- We use COALESCE to treat NULLs as empty strings for uniqueness purposes (avoiding duplicate nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reincidencia_abrangencia_unique_element 
ON public.reincidencia_abrangencia (
    incidente, 
    COALESCE(node, 'IGNORE'), 
    COALESCE(nap, 'IGNORE'),
    COALESCE(celula, 'IGNORE')
);

-- We don't strictly need a CONSTRAINT if we have a UNIQUE INDEX, but for ON CONFLICT support,
-- Supabase/Postgres prefers a named constraint.
-- However, ON CONFLICT (col1, col2) works with indices too.
-- Let's try to add it as a constraint if possible, but expression constraints are tricky.
-- For simple upsert support in client, it's easier to target specific columns.

-- Let's stick to standard columns and allow NULLs to duplicate if we can't easily constrain them,
-- OR better: just rely on the index.
