-- RPC Function to calculate dashboard data with dynamic filters
DROP FUNCTION IF EXISTS get_recurrence_dashboard_data;

CREATE OR REPLACE FUNCTION get_recurrence_dashboard_data(
    p_filters jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_top_offenders jsonb;
    v_resolutions jsonb;
    v_daily_trend jsonb;
    
    -- Extract filter values (handle empty strings as nulls for logic simplicity)
    f_nm_tipo text := NULLIF(p_filters->>'nm_tipo', '');
    f_tp_abrangencia text := NULLIF(p_filters->>'tp_abrangencia', '');
    f_nm_organizacao_abertura text := NULLIF(p_filters->>'nm_organizacao_abertura', '');
    f_fc_mdu text := NULLIF(p_filters->>'fc_mdu', '');
    f_ds_cat_prod2 text := NULLIF(p_filters->>'ds_cat_prod2', '');
    f_ds_cat_prod3 text := NULLIF(p_filters->>'ds_cat_prod3', '');
    f_ds_cat_oper2 text := NULLIF(p_filters->>'ds_cat_oper2', '');
    f_ds_fecha_cat_prod2 text := NULLIF(p_filters->>'ds_fecha_cat_prod2', '');
    
    f_nm_cidade text := NULLIF(p_filters->>'nm_cidade', '');
    f_ci_estado text := NULLIF(p_filters->>'ci_estado', '');
    
    -- Date Range Filters
    f_dt_inicio date := (NULLIF(p_filters->>'dt_inicio', ''))::date;
    f_dt_fim date := (NULLIF(p_filters->>'dt_fim', ''))::date;
BEGIN

    -- 1. Top Offenders (Now NAP-based via concatenation)
    SELECT jsonb_agg(t) INTO v_top_offenders
    FROM (
        SELECT 
            -- Concatenate fields to form the "NAP" identifier
            CONCAT_WS('.', 
                COALESCE(a.areatecnica, '?'), 
                COALESCE(a.microregiao, '?'), 
                COALESCE(a.caixaprimaria, '?'), 
                COALESCE(a.divisorprimario, '?'), 
                COALESCE(a.nap, '?')
            ) as node, -- Aliased as 'node' to keep frontend compatible
            COUNT(DISTINCT a.incidente) as total_incidentes,
            SUM(COALESCE(a.qt_impact_customers, 0)) as total_impacto
        FROM 
            public.reincidencia_abrangencia a
        LEFT JOIN
            public.reincidencia_incidentes i ON a.incidente = i.incidente
        WHERE 
            a.nap IS NOT NULL AND a.nap != '' -- Ensure we only look at rows with NAP info
            AND (f_nm_tipo IS NULL OR i.nm_tipo = f_nm_tipo)
            AND (f_tp_abrangencia IS NULL OR i.tp_abrangencia = f_tp_abrangencia)
            AND (f_nm_organizacao_abertura IS NULL OR i.nm_organizacao_abertura = f_nm_organizacao_abertura)
            AND (f_fc_mdu IS NULL OR i.fc_mdu = f_fc_mdu)
            AND (f_ds_cat_prod2 IS NULL OR i.cd_cat_prod2 = f_ds_cat_prod2 OR i.ds_cat_prod2 = f_ds_cat_prod2)
            AND (f_ds_cat_prod3 IS NULL OR i.ds_cat_prod3 = f_ds_cat_prod3)
            AND (f_ds_cat_oper2 IS NULL OR i.ds_cat_oper2 = f_ds_cat_oper2)
            AND (f_ds_fecha_cat_prod2 IS NULL OR i.ds_fecha_cat_prod2 = f_ds_fecha_cat_prod2)
            AND (f_nm_cidade IS NULL OR a.nm_cidade = f_nm_cidade)
            AND (f_ci_estado IS NULL OR a.ci_estado = f_ci_estado)
            -- Date Range Filter
            AND (f_dt_inicio IS NULL OR COALESCE(i.dh_inicio, i.dh_created)::DATE >= f_dt_inicio)
            AND (f_dt_fim IS NULL OR COALESCE(i.dh_inicio, i.dh_created)::DATE <= f_dt_fim)
        GROUP BY 
            1 -- Group by the concatenated string
        ORDER BY 
            total_incidentes DESC
        LIMIT 20
    ) t;

    -- 2. Resolutions/Causes (Now grouping by ds_fecha_cat_causa3)
    SELECT jsonb_agg(t) INTO v_resolutions
    FROM (
        SELECT 
            COALESCE(i.ds_fecha_cat_causa3, 'Não Classificado') as ds_resolucao, -- Keeping alias 'ds_resolucao' to minimize frontend break for now, or update frontend too. Let's update frontend to be safe, but alias helps. actually I will change frontend.
            COUNT(DISTINCT i.incidente) as total
        FROM 
            public.reincidencia_incidentes i
        WHERE 
            1=1 -- Logic simplified
            AND (f_nm_tipo IS NULL OR i.nm_tipo = f_nm_tipo)
            AND (f_tp_abrangencia IS NULL OR i.tp_abrangencia = f_tp_abrangencia)
            AND (f_nm_organizacao_abertura IS NULL OR i.nm_organizacao_abertura = f_nm_organizacao_abertura)
            AND (f_fc_mdu IS NULL OR i.fc_mdu = f_fc_mdu)
            AND (f_ds_cat_prod2 IS NULL OR i.ds_cat_prod2 = f_ds_cat_prod2)
            AND (f_ds_cat_prod3 IS NULL OR i.ds_cat_prod3 = f_ds_cat_prod3)
            AND (f_ds_cat_oper2 IS NULL OR i.ds_cat_oper2 = f_ds_cat_oper2)
            AND (f_ds_fecha_cat_prod2 IS NULL OR i.ds_fecha_cat_prod2 = f_ds_fecha_cat_prod2)
            
            -- Filter by location (Abrangencia) if needed
            AND (
                (f_nm_cidade IS NULL AND f_ci_estado IS NULL)
                OR EXISTS (
                    SELECT 1 FROM public.reincidencia_abrangencia a 
                    WHERE a.incidente = i.incidente
                    AND (f_nm_cidade IS NULL OR a.nm_cidade = f_nm_cidade)
                    AND (f_ci_estado IS NULL OR a.ci_estado = f_ci_estado)
                )
            )
        GROUP BY 
            1
        ORDER BY 
            total DESC
        LIMIT 20
    ) t;

    -- 3. Daily Trend (Bar + Line Source)
    SELECT jsonb_agg(t) INTO v_daily_trend
    FROM (
        SELECT 
            TO_CHAR(COALESCE(i.dh_inicio, i.dh_created), 'YYYY-MM-DD') as data_dia, -- Use dh_inicio per user request, fallback to created
            COUNT(DISTINCT i.incidente) as total,
            -- Calculate percentage of incidents with ticket_pai (assuming this indicates recurrence/linkage)
            ROUND(
                (COUNT(DISTINCT CASE WHEN i.ticket_pai IS NOT NULL AND i.ticket_pai != '' THEN i.incidente END)::numeric 
                / NULLIF(COUNT(DISTINCT i.incidente), 0)::numeric) * 100, 
            2) as recurrence_rate
        FROM 
            public.reincidencia_incidentes i
        WHERE 
            1=1
            AND (f_nm_tipo IS NULL OR i.nm_tipo = f_nm_tipo)
            AND (f_tp_abrangencia IS NULL OR i.tp_abrangencia = f_tp_abrangencia)
            AND (f_nm_organizacao_abertura IS NULL OR i.nm_organizacao_abertura = f_nm_organizacao_abertura)
            AND (f_fc_mdu IS NULL OR i.fc_mdu = f_fc_mdu)
            AND (f_ds_cat_prod2 IS NULL OR i.ds_cat_prod2 = f_ds_cat_prod2)
            AND (f_ds_cat_prod3 IS NULL OR i.ds_cat_prod3 = f_ds_cat_prod3)
            AND (f_ds_cat_oper2 IS NULL OR i.ds_cat_oper2 = f_ds_cat_oper2)
            AND (f_ds_fecha_cat_prod2 IS NULL OR i.ds_fecha_cat_prod2 = f_ds_fecha_cat_prod2)
            AND (
                (f_nm_cidade IS NULL AND f_ci_estado IS NULL)
                OR EXISTS (
                    SELECT 1 FROM public.reincidencia_abrangencia a 
                    WHERE a.incidente = i.incidente
                    AND (f_nm_cidade IS NULL OR a.nm_cidade = f_nm_cidade)
                    AND (f_ci_estado IS NULL OR a.ci_estado = f_ci_estado)
                )
            )
        GROUP BY 
            1
        ORDER BY 
            1 ASC
    ) t;

    RETURN jsonb_build_object(
        'top_offenders', COALESCE(v_top_offenders, '[]'::jsonb),
        'resolutions', COALESCE(v_resolutions, '[]'::jsonb),
        'daily_trend', COALESCE(v_daily_trend, '[]'::jsonb)
    );
END;
$$;

-- Helper to get distinct values for dropdowns
CREATE OR REPLACE FUNCTION get_recurrence_filter_options(
    field_name text
)
RETURNS TABLE (value text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF field_name = 'nm_cidade' THEN
        RETURN QUERY SELECT DISTINCT nm_cidade FROM public.reincidencia_abrangencia WHERE nm_cidade IS NOT NULL ORDER BY 1;
    ELSIF field_name = 'ci_estado' THEN
        RETURN QUERY SELECT DISTINCT ci_estado FROM public.reincidencia_abrangencia WHERE ci_estado IS NOT NULL ORDER BY 1;
    ELSE
        -- Helper for incidents table fields
        RETURN QUERY EXECUTE format('SELECT DISTINCT %I FROM public.reincidencia_incidentes WHERE %I IS NOT NULL ORDER BY 1', field_name, field_name);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_recurrence_dashboard_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_recurrence_dashboard_data TO anon;
GRANT EXECUTE ON FUNCTION get_recurrence_filter_options TO authenticated;
GRANT EXECUTE ON FUNCTION get_recurrence_filter_options TO anon;
