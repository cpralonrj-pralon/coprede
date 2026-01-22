    # Arquitetura de Backend (Supabase)

    Esta documentação descreve a arquitetura de dados e segurança do sistema, baseada em PostgreSQL e Supabase.

    ## Visão Geral

    O sistema adota uma arquitetura híbrida para garantir segurança e performance:

    1.  **Frontend (React/Vite)**:
        -   Responsável apenas por **LEITURA** de dados.
        -   Conecta-se ao Supabase via `anon_key` para consumir dados em tempo real.
        -   Não possui permissão de escrita em tabelas críticas.

    2.  **Backend Central (NestJS)**:
        -   Server-side application rodando em Node.js.
        -   Ponto único de **ESCRITA** no banco de dados.
        -   Canais de entrada: API REST (para n8n) e Webhooks.
        -   Gerencia regras de negócio: Deduplicação, Histórico, Alertas.
        -   Usa a `service_role_key` para acesso privilegiado.

    3.  **Banco de Dados (Supabase)**:
        -   PostgreSQL com RLS (Row Level Security) ativado.
        -   Realtime ativado para push de atualizações ao frontend.

    4.  **Automação (n8n)**:
        -   Coleta dados de fontes externas (SGO, GPON, Zabbix).
        -   Normaliza/Envia para o Backend (não escreve direto no banco).

    ## Fluxo de Dados

    `[Fontes Externas] -> [n8n] -> (HTTP POST) -> [NestJS Backend] -> (Upsert) -> [Supabase DB] -> (Realtime) -> [Frontend]`


    ## Data Model

    ### 1. Profiles (`public.profiles`)
    Extensão da tabela de usuários do Supabase Auth (`auth.users`).
    -   `id`: UUID (FK para auth.users)
    -   `email`: Email do usuário
    -   `role`: 'admin', 'operator', 'viewer'
    -   `created_at`: Timestamp

    ### 2. Incidents (`public.incidents`)
    Tabela central de operações, espelhando os campos da API de origem.

    **Campos Principais:**
    -   `id`: UUID (Internal Primary Key)
    -   `id_mostra`: Text (Identificador Externo)
    -   `nm_origem`: Text (Origem: SGO, GPON, etc.)
    -   `nm_tipo`: Text (Tipo de Incidente)
    -   `nm_status`: Text (Status Atual)
    -   `dh_inicio`: Timestamptz (Data Inicio)
    -   `ds_sumario`: Text (Descrição/Sumário)

    **Localização e Topologia:**
    -   `nm_cidade`: Text
    -   `topologia`: Text
    -   `tp_topologia`: Text
    -   `regional`: Text
    -   `grupo`: Text
    -   `cluster`: Text
    -   `subcluster`: Text

    **Categorização:**
    -   `nm_cat_prod2`: Text
    -   `nm_cat_prod3`: Text
    -   `nm_cat_oper2`: Text
    -   `nm_cat_oper3`: Text

    **Auditoria:**
    -   `payload`: JSONB (Dado bruto original)
    -   `created_at`: Timestamptz
    -   `updated_at`: Timestamptz

    **Constraint de Unicidade**: `UNIQUE (nm_origem, id_mostra)`
    Garante idempotência na ingestão.

    ### 3. Incident History (`public.incident_history`)
    Log de auditoria para rastrear mudanças.
    -   `id`: UUID
    -   `incident_id`: UUID (FK para incidents)
    -   `old_status`: Status anterior
    -   `new_status`: Novo status
    -   `changed_at`: Timestamp

    ## Segurança (RLS Policies)

    | Tabela      | Operação | Role       | Permissão |
    | ----------- | -------- | ---------- | --------- |
    | `profiles`  | SELECT   | Authenticated | Próprio perfil ou Admin ver todos |
    | `incidents` | SELECT   | Authenticated | Ver todos |
    | `incidents` | INSERT   | Service Role | Permitido (Automação) |
    | `incidents` | UPDATE   | Service Role | Permitido (Automação) |
    | `incidents` | INSERT   | Authenticated | **NEGADO** |
    | `incidents` | DELETE   | Authenticated | **NEGADO** |

    ## Estratégia de Ingestão (n8n)

    Para garantir consistência, o fluxo do n8n deve:
    1.  Receber dados da API externa.
    2.  Mapear para o formato da tabela `incidents` (nomes de colunas exatos).
    3.  Executar operação de **Upsert** no Supabase usando a chave composta `(nm_origem, id_mostra)`.
