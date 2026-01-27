-- Migration: Make Views robust against Case/Accent differences
-- Logic: Use ILIKE and wildcards instead of exact matches

-- 1. Drop existing Views
DROP VIEW IF EXISTS public.view_indicador_etit_hfc CASCADE;
DROP VIEW IF EXISTS public.view_indicador_etit_gpon CASCADE;
DROP VIEW IF EXISTS public.view_indicador_iis CASCADE;

-- 2. ETIT HFC
CREATE VIEW public.view_indicador_etit_hfc AS
SELECT 
    loc.regional,
    loc.grupo,
    date_trunc('month', f.dt_inicio) AS mes_referencia,
    count(f.id) AS volume_total,
    sum(CASE 
        WHEN op.natureza NOT ILIKE 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 THEN 1
        WHEN op.natureza ILIKE 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 THEN 1
        ELSE 0
    END) AS volume_prazo,
    round((sum(CASE 
        WHEN op.natureza NOT ILIKE 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 THEN 1
        WHEN op.natureza ILIKE 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 THEN 1
        ELSE 0
    END)::numeric / count(f.id)::numeric) * 100, 2) AS resultado_percentual
FROM public.fact_indicadores_residencial f
JOIN public.dim_operacional op ON f.operacional_id = op.id
JOIN public.dim_localidade loc ON f.localidade_id = loc.id
JOIN public.dim_tempo_operacional tempo ON f.tempo_operacional_id = tempo.id
WHERE (op.sintoma ILIKE 'INTERRUP%' OR op.sintoma ILIKE 'PERFOR%' OR op.sintoma ILIKE 'LENTID%')
  AND op.natureza ILIKE 'EMERGENC%'
  AND op.tecnologia ILIKE 'HFC'
  AND (op.segmento_rede IS NULL OR op.segmento_rede NOT ILIKE 'MDU')
  AND (f.enviado_toa = true OR f.enviado_toa IS NULL)
GROUP BY 1, 2, 3;

-- 3. ETIT GPON
CREATE VIEW public.view_indicador_etit_gpon AS
SELECT 
    loc.regional,
    loc.grupo,
    date_trunc('month', f.dt_inicio) AS mes_referencia,
    count(f.id) AS volume_total,
    sum(CASE WHEN extract(epoch FROM (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 THEN 1 ELSE 0 END) AS volume_prazo,
    round((sum(CASE WHEN extract(epoch FROM (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 THEN 1 ELSE 0 END)::numeric / count(f.id)::numeric) * 100, 2) AS resultado_percentual
FROM public.fact_indicadores_residencial f
JOIN public.dim_operacional op ON f.operacional_id = op.id
JOIN public.dim_localidade loc ON f.localidade_id = loc.id
JOIN public.dim_tempo_operacional tempo ON f.tempo_operacional_id = tempo.id
WHERE (op.sintoma ILIKE 'INTERRUP%' OR op.sintoma ILIKE 'PERFOR%' OR op.sintoma ILIKE 'LENTID%')
  AND op.natureza ILIKE 'EMERGENC%'
  AND op.tecnologia ILIKE 'GPON'
  AND (op.segmento_rede IS NULL OR op.segmento_rede NOT ILIKE 'MDU')
  AND (f.enviado_toa = true OR f.enviado_toa IS NULL)
GROUP BY 1, 2, 3;

-- 4. IIS
CREATE VIEW public.view_indicador_iis AS
SELECT 
    loc.regional,
    loc.grupo, -- Added 'grupo' here too just in case
    date_trunc('month', f.dt_inicio) AS mes_referencia,
    sum(CASE 
        WHEN op.sintoma ILIKE 'INTERRUP%' AND extract(epoch FROM (f.dt_fim - f.dt_inicio))/3600 > 24 THEN 1
        WHEN (op.sintoma ILIKE 'PERFOR%' OR op.sintoma ILIKE 'LENTID%') AND extract(epoch FROM (f.dt_fim - f.dt_inicio))/3600 > 24 THEN 1
        ELSE 0
    END) AS volume_iis_24h,
    count(f.id) AS volume_elegivel
FROM public.fact_indicadores_residencial f
JOIN public.dim_operacional op ON f.operacional_id = op.id
JOIN public.dim_localidade loc ON f.localidade_id = loc.id
WHERE op.natureza ILIKE 'EMERGENC%'
  AND (op.sintoma ILIKE 'INTERRUP%' OR op.sintoma ILIKE 'PERFOR%' OR op.sintoma ILIKE 'LENTID%')
  AND (op.segmento_rede IS NULL OR op.segmento_rede NOT ILIKE 'MDU')
GROUP BY 1, 2, 3;
