# 🤖 Guia de Integração n8n

Este guia orienta como configurar o **n8n** para enviar dados para o novo Backend de Ingestão.

---

## 1. Pré-requisitos

*   **Backend Rodando**: Certifique-se de que o backend NestJS está rodando (`npm run start` em `backend/`).
*   **Chave de API**: Verifique a chave definida no arquivo `backend/.env` (ex: `INTERNAL_API_KEY=minha-senha-secreta`).
*   **Acesso de Rede**: O servidor n8n deve conseguir acessar o endereço do backend (ex: `http://localhost:3000` ou IP do servidor).

---

## 2. Configurando o Nó HTTP Request

No seu fluxo do n8n (após coletar os dados do Zabbix/SGO), adicione um node **HTTP Request**.

### Configurações Principais

*   **Method**: `POST`
*   **URL**: `http://localhost:3000/ingestion/incident` (ajuste o host conforme necessário)
*   **Authentication**: `Generic Credential Type` -> `Header Auth` (ou digite manualmente nos headers)

### Headers

Adicione um header customizado para autenticação:

*   **Name**: `x-api-key`
*   **Value**: `minha-senha-secreta` (mesma do .env)

### Body Parameters

*   **Send Body**: `true`
*   **Content Type**: `JSON`
*   **Body Parameters**:
    O backend espera um **Array** de objetos. Se o seu node anterior retorna vários items, o n8n normalmente executa o node HTTP uma vez para cada item.
    
    **Para enviar em Batch (Recomendado):**
    Use um node **Aggregate** ou **Code** antes do HTTP Request para agrupar os itens em um único array JSON.

    **Para enviar item a item (MÉTODO FÁCIL - PEQUENOS VOLUMES):**
    Use a URL: `http://host.docker.internal:3000/ingestion/incident/single`
    *(Nota: Se você tiver muitos itens (>100), isso pode gerar erro `ECONNREFUSED` por abrir muitas conexões seguidas. Nesse caso, use o método Batch abaixo.)*

    **Para enviar em Batch (RECOMENDADO PARA VOLUME > 100):**
    1. Antes do HTTP Request, adicione um node **"Aggregate"** (Agregação).
    2. Configure o Aggregate para "Aggregate All Items".
    3. No HTTP Request, use a URL padrão: `http://host.docker.internal:3000/ingestion/incident`
    4. O JSON deve ser apenas `{{ JSON.stringify($json) }}` (pois o Aggregate já cria lista).

    Essa abordagem envia 500 itens em **1 única requisição**, evitando travamentos.
    
    **Exemplo de JSON esperado:**
    ```json
    [
      {
        "id_mostra": "INC-1001",
        "nm_origem": "SGO",
        "nm_tipo": "FALHA",
        "nm_status": "ABERTO",
        "dh_inicio": "2024-01-22T10:00:00.000Z",
        "ds_sumario": "Descrição do incidente",
        "nm_cidade": "SÃO PAULO",
        "regional": "SP"
      },
      ...
    ]
    ```

---

## 3. Testando

1.  Execute o workflow no n8n.
2.  Verifique a saída do node HTTP Request.
3.  **Sucesso**: Deverá retornar status `201` e um JSON com estatísticas (`inserted`, `updated`).
4.  **Backend Logs**: Verifique o terminal do backend para ver os logs de processamento.
5.  **Dashboard**: Abra o dashboard frontend e veja se os incidentes apareceram (se estiverem ativos).

---

## 4. Troubleshooting e Conectividade Docker

### Cenário A: n8n rodando em Docker (Desktop/Server)
Se o n8n estiver em um container, ele **não consegue** acessar `localhost:3000` (pois localhost seria o próprio container).

**Solução:**
-   **URL**: Use `http://host.docker.internal:3000/ingestion/incident` (Windows/Mac).
-   **Linux**: Use o IP da rede Docker (ex: `172.17.0.1`) ou o IP da máquina na rede local.

**Erro Comum:** `ECONNREFUSED`
Significa que o n8n não achou o backend. Verifique se o backend está rodando e se a URL está certa conforme acima.

### Outros Erros
*   **Erro 401 Unauthorized**: Verifique se o header `x-api-key` está correto.
*   **Erro 400 Bad Request**: O JSON enviado está inválido ou faltam campos obrigatórios.
