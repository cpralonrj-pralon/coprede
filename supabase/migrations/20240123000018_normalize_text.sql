-- FIX FINAL DE PADRONIZAÇÃO DE TEXTO (Script 018)
-- O banco tem dados em MAIÚSCULO e SEM ACENTO (ex: 'INTERRUPCAO', 'EMERGENCIAL').
-- As Views esperavam 'Interrupção' e 'Emergencial'.
-- Este script ajusta as Views para aceitar TUDO (Maiúsculo/Minúsculo/Com/Sem Acento).

-- View: ETIT HFC
CREATE OR REPLACE VIEW public.view_indicador_etit_hfc AS
SELECT 
    loc.regional,
    date_trunc('month', f.dt_inicio) AS mes_referencia,
    count(f.id) AS volume_total,
    -- Regra de Prazo HFC
    sum(CASE 
        WHEN UPPER(op.natureza) != 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 THEN 1
        WHEN UPPER(op.natureza) = 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 THEN 1
        ELSE 0
    END) AS volume_prazo,
    -- Percentual HFC
    round((sum(CASE 
        WHEN UPPER(op.natureza) != 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 THEN 1
        WHEN UPPER(op.natureza) = 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 THEN 1
        ELSE 0
    END)::numeric / count(f.id)::numeric) * 100, 2) AS resultado_percentual
FROM public.fact_indicadores_residencial f
JOIN public.dim_operacional op ON f.operacional_id = op.id
JOIN public.dim_localidade loc ON f.localidade_id = loc.id
JOIN public.dim_tempo_operacional tempo ON f.tempo_operacional_id = tempo.id
WHERE 
  -- Filtro Sintoma Flexível (Pega 'INTERRUPCAO', 'Interrupção', etc)
  (UPPER(op.sintoma) LIKE 'INTERRUP%' OR UPPER(op.sintoma) = 'PERFORMANCE')
  AND UPPER(op.natureza) = 'EMERGENCIAL'
  AND UPPER(op.tecnologia) = 'HFC'
  AND (op.segmento_rede IS NULL OR op.segmento_rede != 'MDU')
  AND (f.enviado_toa = true OR f.enviado_toa IS NULL)
GROUP BY 1, 2;

-- View: ETIT GPON
CREATE OR REPLACE VIEW public.view_indicador_etit_gpon AS
SELECT 
    loc.regional,
    date_trunc('month', f.dt_inicio) AS mes_referencia,
    count(f.id) AS volume_total,
    sum(CASE WHEN extract(epoch FROM (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 THEN 1 ELSE 0 END) AS volume_prazo,
    round((sum(CASE WHEN extract(epoch FROM (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 THEN 1 ELSE 0 END)::numeric / count(f.id)::numeric) * 100, 2) AS resultado_percentual
FROM public.fact_indicadores_residencial f
JOIN public.dim_operacional op ON f.operacional_id = op.id
JOIN public.dim_localidade loc ON f.localidade_id = loc.id
JOIN public.dim_tempo_operacional tempo ON f.tempo_operacional_id = tempo.id
WHERE 
  (UPPER(op.sintoma) LIKE 'INTERRUP%' OR UPPER(op.sintoma) = 'PERFORMANCE')
  AND UPPER(op.natureza) = 'EMERGENCIAL'
  AND UPPER(op.tecnologia) = 'GPON'
  AND (op.segmento_rede IS NULL OR op.segmento_rede != 'MDU')
  AND (f.enviado_toa = true OR f.enviado_toa IS NULL)
GROUP BY 1, 2;

-- View: IIS
CREATE OR REPLACE VIEW public.view_indicador_iis AS
SELECT 
    loc.regional,
    date_trunc('month', f.dt_inicio) AS mes_referencia,
    sum(CASE 
        WHEN UPPER(op.sintoma) LIKE 'INTERRUP%' AND extract(epoch FROM (f.dt_fim - f.dt_inicio))/3600 > 24 THEN 1
        WHEN UPPER(op.sintoma) = 'PERFORMANCE' AND extract(epoch FROM (f.dt_fim - f.dt_inicio))/3600 > 24 THEN 1
        ELSE 0
    END) AS volume_iis_24h,
    count(f.id) AS volume_elegivel
FROM public.fact_indicadores_residencial f
JOIN public.dim_operacional op ON f.operacional_id = op.id
JOIN public.dim_localidade loc ON f.localidade_id = loc.id
WHERE 
  UPPER(op.natureza) = 'EMERGENCIAL'
  AND (UPPER(op.sintoma) LIKE 'INTERRUP%' OR UPPER(op.sintoma) = 'PERFORMANCE')
  AND (op.segmento_rede IS NULL OR op.segmento_rede != 'MDU')
  -- Filtro de Fechamento Flexível (Aceita 'Rede Coaxial', 'REDE COAXIAL', etc)
  AND (UPPER(op.fechamento) IN ('REDE COAXIAL', 'FONTE', 'REDE OPTICA', 'REDE ÓPTICA'))
GROUP BY 1, 2;

-- View: Evolution
CREATE OR REPLACE VIEW public.view_analytics_evolution AS
WITH monthly_stats AS (
    SELECT 
        date_trunc('month', f.dt_inicio) AS mes_data,
        extract(year FROM f.dt_inicio) AS ano,
        to_char(f.dt_inicio, 'Mon') AS mes_nome,
        count(CASE WHEN UPPER(op.tecnologia) = 'HFC' THEN 1 END) AS total_hfc,
        sum(CASE 
            WHEN UPPER(op.tecnologia) = 'HFC' AND UPPER(op.natureza) != 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 THEN 1
            WHEN UPPER(op.tecnologia) = 'HFC' AND UPPER(op.natureza) = 'MASSIVO' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 THEN 1
            ELSE 0 
        END) AS prazo_hfc,
        count(CASE WHEN UPPER(op.tecnologia) = 'GPON' THEN 1 END) AS total_gpon,
        sum(CASE 
            WHEN UPPER(op.tecnologia) = 'GPON' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 THEN 1 
            ELSE 0 
        END) AS prazo_gpon
    FROM public.fact_indicadores_residencial f
    JOIN public.dim_operacional op ON f.operacional_id = op.id
    JOIN public.dim_tempo_operacional tempo ON f.tempo_operacional_id = tempo.id
    WHERE UPPER(op.natureza) = 'EMERGENCIAL'
    GROUP BY 1, 2, 3
)
SELECT 
    mes_data, mes_nome, ano,
    CASE WHEN total_hfc > 0 THEN round((prazo_hfc::numeric / total_hfc::numeric) * 100, 2) ELSE 0 END AS etit_hfc,
    CASE WHEN total_gpon > 0 THEN round((prazo_gpon::numeric / total_gpon::numeric) * 100, 2) ELSE 0 END AS etit_gpon
FROM monthly_stats
ORDER BY mes_data;
