-- Migration to clean old/incorrect data (pre-2026)
-- Run this if you want to remove 2025 dates that were ingested by mistake

DELETE FROM public.reincidencia_incidentes 
WHERE 
   COALESCE(dh_inicio, dh_created) < '2026-01-01'
   OR 
   dh_inicio IS NULL; -- Optional: Clean nulls if they are bugs

-- Also clean orphans in coverage table (optional, but good practice due to CASCADE missing in some setups)
DELETE FROM public.reincidencia_abrangencia
WHERE incidente NOT IN (SELECT incidente FROM public.reincidencia_incidentes);
