-- UNIVERSAL REPAIR SCRIPT 013
-- Resolve erro 42P10 re-aplicando constraints em TODAS as tabelas (Dimensões + Fato)
-- Se o erro persiste, é porque as Dimensões também perderam suas regras de unicidade.

BEGIN;

-- =================================================================
-- 1. DIM LOCALIDADE (Limpeza + Constraint)
-- =================================================================
-- Remover duplicatas
DELETE FROM public.dim_localidade a USING public.dim_localidade b
WHERE a.id < b.id 
  AND a.regional = b.regional 
  AND a.grupo = b.grupo 
  AND a.cidade_uf = b.cidade_uf 
  AND a.uf = b.uf;

-- Recriar Constraint
ALTER TABLE public.dim_localidade DROP CONSTRAINT IF EXISTS dim_localidade_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_dim_localidade_unique ON public.dim_localidade (regional, grupo, cidade_uf, uf);
ALTER TABLE public.dim_localidade ADD CONSTRAINT dim_localidade_unique UNIQUE USING INDEX idx_dim_localidade_unique;


-- =================================================================
-- 2. DIM OPERACIONAL (Limpeza + Constraint)
-- =================================================================
-- Remover duplicatas
DELETE FROM public.dim_operacional a USING public.dim_operacional b
WHERE a.id < b.id 
  AND a.tecnologia = b.tecnologia 
  AND a.servico = b.servico
  AND a.natureza = b.natureza
  AND a.sintoma = b.sintoma
  AND a.ferramenta_abertura = b.ferramenta_abertura
  AND a.fechamento = b.fechamento
  AND a.solucao = b.solucao;

-- Recriar Constraint
ALTER TABLE public.dim_operacional DROP CONSTRAINT IF EXISTS dim_operacional_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_dim_operacional_unique ON public.dim_operacional (tecnologia, servico, natureza, sintoma, ferramenta_abertura, fechamento, solucao);
ALTER TABLE public.dim_operacional ADD CONSTRAINT dim_operacional_unique UNIQUE USING INDEX idx_dim_operacional_unique;


-- =================================================================
-- 3. FACT INDICADORES (Garantia Final)
-- =================================================================
-- Apenas garantindo que o índice existe, caso o script 011 tenha falhado
CREATE UNIQUE INDEX IF NOT EXISTS idx_fact_indicadores_residencial_id_mostra ON public.fact_indicadores_residencial (id_mostra);
-- Se não existir a constraint, adiciona
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fact_indicadores_id_mostra_unique') THEN
        ALTER TABLE public.fact_indicadores_residencial ADD CONSTRAINT fact_indicadores_id_mostra_unique UNIQUE USING INDEX idx_fact_indicadores_residencial_id_mostra;
    END IF;
END $$;

COMMIT;
