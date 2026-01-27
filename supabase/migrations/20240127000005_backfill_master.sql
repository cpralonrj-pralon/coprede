-- Carga Inicial (Backfill) da Tabela de Produção para a Master
-- Esse script copia todo o histórico existente para garantir que a Master não comece vazia.

INSERT INTO public.coprede_master_incidents (
    id_mostra, nm_origem, nm_tipo, nm_status, 
    dh_inicio, ds_sumario, nm_cidade, 
    topologia, tp_topologia, 
    nm_cat_prod2, nm_cat_prod3, nm_cat_oper2, nm_cat_oper3, 
    regional, grupo, cluster, subcluster,
    raw_data,
    updated_at
)
SELECT 
    id_mostra, nm_origem, nm_tipo, nm_status, 
    dh_inicio::timestamptz, ds_sumario, nm_cidade, 
    topologia, tp_topologia, 
    nm_cat_prod2, nm_cat_prod3, nm_cat_oper2, nm_cat_oper3, 
    regional, grupo, cluster, subcluster,
    to_jsonb(incidents.*), -- Salva o registro completo original como JSON
    NOW()
FROM public.incidents
ON CONFLICT (id_mostra) DO NOTHING; -- Se já existir, não faz nada (seguro para rodar várias vezes)

-- Confirmação opcional
-- SELECT count(*) FROM public.coprede_master_incidents;
