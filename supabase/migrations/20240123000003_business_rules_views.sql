-- Adicionando coluna faltante para regras de negócio (Segmento)
alter table public.dim_operacional add column if not exists segmento_rede text;

-- 1. View: ETIT HFC
-- Regra: Interrupção/Performance, Emergencial, HFC, !MDU, Com Tarefa TOA
create or replace view public.view_indicador_etit_hfc as
select 
    loc.regional,
    date_trunc('month', f.dt_inicio) as mes_referencia,
    count(f.id) as volume_total,
    
    -- Volume Dentro do Prazo (Numerador)
    sum(case 
        -- Regra Não Massivo: Inicio Tarefa - Chegada Fila FO <= 30min
        when op.natureza != 'Massivo' 
             and extract(epoch from (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 
        then 1
        
        -- Regra Massivo: Inicio Tarefa - Abertura Outage <= 30min
        when op.natureza = 'Massivo'
             and extract(epoch from (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30
        then 1
        else 0
    end) as volume_prazo,
    
    -- Cálculo do Indicador (%)
    round(
        (sum(case 
            when op.natureza != 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 then 1
            when op.natureza = 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 then 1
            else 0
        end)::numeric / count(f.id)::numeric) * 100, 2
    ) as resultado_percentual

from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
join public.dim_localidade loc on f.localidade_id = loc.id
join public.dim_tempo_operacional tempo on f.tempo_operacional_id = tempo.id
where 
    op.sintoma in ('Interrupção', 'Performance')
    and op.natureza = 'Emergencial'
    and op.tecnologia = 'HFC'
    and (op.segmento_rede is null or op.segmento_rede != 'MDU')
    and f.enviado_toa = true -- "Deve ter ao menos uma tarefa válida no TOA"
group by 1, 2;

-- 2. View: ETIT GPON
-- Regra: Interrupção/Performance, Emergencial, GPON, !MDU, Com Tarefa
create or replace view public.view_indicador_etit_gpon as
select 
    loc.regional,
    date_trunc('month', f.dt_inicio) as mes_referencia,
    count(f.id) as volume_total,
    
    -- Volume Dentro do Prazo (Numerador)
    -- Regra: Abertura Tarefa - Abertura Outage <= 15min
    sum(case 
        when extract(epoch from (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 
        then 1 
        else 0 
    end) as volume_prazo,
    
    -- Cálculo (%)
    round(
        (sum(case when extract(epoch from (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 then 1 else 0 end)::numeric 
        / count(f.id)::numeric) * 100, 2
    ) as resultado_percentual

from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
join public.dim_localidade loc on f.localidade_id = loc.id
join public.dim_tempo_operacional tempo on f.tempo_operacional_id = tempo.id
where 
    op.sintoma in ('Interrupção', 'Performance')
    and op.natureza = 'Emergencial'
    and op.tecnologia = 'GPON'
    and (op.segmento_rede is null or op.segmento_rede != 'MDU')
    and f.enviado_toa = true
group by 1, 2;

-- 3. View: IIS (Índice de Instabilidade sistêmica?)
-- Regra: Emergencial, Interrupção/Performance, !MDU, Fechamento especifico
create or replace view public.view_indicador_iis as
select 
    loc.regional,
    date_trunc('month', f.dt_inicio) as mes_referencia,
    
    -- Volume Total (Denominador?) - As imagens não deixam claro se é % ou absoluto, assumindo absoluto de improdutivos ou % de sucesso.
    -- O texto diz "Volume Improdutivo: IIS24 > 24h". Geralmente IIS é um ofensor.
    -- Vamos listar o volume de ofensores > 24h.
    
    sum(case 
        when op.sintoma = 'Interrupção' and extract(epoch from (f.dt_fim - f.dt_inicio))/3600 > 24 then 1
        when op.sintoma = 'Performance' and extract(epoch from (f.dt_fim - f.dt_inicio))/3600 > 24 then 1
        else 0
    end) as volume_iis_24h,
    
    count(f.id) as volume_elegivel

from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
join public.dim_localidade loc on f.localidade_id = loc.id
where 
    op.natureza = 'Emergencial'
    and op.sintoma in ('Interrupção', 'Performance')
    and (op.segmento_rede is null or op.segmento_rede != 'MDU')
    and op.fechamento in ('Rede Coaxial', 'Fonte', 'Rede Óptica')
group by 1, 2;
