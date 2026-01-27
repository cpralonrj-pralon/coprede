-- Remove Foreign Key constraint to allow 'orphaned' coverage rows
-- This fixes Error 23503 when the coverage file contains incidents not present in the main incidents file.

ALTER TABLE public.reincidencia_abrangencia DROP CONSTRAINT IF EXISTS fk_reincidencia_incidente;
