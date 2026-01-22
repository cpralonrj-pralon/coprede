# 🚀 Configuração Final do N8N (Batch Ingestion)

Para evitar erros de **Validacao (parsable array expected)** e **Conexão (ECONNREFUSED)**, siga esta estrutura EXATA:

## 1. Topologia do Fluxo
O seu workflow deve ter esta ordem de nodes:

`[Trigger/Webhook]` ---> `[Code]` ---> `[Aggregate]` ---> `[HTTP Request]`

---

## 2. Configuração de Cada Node

### A. Node Code (Transformação)
*   **Código:** Use o que salvamos em `docs/n8n_transformation_code.js`.
*   **Mode:** "Run Once for All Items".

### B. Node Aggregate (Agrupamento) ⚠️ CRUCIAL ⚠️
Este node é quem transforma os 500 itens soltos em 1 lista gigante. Sem ele, o sistema tenta enviar 500 vezes e trava.
*   **Aggregate:** "Aggregate All Items"
*   **Put Output in Field:** `data` (ou deixe o padrão `data` se ele não perguntar).
*   *Isso garante que saia 1 item contendo uma lista de 500 registros.*

### C. Node HTTP Request (Envio)
*   **Method:** POST
*   **URL:** `http://host.docker.internal:3000/ingestion/incident`
    *   *(Não use `/single` aqui)*
*   **Send Body:** JSON
*   **Body Parameters (Expression):** `{{ $json.data }}`
    *   *Se o Aggregate salvou em 'data', use `$json.data`.*
    *   *Se o Aggregate salvou na raiz ou mesclou listas, tente `{{ $json }}` ou `{{ $items("Aggregate").map(i => i.json) }}`.*
    *   **Teste Fácil:** No campo Body, deve aparecer visualmente uma lista começando com `[`. Se começar com `{`, está errado.

---

## Resumo do Erro Anterior
*   **Erro:** "Validation failed (parsable array expected)"
*   **Causa:** Você mandou um **Objeto** `{...}` para o endpoint de **Lista**.
*   **Solução:** O node **Aggregate** cria a lista `[...]` que o backend espera.
