# 🚂 Guia de Deploy no Railway

Este guia explica como colocar o Backend (NestJS) no ar usando o Railway.

## 1. Preparação (Já feito!)
- ✅ O código já está configurado para ler a `PORT` do Railway.
- ✅ O arquivo `package.json` tem os scripts corretos.
- ✅ O `start:prod` roda `node dist/main`.

## 2. Criando o Projeto no Railway

1.  Acesse [railway.app](https://railway.app/) e faça login (pode usar o GitHub).
2.  Clique em **New Project** > **Deploy from GitHub repo**.
3.  Selecione o repositório `coprede`.
4.  **IMPORTANTE:** Como o backend está numa subpasta (`backend/`), precisamos avisar o Railway.

## 3. Configurando a Pasta Raiz (Root Directory)

Assim que o projeto for criado, ele vai tentar fazer o build e falhar (porque vai tentar rodar o frontend). Cancele o build ou espere falhar, e então:

1.  Clique no serviço criado (coprede).
2.  Vá na aba **Settings**.
3.  Encontre **Root Directory**.
4.  Mude para: `/backend`
5.  O Railway vai detectar automaticamente que é um projeto Node/NestJS e reiniciar o build.

## 4. Configurando Variáveis de Ambiente (Environment Variables)

O Backend precisa saber como conectar no Supabase.

1.  Vá na aba **Variables**.
2.  Adicione as seguintes variáveis (pegue os valores do seu `.env` local):
    *   `SUPABASE_URL`: (Sua URL do Supabase)
    *   `SUPABASE_KEY`: (Sua Service Role Key ou Anon Key - para backend recomenda-se Service Role se for fazer ingestão)
    *   `API_KEY`: (Sua senha personalizada definida no Guard, ex: `segredo_super_seguro`)

## 5. Gerando o Domínio Público

1.  Vá na aba **Settings**.
2.  Em **Networking**, clique em **Generate Domain**.
3.  Ele vai criar algo como: `coprede-backend-production.up.railway.app`.
4.  **Copie esse link!** Esse é o seu novo endpoint.

## 6. Atualizando o N8N

Agora que você tem o link (ex: `https://coprede-backend.up.railway.app`), vá no seu workflow do N8N:

1.  Abra o nó **HTTP Request** (Webhook call).
2.  Mude a URL de `http://localhost:3000/ingestion/incident` para:
    `https://coprede-backend.up.railway.app/ingestion/incident`
3.  Certifique-se que o Header `x-api-key` está igual ao que você configurou nas variáveis do Railway.

🎉 **Pronto! Seu backend está na nuvem!**
