-- 1. View: Evolution (Monthly Trend for ETIT HFC & GPON)
create or replace view public.view_analytics_evolution as
with monthly_stats as (
    select 
        date_trunc('month', f.dt_inicio) as mes_data,
        extract(year from f.dt_inicio) as ano,
        to_char(f.dt_inicio, 'Mon') as mes_nome,
        
        -- HFC Calc
        count(case when op.tecnologia = 'HFC' then 1 end) as total_hfc,
        sum(case 
            when op.tecnologia = 'HFC' and op.natureza != 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - tempo.dt_inicio_chegou_cop_fo))/60 <= 30 then 1
            when op.tecnologia = 'HFC' and op.natureza = 'Massivo' and extract(epoch from (tempo.dt_primeiro_acionamento_fo - f.dt_inicio))/60 <= 30 then 1
            else 0 
        end) as prazo_hfc,

        -- GPON Calc
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
    mes_data,
    mes_nome,
    ano,
    case when total_hfc > 0 then round((prazo_hfc::numeric / total_hfc::numeric) * 100, 2) else 0 end as etit_hfc,
    case when total_gpon > 0 then round((prazo_gpon::numeric / total_gpon::numeric) * 100, 2) else 0 end as etit_gpon
from monthly_stats
order by mes_data;

-- 2. View: Pareto (Offenders & Solutions)
-- Returns a unified list with 'category' to filter by (Sintoma vs Solucao)
create or replace view public.view_analytics_pareto as
select 
    'Sintoma' as categoria,
    op.sintoma as nome,
    count(f.id) as volume
from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
where op.sintoma is not null
group by 2

union all

select 
    'Solucao' as categoria,
    op.solucao as nome,
    count(f.id) as volume
from public.fact_indicadores_residencial f
join public.dim_operacional op on f.operacional_id = op.id
where op.solucao is not null
group by 2;
