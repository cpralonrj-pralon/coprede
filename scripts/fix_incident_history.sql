-- Fix Incident History Schema
-- This script adds the columns required by the backend to track incident changes (Traceability).

ALTER TABLE public.incident_history 
  ADD COLUMN IF NOT EXISTS campo_alterado text,
  ADD COLUMN IF NOT EXISTS valor_anterior text,
  ADD COLUMN IF NOT EXISTS valor_novo text,
  ADD COLUMN IF NOT EXISTS alterado_por text,
  ADD COLUMN IF NOT EXISTS alterado_em timestamptz DEFAULT now();

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_incident_history_alterado_em ON public.incident_history(alterado_em);

-- Optional: Copy legacy timestamp if needed to preserve old status changes
-- UPDATE public.incident_history 
-- SET alterado_em = changed_at 
-- WHERE alterado_em IS NULL AND changed_at IS NOT NULL;
