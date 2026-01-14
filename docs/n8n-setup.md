# n8n to GitHub Pages Integration

This guide explains how to set up an n8n workflow to receive GPON events and update the `public/dados_gpon.json` file in this repository.

## Prerequisites

1.  **GitHub Personal Access Token (PAT)**
    - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).
    - Generate a new token (Classic).
    - Scopes: `repo` (Full control of private repositories).
    - **Save this token securely.**

## n8n Workflow Setup

1.  **Trigger Node**: Use a **Webhook** node.
    - Method: POST
    - Path: `/gpon-event` (or your preference)
    - Authentication: Basic Auth (recommended) or None.

2.  **Code Node**: Add a **Code** node after the webhook.
    - Language: JavaScript
    - Mode: Run Once for All Items (or Run Once for Each Item, but typically we process the batch).
    - **Paste the code below:**

```javascript
// Configuration
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE'; // <--- CAUTION: DO NOT COMMIT THIS FILE IF PUBLIC
const OWNER = 'cpralonrj-pralon';
const REPO = 'coprede';
const FILE_PATH = 'public/dados_gpon.json';
const BRANCH = 'main'; // or 'master' depending on your repo default

// GitHub API URL
const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

// Headers
const headers = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'n8n-workflow-bot'
};

try {
  // 1. Get current file content
  const getResponse = await fetch(apiUrl, { headers });
  
  if (!getResponse.ok) {
    throw new Error(`Failed to fetch file: ${getResponse.statusText}`);
  }
  
  const fileData = await getResponse.json();
  const currentSha = fileData.sha;
  
  // Decode Base64 content
  // n8n Node.js environment supports Buffer
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
  let jsonContent = [];
  
  try {
    jsonContent = JSON.parse(currentContent);
  } catch (e) {
    console.log('File is empty or invalid JSON, initializing empty array');
    jsonContent = [];
  }
  
  if (!Array.isArray(jsonContent)) {
      // If for some reason it's an object, wrap it or reset
      jsonContent = [jsonContent];
  }

  // 2. Get New Data from Webhook
  // $input.all() returns an array of items. 
  // We assume the webhook body contains the fields directly or inside a 'body' property.
  // Adjust based on your actual webhook structure.
  const newItems = $input.all().map(item => item.json.body || item.json);
  
  // 3. Append New Data
  // We filter out empty items if any
  const validItems = newItems.filter(item => item && (item.id_mostra || item.nm_origem));
  
  // Add to the beginning (dashboard style) or end? usually end for logs, beginning for feeds.
  // Let's add to the beginning so the newest is first in the JSON
  const updatedJson = [...validItems, ...jsonContent];
  
  // OPTIONAL: Limit size to prevent file from getting too large (e.g. 500 items)
  const LIMITED_SIZE = 500;
  const finalJson = updatedJson.slice(0, LIMITED_SIZE);

  // 4. Encode Content to Base64
  const newContent = Buffer.from(JSON.stringify(finalJson, null, 2)).toString('base64');

  // 5. Update File (Push Commit)
  const body = {
    message: `chore(data): update GPON events via n8n (${validItems.length} new)`,
    content: newContent,
    sha: currentSha,
    branch: BRANCH
  };
  
  const putResponse = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!putResponse.ok) {
    const err = await putResponse.text();
    throw new Error(`Failed to update file: ${err}`);
  }
  
  const result = await putResponse.json();
  
  return {
    json: {
      success: true,
      commit: result.commit.sha,
      items_added: validItems.length
    }
  };

} catch (error) {
  return {
    json: {
      success: false,
      error: error.message
    }
  };
}
```

## Testing

1.  Activate the workflow.
2.  Send a test POST request to your webhook URL with the JSON payload:
    ```json
    {
      "id_mostra": 123,
      "nm_origem": "TEST_AUTO",
      "nm_tipo": "FALHA",
      "nm_status": "NOVO",
      "dh_inicio": "2024-03-20T12:00:00",
      "ds_sumario": "Teste de automação",
      "nm_cidade": "RIO DE JANEIRO",
      "topologia": "ANEL",
      "tp_topologia": "METRO",
      "regional": "RJ",
      "grupo": "CORE"
    }
    ```
3.  Check the `dados_gpon.json` file in GitHub to see if it updated.
