-- FIX DE VISIBILIDADE (Script 017)
-- O Frontend não estava enviando 'enviado_toa', então ficava NULL no banco.
-- As Views filtravam "WHERE enviado_toa = true", escondendo tudo.
-- Este script atualiza as Views para aceitar NULL como True.

-- View: ETIT HFC
CREATE OR REPLACE VIEW public.view_indicador_etit_hfc AS
SELECT 
    loc.regional,
    date_trunc('month', f.dt_inicio) AS mes_referencia,
    count(f.id) AS volume_total,
    sum(CASE 
        WHEN op.natureza != 'Massivo' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 THEN 1
        WHEN op.natureza = 'Massivo' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 THEN 1
        ELSE 0
    END) AS volume_prazo,
    round((sum(CASE 
        WHEN op.natureza != 'Massivo' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 THEN 1
        WHEN op.natureza = 'Massivo' AND extract(epoch FROM (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 THEN 1
        ELSE 0
    END)::numeric / count(f.id)::numeric) * 100, 2) AS resultado_percentual
FROM public.fact_indicadores_residencial f
JOIN public.dim_operacional op ON f.operacional_id = op.id
JOIN public.dim_localidade loc ON f.localidade_id = loc.id
JOIN public.dim_tempo_operacional tempo ON f.tempo_operacional_id = tempo.id
WHERE op.sintoma IN ('Interrupção', 'Performance')
  AND op.natureza = 'Emergencial'
  AND op.tecnologia = 'HFC'
  AND (op.segmento_rede IS NULL OR op.segmento_rede != 'MDU')
  -- FIX: Aceita True OU Null
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
WHERE op.sintoma IN ('Interrupção', 'Performance')
  AND op.natureza = 'Emergencial'
  AND op.tecnologia = 'GPON'
  AND (op.segmento_rede IS NULL OR op.segmento_rede != 'MDU')
  -- FIX: Aceita True OU Null
  AND (f.enviado_toa = true OR f.enviado_toa IS NULL)
GROUP BY 1, 2;
