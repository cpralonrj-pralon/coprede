-- NUCLEAR REPAIR SCRIPT 011
-- Este script resolve o erro "42P10" forçando a limpeza e re-criação da regra Única.

BEGIN; -- Inicia transação segura

-- 1. Limpeza de Duplicatas (Método Infalível via Window Function)
-- Mantém apenas o registro mais recente (maior ID) para cada id_mostra
DELETE FROM public.fact_indicadores_residencial
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY id_mostra ORDER BY created_at DESC, id DESC) as r_num
        FROM public.fact_indicadores_residencial
    ) t
    WHERE t.r_num > 1
);

-- 2. Remove a constraint se existir (para recriar limpo)
ALTER TABLE public.fact_indicadores_residencial 
DROP CONSTRAINT IF EXISTS fact_indicadores_id_mostra_unique;

ALTER TABLE public.fact_indicadores_residencial 
DROP CONSTRAINT IF EXISTS fact_indicadores_residencial_id_mostra_key;

-- 3. Cria índice único EXPLICITAMENTE
CREATE UNIQUE INDEX IF NOT EXISTS idx_fact_indicadores_residencial_id_mostra 
ON public.fact_indicadores_residencial (id_mostra);

-- 4. Aplica a Constraint usando o Índice
ALTER TABLE public.fact_indicadores_residencial 
ADD CONSTRAINT fact_indicadores_id_mostra_unique 
UNIQUE USING INDEX idx_fact_indicadores_residencial_id_mostra;

COMMIT; -- Confirma tudo
