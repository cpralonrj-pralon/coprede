# 🔌 Contrato de API de Ingestão (Internal)

Este documento define o contrato oficial para ingestão de dados operacionais via **n8n**.

**Base URL**: `http://localhost:3000` (ou URL de produção)

## Autenticação

Todas as requisições **DEVEM** conter o header de autenticação:

*   **Header**: `x-api-key`
*   **Valor**: Token seguro definido no backend (`INTERNAL_API_KEY`).

---

## 🚀 Endpoints

### 1. Ingestão de Incidentes (Batch/Single)

Recebe uma lista de incidentes (ou um único objeto) para processamento (Upsert).

*   **URL**: `/ingestion/incident`
*   **Método**: `POST`
*   **Content-Type**: `application/json`

#### Payload (Body)

Aceita um **Array** de objetos incidentes.

```json
[
  {
    "id_mostra": "12345",          // Obrigatório (ID Externo)
    "nm_origem": "ZABBIX",         // Obrigatório (Sistema Origem)
    "nm_tipo": "FALHA_SINAL",      // Opcional
    "nm_status": "ABERTO",         // Opcional
    "dh_inicio": "2024-01-22T10:00:00Z", // ISO 8601
    "ds_sumario": "Falha massiva região norte",
    "nm_cidade": "SAO PAULO",
    "regional": "SPI",
    "cluster": "NORTH",
    "payload": { ... }             // Metadata extra (JSON livre)
  },
  {
    "id_mostra": "67890",
    "nm_origem": "ZABBIX",
    ...
  }
]
```

#### Regras de Processamento

1.  **Deduplicação**: Identifica incidente por chave composta `(id_mostra, nm_origem)`.
2.  **Upsert**:
    *   **Se Existe**: Atualiza campos e registra histórico se status mudar.
    *   **Se Novo**: Insere novo registro.
3.  **Idempotência**: Reenvios do mesmo payload não geram duplicatas.

#### Resposta (Success 201)

```json
{
  "success": true,
  "stats": {
    "processed": 10,
    "inserted": 2,
    "updated": 8,
    "errors": 0
  }
}
```

#### Resposta (Erro 401 - Unauthorized)

```json
{
  "statusCode": 401,
  "message": "Invalid API Key"
}
```

#### Resposta (Erro 400 - Validation)

```json
{
  "statusCode": 400,
  "message": ["id_mostra must be a string", ...]
}
```
