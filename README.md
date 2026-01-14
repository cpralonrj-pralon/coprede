# COP Rede Dashboard

Este é um Dashboard de Operações de Rede (NOC) moderno e responsivo, integrado com Supabase para autenticação.

## Funcionalidades
- **Autenticação Segura**: Login, Cadastro e Recuperação de Senha via Supabase.
- **Monitoramento em Tempo Real**: Dashboard dinâmico para gestão de ocorrências.
- **Gestão de Usuários**: Controle de acesso e perfis.

## Como Executar Localmente

**Pré-requisitos:** Node.js (v18+)

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto (se não existir) e adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```
   *Nota: Você pode encontrar esses dados nas configurações de API do painel do Supabase.*

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   O projeto estará disponível em `http://localhost:3000`.

## Tecnologias Utilizadas
- **React 19**
- **Vite** (Build tool)
- **Supabase** (Auth & Backend)
- **Tailwind CSS** (Styling)
- **Material Symbols** (Icons)

## Deploy no GitHub Pages
O projeto está configurado para deploy automático via **GitHub Actions**.

**Importante**: Para que o deploy funcione, siga estes passos no seu repositório no GitHub:
1. Vá em **Settings** > **Pages**.
2. Em **Build and deployment** > **Source**, altere de "Deploy from a branch" para **"GitHub Actions"**.
3. Na próxima vez que você fizer um `git push`, o GitHub irá compilar e publicar o site automaticamente.
