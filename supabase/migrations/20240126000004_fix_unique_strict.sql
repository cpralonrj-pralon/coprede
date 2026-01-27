-- Fix 42P10: Create a concrete constraint for ON CONFLICT usage

-- 1. Sanitize NULLs to empty strings to allow strict uniqueness
UPDATE public.reincidencia_abrangencia SET node = '' WHERE node IS NULL;
UPDATE public.reincidencia_abrangencia SET nap = '' WHERE nap IS NULL;
UPDATE public.reincidencia_abrangencia SET celula = '' WHERE celula IS NULL;

-- 2. Clean up previous indexes/constraints
DROP INDEX IF EXISTS idx_reincidencia_abrangencia_unique_element;
ALTER TABLE public.reincidencia_abrangencia DROP CONSTRAINT IF EXISTS reincidencia_abrangencia_cod_incidente_key;
ALTER TABLE public.reincidencia_abrangencia DROP CONSTRAINT IF EXISTS reincidencia_abrangencia_unique_composite; -- safely drop checks

-- 3. Add the definitive UNIQUE constraint
ALTER TABLE public.reincidencia_abrangencia 
ADD CONSTRAINT reincidencia_abrangencia_unique_composite 
UNIQUE (incidente, node, nap, celula);
