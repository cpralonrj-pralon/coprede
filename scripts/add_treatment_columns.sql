-- Add Treatment Columns to Incidents Table
-- Use this to ensure backend can save Organization and Group treatment info.

ALTER TABLE public.incidents 
  ADD COLUMN IF NOT EXISTS nm_organizacao_tratamento text,
  ADD COLUMN IF NOT EXISTS nm_grupo_tratamento text;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_incidents_org_tratamento ON public.incidents(nm_organizacao_tratamento);
CREATE INDEX IF NOT EXISTS idx_incidents_grp_tratamento ON public.incidents(nm_grupo_tratamento);
