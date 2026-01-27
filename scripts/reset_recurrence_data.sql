-- Zerar tabelas de Reincidência (Incidentes e Abrangência)
-- O CASCADE garante que a ordem não importa e limpa as dependências.
-- RESTART IDENTITY reseta os IDs auto-incrementais (se houver).

TRUNCATE TABLE public.reincidencia_incidentes, public.reincidencia_abrangencia RESTART IDENTITY CASCADE;

-- Verificação (deve retornar 0)
SELECT count(*) as total_incidentes FROM public.reincidencia_incidentes;
SELECT count(*) as total_abrangencia FROM public.reincidencia_abrangencia;
