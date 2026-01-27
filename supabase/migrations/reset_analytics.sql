-- DANGER: DATA RESET SCRIPT
-- Limpa TODAS as tabelas do Analytics (Fato e Dimensões) e reinicia os IDs.

TRUNCATE TABLE 
    public.fact_indicadores_residencial,
    public.dim_localidade,
    public.dim_operacional,
    public.dim_tempo_operacional
RESTART IDENTITY CASCADE;

-- Se precisar limparLogs de Ingestão também:
-- TRUNCATE TABLE public.ingestion_logs RESTART IDENTITY CASCADE;
