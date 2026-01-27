-- 1. Dimension: Localidade
create table if not exists public.dim_localidade (
    id uuid default uuid_generate_v4() primary key,
    regional text,
    grupo text,
    cidade_uf text,
    uf text,
    
    -- Constraint to avoid duplicates (Natural Key)
    constraint dim_localidade_unique unique (regional, grupo, cidade_uf, uf)
);

-- 2. Dimension: Operacional
create table if not exists public.dim_operacional (
    id uuid default uuid_generate_v4() primary key,
    tecnologia text,
    servico text,
    natureza text,
    sintoma text,
    ferramenta_abertura text,
    fechamento text,
    solucao text,
    
    -- Constraint for deduplication
    constraint dim_operacional_unique unique (tecnologia, servico, natureza, sintoma, ferramenta_abertura, fechamento, solucao)
);

-- 3. Dimension: Tempo Operacional (1:1 with Fact usually, or shared if specific timestamps recur)
-- Given the specific timestamps, this acts more like a vertical partition or 'Event State', but we treat as Dim per request.
create table if not exists public.dim_tempo_operacional (
    id uuid default uuid_generate_v4() primary key,
    dt_em_progresso timestamptz,
    dt_designado timestamptz,
    dt_primeiro_acionamento_rf timestamptz,
    dt_primeiro_acionamento_fo timestamptz,
    dt_primeiro_acionamento_gpon timestamptz,
    dt_inicio_chegou_cop_fo timestamptz
);

-- 4. Fact Table: Indicadores Residencial
create table if not exists public.fact_indicadores_residencial (
    id uuid default uuid_generate_v4() primary key,
    id_mostra text unique not null, -- Deduplication Key
    
    -- Foreign Keys
    localidade_id uuid references public.dim_localidade(id),
    operacional_id uuid references public.dim_operacional(id),
    tempo_operacional_id uuid references public.dim_tempo_operacional(id),
    
    -- Metrics & Attributes
    indicador_nome text,
    indicador_valor numeric,
    indicador_status text,
    volume integer,
    
    tma numeric,
    tmr numeric,
    
    impacto text,
    enviado_toa boolean,
    
    dt_inicio timestamptz,
    dt_fim timestamptz,
    dt_inicio_sistema timestamptz,
    dt_fim_sistema timestamptz,
    dt_fim_sistema_primeiro_fechamento timestamptz,
    
    anomes integer, -- YYYYMM
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.dim_localidade enable row level security;
alter table public.dim_operacional enable row level security;
alter table public.dim_tempo_operacional enable row level security;
alter table public.fact_indicadores_residencial enable row level security;

-- Policies (Read All Authenticated, Write Service Role)
create policy "Auth Read Localidade" on public.dim_localidade for select to authenticated using (true);
create policy "Auth Read Operacional" on public.dim_operacional for select to authenticated using (true);
create policy "Auth Read Tempo" on public.dim_tempo_operacional for select to authenticated using (true);
create policy "Auth Read Fact" on public.fact_indicadores_residencial for select to authenticated using (true);

-- Realtime
alter publication supabase_realtime add table public.fact_indicadores_residencial;

-- 5. Helper Function for Ingestion (Simplifies N8N work)
-- Allows inserting a flat JSON and the DB splits it into Star Schema
create or replace function public.ingest_flat_indicador(
    p_id_mostra text,
    p_regional text, p_grupo text, p_cidade_uf text, p_uf text, -- Localidade
    p_tecnologia text, p_servico text, p_natureza text, p_sintoma text, p_ferramenta text, p_fechamento text, p_solucao text, -- Operacional
    p_timestamps jsonb, -- All time fields
    p_metrics jsonb -- All metric fields
) returns void as $$
declare
    v_localidade_id uuid;
    v_operacional_id uuid;
    v_tempo_id uuid;
begin
    -- 1. Upsert Dim Localidade
    insert into public.dim_localidade (regional, grupo, cidade_uf, uf)
    values (p_regional, p_grupo, p_cidade_uf, p_uf)
    on conflict (regional, grupo, cidade_uf, uf) do update set uf = excluded.uf -- dummy update to return id
    returning id into v_localidade_id;
    
    -- 2. Upsert Dim Operacional
    insert into public.dim_operacional (tecnologia, servico, natureza, sintoma, ferramenta_abertura, fechamento, solucao)
    values (p_tecnologia, p_servico, p_natureza, p_sintoma, p_ferramenta, p_fechamento, p_solucao)
    on conflict (tecnologia, servico, natureza, sintoma, ferramenta_abertura, fechamento, solucao) do update set servico = excluded.servico
    returning id into v_operacional_id;
    
    -- 3. Insert Dim Tempo (Assuming 1:1 and unique per incident)
    insert into public.dim_tempo_operacional (
        dt_em_progresso, dt_designado, dt_primeiro_acionamento_rf, 
        dt_primeiro_acionamento_fo, dt_primeiro_acionamento_gpon, dt_inicio_chegou_cop_fo
    ) values (
        (p_timestamps->>'dt_em_progresso')::timestamptz,
        (p_timestamps->>'dt_designado')::timestamptz,
        (p_timestamps->>'dt_primeiro_acionamento_rf')::timestamptz,
        (p_timestamps->>'dt_primeiro_acionamento_fo')::timestamptz,
        (p_timestamps->>'dt_primeiro_acionamento_gpon')::timestamptz,
        (p_timestamps->>'dt_inicio_chegou_cop_fo')::timestamptz
    ) returning id into v_tempo_id;
    
    -- 4. Upsert Fact Table
    insert into public.fact_indicadores_residencial (
        id_mostra, localidade_id, operacional_id, tempo_operacional_id,
        indicador_nome, indicador_valor, indicador_status, volume,
        tma, tmr, impacto, enviado_toa,
        dt_inicio, dt_fim, dt_inicio_sistema, dt_fim_sistema, dt_fim_sistema_primeiro_fechamento,
        anomes
    ) values (
        p_id_mostra, v_localidade_id, v_operacional_id, v_tempo_id,
        p_metrics->>'indicador_nome', (p_metrics->>'indicador_valor')::numeric, p_metrics->>'indicador_status', (p_metrics->>'volume')::int,
        (p_metrics->>'tma')::numeric, (p_metrics->>'tmr')::numeric, p_metrics->>'impacto', (p_metrics->>'enviado_toa')::boolean,
        (p_timestamps->>'dt_inicio')::timestamptz, (p_timestamps->>'dt_fim')::timestamptz,
        (p_timestamps->>'dt_inicio_sistema')::timestamptz, (p_timestamps->>'dt_fim_sistema')::timestamptz,
        (p_timestamps->>'dt_fim_sistema_primeiro_fechamento')::timestamptz,
        (p_metrics->>'anomes')::int
    )
    on conflict (id_mostra) do update set
        updated_at = now(),
        volume = excluded.volume,
        indicador_status = excluded.indicador_status;
        
end;
$$ language plpgsql;
