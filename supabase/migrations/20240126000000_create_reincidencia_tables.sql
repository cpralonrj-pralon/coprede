-- Table 1: Incidentes
CREATE TABLE IF NOT EXISTS public.reincidencia_incidentes (
    incidente text PRIMARY KEY,
    id text,
    ticket_pai text,
    
    -- Origem
    cd_origem text,
    ds_origem text,
    
    -- Tipo
    cd_tipo text,
    nm_tipo text,
    tp_abrangencia text,
    
    -- Status
    cd_status text,
    ds_status text,
    ds_sumario text,
    
    -- Abertura
    lg_abertura text,
    nm_abertura text,
    login_nm_abertura text,
    nm_grupo_abertura text,
    nm_organizacao_abertura text,
    
    -- Tratamento
    lg_tratamento text,
    nm_tratamento text,
    login_nm_tratamento text,
    nm_grupo_tratamento text,
    nm_organizacao_tratamento text,
    
    -- Flags
    central text,
    ura text,
    ged text,
    fc_mdu text,
    
    -- Categorização Produto/Oper
    cd_cat_prod1 text, ds_cat_prod1 text,
    cd_cat_prod2 text, ds_cat_prod2 text,
    cd_cat_prod3 text, ds_cat_prod3 text,
    
    cd_cat_oper1 text, ds_cat_oper1 text,
    cd_cat_oper2 text, ds_cat_oper2 text,
    cd_cat_oper3 text, ds_cat_oper3 text,
    
    -- Fechamento Categorização
    cd_fecha_cat_prod1 text, ds_fecha_cat_prod1 text,
    cd_fecha_cat_prod2 text, ds_fecha_cat_prod2 text,
    cd_fecha_cat_prod3 text, ds_fecha_cat_prod3 text,
    
    cd_fecha_cat_causa1 text, ds_fecha_cat_causa1 text,
    cd_fecha_cat_causa2 text, ds_fecha_cat_causa2 text,
    cd_fecha_cat_causa3 text, ds_fecha_cat_causa3 text,
    
    cd_fecha_cat_resol1 text, ds_fecha_cat_resol1 text,
    cd_fecha_cat_resol2 text, ds_fecha_cat_resol2 text,
    cd_fecha_cat_resol3 text, ds_fecha_cat_resol3 text,
    
    situacao_especial text,
    ds_resolucao text,
    
    -- Datas
    dh_created timestamptz,
    dh_inicio timestamptz,
    dh_previsao timestamptz,
    dh_fechamento timestamptz,
    dh_terminated timestamptz,
    dh_updated timestamptz,
    
    -- Fechamento User
    lg_fechamento text,
    nm_fechamento text,
    login_nm_fechamento text,
    nm_grupo_fechamento text,
    nm_organizacao_fechamento text,
    fc_evidencia_fechamento text,
    
    -- Métricas / Tickets Extras
    qt_reprogramacao int,
    tkt_falha text,
    tkt_gmud text,
    tkt_outage text,
    tkt_atlas text,
    client_id text,
    node_qt_amp_bid int,
    node_qt_afetados int,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table 2: Abrangencia (Nodes/NAPs/Elements)
CREATE TABLE IF NOT EXISTS public.reincidencia_abrangencia (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cod_incidente text,
    incidente text, -- Potential FK
    
    -- Localização/Rede
    cd_pais text,
    nm_pais text,
    cd_operadora text,
    nm_cidade text,
    tp_abrangencia text,
    ci_estado text,
    municipio text,
    areatecnica text,
    microregiao text,
    
    -- Elementos de Rede
    caixaprimaria text,
    divisorprimario text,
    nap text,
    cd_imovel text,
    node text,
    celula text,
    
    -- Datas
    dh_created timestamptz,
    dh_updated timestamptz,
    dh_deleted timestamptz,
    dh_closed timestamptz,
    dh_deletedsis timestamptz,
    dh_closedsis timestamptz,
    
    -- Métricas
    qt_impact_customers int,
    
    -- Canal
    canal text,
    canal_prioridade text,
    canal_display text,
    canal_tipo text,
    
    created_at timestamptz DEFAULT now(),
    
    -- Foreign Key constraint if guaranteed
    CONSTRAINT fk_reincidencia_incidente
        FOREIGN KEY(incidente) 
        REFERENCES public.reincidencia_incidentes(incidente)
        ON DELETE CASCADE
);

-- Indexes for Filtering & Joins
CREATE INDEX IF NOT EXISTS idx_reincidencia_abrangencia_incidente ON public.reincidencia_abrangencia(incidente);
CREATE INDEX IF NOT EXISTS idx_reincidencia_abrangencia_node ON public.reincidencia_abrangencia(node);
CREATE INDEX IF NOT EXISTS idx_reincidencia_abrangencia_nap ON public.reincidencia_abrangencia(nap);
CREATE INDEX IF NOT EXISTS idx_reincidencia_abrangencia_dh_created ON public.reincidencia_abrangencia(dh_created);

-- RLS Policies
ALTER TABLE public.reincidencia_abrangencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.reincidencia_abrangencia
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.reincidencia_abrangencia
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.reincidencia_abrangencia
    FOR UPDATE USING (true);
