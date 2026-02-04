ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS nm_organizacao_tratamento text,
ADD COLUMN IF NOT EXISTS nm_grupo_tratamento text;
