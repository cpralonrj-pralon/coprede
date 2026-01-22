# COP Rede Dashboard

Este é um Dashboard de Operações de Rede (NOC) moderno e responsivo, integrado com Supabase para autenticação.

## 📚 Documentação

Para detalhes completos sobre o sistema, consulte a documentação na pasta `docs/`:

-   **[Arquitetura do Sistema](docs/ARCHITECTURE.md)**: Visão geral técnica, stack e fluxo de dados.
-   **[Estrutura do Site](docs/ESTRUTURA.md)**: Detalhamento das páginas, navegação e organização dos arquivos.
-   **[Guia do Usuário](docs/USER_GUIDE.md)**: Como acessar, fazer login e navegar no dashboard.
-   **[Guia do Desenvolvedor](docs/DEVELOPER_GUIDE.md)**: Instalação, configuração e deploy.
-   **[Integração n8n](docs/n8n-setup.md)**: Automação para atualização de dados GPON.

## 🚀 Início Rápido

### Frontend (Dashboard)

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Configure o `.env.local`:**
    ```env
    VITE_SUPABASE_URL=sua_url
    VITE_SUPABASE_ANON_KEY=sua_key
    ```

3.  **Rode o projeto:**
    ```bash
    npm run dev
    ```

### Backend (NestJS)

O backend é responsável pela ingestão de dados e regras de negócio.

1.  Acesse a pasta `backend/`
2.  Instale: `npm install`
3.  Configure `backend/.env` (veja `.env.example`)
4.  Rode: `npm run start:dev`

### Automação (n8n)

Consulte `docs/N8N_INTEGRATION.md` para configurar o fluxo de ingestão de dados via webhooks.

## 🛠 Tecnologias
- **Frontend:** React 19, Vite, Tailwind CSS, Leaflet Maps
- **Backend:** NestJS, Supabase (PostgreSQL)
- **Automação:** n8n Workflows
