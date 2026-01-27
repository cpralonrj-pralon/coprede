-- EMERGENCY REPAIR SCRIPT 006
-- This script explicitly checks/adds the missing columns that are causing the 42703 error
-- It handles the scenario where the table exists but the FK columns do not.

do $$ 
begin
    -- 1. Ensure 'fact_indicadores_residencial' exists, if not, we can't alter it (create handled by prev migration, but just in case)
    if exists (select from information_schema.tables where table_name = 'fact_indicadores_residencial') then
        
        -- 2. Add 'operacional_id' if missing
        if not exists (select 1 from information_schema.columns where table_name = 'fact_indicadores_residencial' and column_name = 'operacional_id') then
            alter table public.fact_indicadores_residencial add column operacional_id uuid references public.dim_operacional(id);
        end if;

        -- 3. Add 'localidade_id' if missing
        if not exists (select 1 from information_schema.columns where table_name = 'fact_indicadores_residencial' and column_name = 'localidade_id') then
            alter table public.fact_indicadores_residencial add column localidade_id uuid references public.dim_localidade(id);
        end if;

        -- 4. Add 'tempo_operacional_id' if missing
        if not exists (select 1 from information_schema.columns where table_name = 'fact_indicadores_residencial' and column_name = 'tempo_operacional_id') then
            alter table public.fact_indicadores_residencial add column tempo_operacional_id uuid references public.dim_tempo_operacional(id);
        end if;

    end if;
end $$;

-- 5. Force Re-Creation of Views (Now that columns are guaranteed)

drop view if exists public.view_analytics_pareto;
drop view if exists public.view_analytics_evolution;
drop view if exists public.view_indicador_iis;
drop view if exists public.view_indicador_etit_gpon;
drop view if exists public.view_indicador_etit_hfc;

create or replace view public.view_indicador_etit_hfc as
select 
    loc.regional,
    date_trunc('month', f.dt_inicio) as mes_referencia,
    count(f.id) as volume_total,
    sum(case 
        when op.natureza != 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 then 1
        when op.natureza = 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 then 1
        else 0
    end) as volume_prazo,
    round((sum(case 
        when op.natureza != 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 then 1
        when op.natureza = 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 then 1
        else 0
    end)::numeric / count(f.id)::numeric) * 100, 2) as resultado_percentual
from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
join public.dim_localidade loc on f.localidade_id = loc.id
join public.dim_tempo_operacional tempo on f.tempo_operacional_id = tempo.id
where op.sintoma in ('Interrupção', 'Performance')
  and op.natureza = 'Emergencial'
  and op.tecnologia = 'HFC'
  and (op.segmento_rede is null or op.segmento_rede != 'MDU')
  and f.enviado_toa = true
group by 1, 2;

create or replace view public.view_indicador_etit_gpon as
select 
    loc.regional,
    date_trunc('month', f.dt_inicio) as mes_referencia,
    count(f.id) as volume_total,
    sum(case when extract(epoch from (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 then 1 else 0 end) as volume_prazo,
    round((sum(case when extract(epoch from (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 then 1 else 0 end)::numeric / count(f.id)::numeric) * 100, 2) as resultado_percentual
from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
join public.dim_localidade loc on f.localidade_id = loc.id
join public.dim_tempo_operacional tempo on f.tempo_operacional_id = tempo.id
where op.sintoma in ('Interrupção', 'Performance')
  and op.natureza = 'Emergencial'
  and op.tecnologia = 'GPON'
  and (op.segmento_rede is null or op.segmento_rede != 'MDU')
  and f.enviado_toa = true
group by 1, 2;

create or replace view public.view_indicador_iis as
select 
    loc.regional,
    date_trunc('month', f.dt_inicio) as mes_referencia,
    sum(case 
        when op.sintoma = 'Interrupção' and extract(epoch from (f.dt_fim - f.dt_inicio))/3600 > 24 then 1
        when op.sintoma = 'Performance' and extract(epoch from (f.dt_fim - f.dt_inicio))/3600 > 24 then 1
        else 0
    end) as volume_iis_24h,
    count(f.id) as volume_elegivel
from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
join public.dim_localidade loc on f.localidade_id = loc.id
where op.natureza = 'Emergencial'
  and op.sintoma in ('Interrupção', 'Performance')
  and (op.segmento_rede is null or op.segmento_rede != 'MDU')
  and op.fechamento in ('Rede Coaxial', 'Fonte', 'Rede Óptica')
group by 1, 2;

create or replace view public.view_analytics_evolution as
with monthly_stats as (
    select 
        date_trunc('month', f.dt_inicio) as mes_data,
        extract(year from f.dt_inicio) as ano,
        to_char(f.dt_inicio, 'Mon') as mes_nome,
        count(case when op.tecnologia = 'HFC' then 1 end) as total_hfc,
        sum(case 
            when op.tecnologia = 'HFC' and op.natureza != 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 then 1
            when op.tecnologia = 'HFC' and op.natureza = 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 then 1
            else 0 
        end) as prazo_hfc,
        count(case when op.tecnologia = 'GPON' then 1 end) as total_gpon,
        sum(case 
            when op.tecnologia = 'GPON' and extract(epoch from (tempo.dt_primeiro_acionamento_gpon - f.dt_inicio))/60 <= 15 then 1 
            else 0 
        end) as prazo_gpon
    from public.fact_indicadores_residencial f
    join public.dim_operacional op on f.operacional_id = op.id
    join public.dim_tempo_operacional tempo on f.tempo_operacional_id = tempo.id
    where op.natureza = 'Emergencial'
    group by 1, 2, 3
)
select 
    mes_data, mes_nome, ano,
    case when total_hfc > 0 then round((prazo_hfc::numeric / total_hfc::numeric) * 100, 2) else 0 end as etit_hfc,
    case when total_gpon > 0 then round((prazo_gpon::numeric / total_gpon::numeric) * 100, 2) else 0 end as etit_gpon
from monthly_stats
order by mes_data;

create or replace view public.view_analytics_pareto as
select 'Sintoma' as categoria, op.sintoma as nome, count(f.id) as volume
from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
where op.sintoma is not null group by 2
union all
select 'Solucao' as categoria, op.solucao as nome, count(f.id) as volume
from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
where op.solucao is not null group by 2;
