-- View to join Incidents and Coverage (Nodes/NAPs)
CREATE OR REPLACE VIEW public.view_reincidencia_full AS
SELECT 
    i.incidente,
    i.ticket_pai,
    i.dh_inicio,
    i.dh_fechamento,
    i.ds_status,
    i.ds_cat_prod3, -- Often implies technology/product
    i.ds_resolucao,
    i.ds_origem,
    
    -- Coverage Fields (Critical for Recurrence)
    a.node,
    a.nap,
    a.celula,
    a.nm_cidade,
    a.ci_estado as uf, -- Alias for easier consumption
    a.qt_impact_customers,
    
    -- Calculated Fields
    EXTRACT(YEAR FROM i.dh_inicio) as ano,
    EXTRACT(MONTH FROM i.dh_inicio) as mes,
    TO_CHAR(i.dh_inicio, 'YYYYMM') as anomes

FROM public.reincidencia_incidentes i
LEFT JOIN public.reincidencia_abrangencia a ON i.incidente = a.incidente;

-- Grant access
GRANT SELECT ON public.view_reincidencia_full TO authenticated;
GRANT SELECT ON public.view_reincidencia_full TO anon;
