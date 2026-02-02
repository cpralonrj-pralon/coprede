    # Configuração do Analista de IA no n8n 🧠

Este guia explica como configurar o seu fluxo do n8n para ler os dados da nova **Tabela Master** (`coprede_master_incidents`) e alimentar a Inteligência Artificial.

## Passo 1: O Nó de Leitura (Postgres)

No seu fluxo do n8n que gera o resumo da IA, você deve ter um nó que busca os dados do banco. Provavelmente é um nó do tipo **Postgres** ou **Supabase**.

### Configuração do Nó:

1.  **Tipo de Nó:** `Postgres`
2.  **Operação:** `Execute Query` (Executar Query)
3.  **Credencial:** Selecione a sua credencial do Supabase/Postgres.

### A Query SQL (Copie e Cole):

Cole exatamente este código no campo de Query:

```sql
SELECT 
    id_mostra,
    nm_tipo,
    nm_status,
    dh_inicio,
    ds_sumario,
    nm_cidade,
    topologia,
    nm_cat_oper2 as tecnologia
FROM coprede_master_incidents 
WHERE 
    created_at >= NOW() - INTERVAL '24 hours' -- Apenas dados recentes
ORDER BY dh_inicio DESC
LIMIT 50; -- Limite para não sobrecarregar a IA
```

---

## Passo 2: O Nó de IA (OpenAI / Anthropic)

O nó seguinte (que chama o ChatGPT ou similar) vai receber esses dados. No prompt do sistema da IA, garanta que você está passando o JSON retornado pelo passo anterior.

**Exemplo de Prompt para a IA:**
```text
Você é um Analista de Rede de Telecomunicações.
Analise os seguintes incidentes das últimas 24 horas e gere um resumo executivo:
{{ JSON.stringify($json) }}

Foque em:
1. Cidades mais afetadas.
2. Principais tipos de falha.
3. Sugestão de ação.
```

## Resumo
Ao fazer isso, sua IA estará lendo da **Master Table** (o dado mais limpo e deduplicado que temos), garantindo análises precisas e sem repetições.
