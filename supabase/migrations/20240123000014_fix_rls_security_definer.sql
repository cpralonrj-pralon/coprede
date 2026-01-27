-- SECURITY FIX SCRIPT 014: RLS BYPASS
-- O erro 42501 ocorre porque o usuário logado não tem permissão de INSERT nas tabelas.
-- Esta versão adiciona "SECURITY DEFINER" para rodar a função com permissões de ADMIN.

CREATE OR REPLACE FUNCTION public.ingest_flat_indicador(
    p_id_mostra text,
    p_regional text, p_grupo text, p_cidade_uf text, p_uf text, -- Localidade
    p_tecnologia text, p_servico text, p_natureza text, p_sintoma text, p_ferramenta text, p_fechamento text, p_solucao text, -- Operacional
    p_timestamps jsonb, -- Time fields
    p_metrics jsonb -- Metric fields
) RETURNS void 
SECURITY DEFINER -- <--- A MÁGICA: Roda com permissões do criador (Admin) e ignora RLS do usuário
SET search_path = public
AS $$
DECLARE
    v_localidade_id uuid;
    v_operacional_id uuid;
    v_tempo_id uuid;
    v_exists boolean;
BEGIN
    -- 1. Dim Localidade (Lógica Upsert manual para evitar locks)
    SELECT id INTO v_localidade_id 
    FROM public.dim_localidade 
    WHERE regional = p_regional AND grupo = p_grupo AND cidade_uf = p_cidade_uf AND uf = p_uf 
    LIMIT 1;
    
    IF v_localidade_id IS NULL THEN
        INSERT INTO public.dim_localidade (regional, grupo, cidade_uf, uf)
        VALUES (p_regional, p_grupo, p_cidade_uf, p_uf)
        ON CONFLICT (regional, grupo, cidade_uf, uf) DO NOTHING
        RETURNING id INTO v_localidade_id;
        
        -- Caso concorrência tenha inserido entre o SELECT e o INSERT
        IF v_localidade_id IS NULL THEN
             SELECT id INTO v_localidade_id 
             FROM public.dim_localidade 
             WHERE regional = p_regional AND grupo = p_grupo AND cidade_uf = p_cidade_uf AND uf = p_uf;
        END IF;
    END IF;
    
    -- 2. Dim Operacional
    SELECT id INTO v_operacional_id
    FROM public.dim_operacional
    WHERE tecnologia = p_tecnologia AND servico = p_servico AND natureza = p_natureza 
      AND sintoma = p_sintoma AND ferramenta_abertura = p_ferramenta 
      AND fechamento = p_fechamento AND solucao = p_solucao
    LIMIT 1;
    
    IF v_operacional_id IS NULL THEN
        INSERT INTO public.dim_operacional (tecnologia, servico, natureza, sintoma, ferramenta_abertura, fechamento, solucao)
        VALUES (p_tecnologia, p_servico, p_natureza, p_sintoma, p_ferramenta, p_fechamento, p_solucao)
        ON CONFLICT (tecnologia, servico, natureza, sintoma, ferramenta_abertura, fechamento, solucao) DO NOTHING
        RETURNING id INTO v_operacional_id;
        
        IF v_operacional_id IS NULL THEN
             SELECT id INTO v_operacional_id
             FROM public.dim_operacional
             WHERE tecnologia = p_tecnologia AND servico = p_servico AND natureza = p_natureza 
             AND sintoma = p_sintoma AND ferramenta_abertura = p_ferramenta 
             AND fechamento = p_fechamento AND solucao = p_solucao;
        END IF;
    END IF;
    
    -- 3. Dim Tempo (Insert direto, 1:1)
    INSERT INTO public.dim_tempo_operacional (
        dt_em_progresso, dt_designado, dt_primeiro_acionamento_rf, 
        dt_primeiro_acionamento_fo, dt_primeiro_acionamento_gpon, dt_inicio_chegou_cop_fo
    ) VALUES (
        (p_timestamps->>'dt_em_progresso')::timestamptz,
        (p_timestamps->>'dt_designado')::timestamptz,
        (p_timestamps->>'dt_primeiro_acionamento_rf')::timestamptz,
        (p_timestamps->>'dt_primeiro_acionamento_fo')::timestamptz,
        (p_timestamps->>'dt_primeiro_acionamento_gpon')::timestamptz,
        (p_timestamps->>'dt_inicio_chegou_cop_fo')::timestamptz
    ) RETURNING id INTO v_tempo_id;
    
    -- 4. Fato (Manual Logic Upsert do script 12)
    SELECT EXISTS(SELECT 1 FROM public.fact_indicadores_residencial WHERE id_mostra = p_id_mostra) INTO v_exists;
    
    IF v_exists THEN
        -- UPDATE
        UPDATE public.fact_indicadores_residencial SET
            localidade_id = v_localidade_id,
            operacional_id = v_operacional_id,
            indicador_nome = p_metrics->>'indicador_nome',
            indicador_valor = (p_metrics->>'indicador_valor')::numeric,
            indicador_status = p_metrics->>'indicador_status',
            volume = (p_metrics->>'volume')::int,
            tma = (p_metrics->>'tma')::numeric,
            tmr = (p_metrics->>'tmr')::numeric,
            impacto = p_metrics->>'impacto',
            enviado_toa = (p_metrics->>'enviado_toa')::boolean,
            dt_inicio = (p_timestamps->>'dt_inicio')::timestamptz,
            dt_fim = (p_timestamps->>'dt_fim')::timestamptz,
            updated_at = now()
        WHERE id_mostra = p_id_mostra;
    ELSE
        -- INSERT
        INSERT INTO public.fact_indicadores_residencial (
            id_mostra, localidade_id, operacional_id, tempo_operacional_id,
            indicador_nome, indicador_valor, indicador_status, volume,
            tma, tmr, impacto, enviado_toa,
            dt_inicio, dt_fim, dt_inicio_sistema, dt_fim_sistema, dt_fim_sistema_primeiro_fechamento,
            anomes
        ) VALUES (
            p_id_mostra, v_localidade_id, v_operacional_id, v_tempo_id,
            p_metrics->>'indicador_nome', (p_metrics->>'indicador_valor')::numeric, p_metrics->>'indicador_status', (p_metrics->>'volume')::int,
            (p_metrics->>'tma')::numeric, (p_metrics->>'tmr')::numeric, p_metrics->>'impacto', (p_metrics->>'enviado_toa')::boolean,
            (p_timestamps->>'dt_inicio')::timestamptz, (p_timestamps->>'dt_fim')::timestamptz,
            (p_timestamps->>'dt_inicio_sistema')::timestamptz, (p_timestamps->>'dt_fim_sistema')::timestamptz,
            (p_timestamps->>'dt_fim_sistema_primeiro_fechamento')::timestamptz,
            (p_metrics->>'anomes')::int
        );
    END IF;
    
END;
$$ LANGUAGE plpgsql;
