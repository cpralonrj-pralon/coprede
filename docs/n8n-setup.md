# n8n to Supabase Integration

This guide explains how to set up an n8n workflow to ingest data into Supabase efficiently using the **UPSERT** strategy with the new **Operational Schema**.

## Prerequisites
1.  **Supabase Project**: URL and Service Role Key.
2.  **n8n Instance**: Self-hosted or Cloud.

## Workflow Strategy

### 1. Transform Node (Function)
Map the external data directly to the new database columns.

```javascript
return items.map(item => {
  const evt = item.json;
  return {
    json: {
      // Identity
      id_mostra: evt.id_mostra || evt.ticket_id,
      nm_origem: evt.nm_origem || 'SGO',

      // Status
      nm_tipo: evt.nm_tipo,
      nm_status: evt.nm_status,
      // Ensure ISO Format for Date
      dh_inicio: evt.dh_inicio, 
      ds_sumario: evt.ds_sumario,
      
      // Location
      nm_cidade: evt.nm_cidade,
      regional: evt.regional,
      grupo: evt.grupo,
      cluster: evt.cluster,
      subcluster: evt.subcluster,
      
      // Topology
      topologia: evt.topologia,
      tp_topologia: evt.tp_topologia,
      
      // Categories
      nm_cat_prod2: evt.nm_cat_prod2,
      nm_cat_prod3: evt.nm_cat_prod3,
      nm_cat_oper2: evt.nm_cat_oper2,
      nm_cat_oper3: evt.nm_cat_oper3,
      
      // Audit
      payload: evt 
    }
  }
});
```

### 2. Supabase Node
-   **Operation**: `Upsert`
-   **Table**: `incidents`
-   **Columns**: All columns mapped above.
-   **Conflict Resolution**: Use the `nm_origem, id_mostra` constraint.

## Idempotency
Rerunning the workflow will strictly update records where `nm_origem` and `id_mostra` match, ensuring zero duplication.
