# 📊 Documentação da Estrutura do Banco de Dados

Esta documentação descreve **toda a estrutura do banco de dados**, suas **tabelas**, **relacionamentos** e **políticas de segurança (RLS)** utilizadas na plataforma de **monitoramento de incidentes em tempo real**, integrada ao **Supabase + n8n**.

---

## 🎯 Objetivos do Banco de Dados

* Centralizar incidentes operacionais (rede, sistemas, produtos)
* Permitir **ingestão automática via API / n8n**
* Garantir **leitura segura no frontend (dashboard)**
* Preservar histórico e rastreabilidade
* Suportar **Realtime (Supabase Realtime)**

---

# 🗄️ TABELAS

## 1️⃣ `incidents`

Tabela principal que representa o **estado atual de cada incidente**.

### 📌 Finalidade

* Fonte única para dashboards
* Atualizada via **UPSERT pelo n8n**

### 🧱 Estrutura

| Campo        | Tipo        | Descrição                     |
| ------------ | ----------- | ----------------------------- |
| id           | uuid (PK)   | Identificador interno         |
| id_mostra    | text        | ID externo do incidente       |
| nm_origem    | text        | Origem do incidente           |
| nm_tipo      | text        | Tipo do incidente             |
| nm_status    | text        | Status atual                  |
| dh_inicio    | timestamptz | Data/hora de início           |
| ds_sumario   | text        | Resumo descritivo             |
| nm_cidade    | text        | Cidade afetada                |
| topologia    | text        | Topologia da rede             |
| tp_topologia | text        | Tipo de topologia             |
| nm_cat_prod2 | text        | Categoria produto nível 2     |
| nm_cat_prod3 | text        | Categoria produto nível 3     |
| nm_cat_oper2 | text        | Categoria operacional nível 2 |
| nm_cat_oper3 | text        | Categoria operacional nível 3 |
| regional     | text        | Regional responsável          |
| grupo        | text        | Grupo operacional             |
| cluster      | text        | Cluster                       |
| subcluster   | text        | Subcluster                    |
| created_at   | timestamptz | Criação do registro           |
| updated_at   | timestamptz | Última atualização            |

---

## 2️⃣ `incident_history`

Tabela de **histórico imutável** de alterações dos incidentes.

### 📌 Finalidade

* Auditoria
* Linha do tempo
* Compliance

### 🧱 Estrutura

| Campo          | Tipo        | Descrição               |
| -------------- | ----------- | ----------------------- |
| id             | uuid (PK)   | Identificador           |
| incident_id    | uuid (FK)   | Referência ao incidente |
| campo_alterado | text        | Campo modificado        |
| valor_anterior | text        | Valor antes             |
| valor_novo     | text        | Valor depois            |
| alterado_em    | timestamptz | Data/hora               |
| alterado_por   | text        | Origem da alteração     |

🔗 Relacionamento:

* `incident_history.incident_id → incidents.id`

---

## 3️⃣ `user_profiles`

Armazena informações adicionais dos usuários autenticados.

### 📌 Finalidade

* Controle de acesso
* Definição de perfil

### 🧱 Estrutura

| Campo      | Tipo        | Descrição                 |
| ---------- | ----------- | ------------------------- |
| id         | uuid (PK)   | ID do auth.users          |
| nome       | text        | Nome do usuário           |
| perfil     | text        | admin / operador / viewer |
| regional   | text        | Regional associada        |
| created_at | timestamptz | Criação                   |

---

## 4️⃣ `alerts`

Tabela de alertas derivados dos incidentes.

### 📌 Finalidade

* Notificações
* Integração com SMS / Email / Push

### 🧱 Estrutura

| Campo       | Tipo        | Descrição             |
| ----------- | ----------- | --------------------- |
| id          | uuid (PK)   | Identificador         |
| incident_id | uuid (FK)   | Incidente relacionado |
| tipo        | text        | Tipo de alerta        |
| mensagem    | text        | Conteúdo              |
| enviado     | boolean     | Status de envio       |
| criado_em   | timestamptz | Data/hora             |

---

## 5️⃣ `operational_snapshots`

Snapshots periódicos do estado operacional.

### 📌 Finalidade

* Métricas históricas
* Relatórios

### 🧱 Estrutura

| Campo             | Tipo        | Descrição         |
| ----------------- | ----------- | ----------------- |
| id                | uuid (PK)   | Identificador     |
| total_incidentes  | int         | Quantidade total  |
| incidentes_ativos | int         | Incidentes ativos |
| regional          | text        | Regional          |
| snapshot_time     | timestamptz | Momento           |

---

# 🔐 POLÍTICAS DE SEGURANÇA (RLS)

## 🔑 Conceito Geral

| Papel              | Permissão      |
| ------------------ | -------------- |
| service_role (n8n) | Total (CRUD)   |
| authenticated      | Apenas leitura |
| anon               | Nenhum acesso  |

---

## 🔒 `incidents`

* 👀 Leitura: usuários autenticados
* ✍️ Escrita: apenas service_role

---

## 🔒 `incident_history`

* 👀 Leitura: usuários autenticados
* ✍️ Inserção: apenas service_role
* ❌ Nunca permite update/delete

---

## 🔒 `user_profiles`

* Usuário lê o próprio perfil
* Admin lê todos

---

## 🔒 `alerts`

* Leitura: usuários autenticados
* Escrita: service_role

---

## 🔒 `operational_snapshots`

* Leitura: usuários autenticados
* Inserção: service_role

---

# ⚙️ ARQUITETURA DE ACESSO

```
[ API / N8N ]
      │ (service_role)
      ▼
[ Supabase DB ] ◀── Realtime ──▶ [ Dashboard Frontend ]
                               (authenticated)
```

---

# ✅ BENEFÍCIOS DA ESTRUTURA

✔ Segurança por padrão
✔ Escalável
✔ Auditável
✔ Realtime-ready
✔ Compatível com LGPD
✔ Ideal para NOC / SOC

---

📌 **Status**: Estrutura pronta para produção
