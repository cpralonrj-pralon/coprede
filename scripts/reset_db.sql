-- Limpeza TOTAL da tabela de incidentes
-- Use isso se quiser zerar o Dashboard para começar a ingestão oficial do zero

TRUNCATE TABLE public.incidents CASCADE;
TRUNCATE TABLE public.ingestion_logs CASCADE;

-- (Opcional) Resetar sequencias se houver (UUIDs não precisam)
