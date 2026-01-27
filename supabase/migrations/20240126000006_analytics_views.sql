-- View: Top Ofensores (Nodes com mais incidentes recorrentes)
-- Considera apenas nodes válidos (não vazios)
CREATE OR REPLACE VIEW public.view_reincidencia_top_offenders AS
SELECT 
    node,
    COUNT(DISTINCT incidente) as total_incidentes,
    SUM(qt_impact_customers) as total_impacto
FROM 
    public.reincidencia_abrangencia
WHERE 
    node IS NOT NULL AND node != ''
GROUP BY 
    node
ORDER BY 
    total_incidentes DESC
LIMIT 20;

-- View: Pareto de Resoluções (Incidentes)
CREATE OR REPLACE VIEW public.view_reincidencia_resolucao AS
SELECT 
    ds_resolucao,
    COUNT(*) as total
FROM 
    public.reincidencia_incidentes
WHERE 
    ds_resolucao IS NOT NULL
GROUP BY 
    ds_resolucao
ORDER BY 
    total DESC;

-- Grant permissions for frontend access
GRANT SELECT ON public.view_reincidencia_top_offenders TO authenticated;
GRANT SELECT ON public.view_reincidencia_top_offenders TO anon;
GRANT SELECT ON public.view_reincidencia_resolucao TO authenticated;
GRANT SELECT ON public.view_reincidencia_resolucao TO anon;
