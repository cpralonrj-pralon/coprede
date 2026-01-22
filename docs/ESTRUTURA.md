# Estrutura do Site

Este documento detalha a estrutura interna do site, a organização dos arquivos e o fluxo de navegação.

## 1. Visão Geral da Navegação

O aplicativo utiliza um roteamento baseado em estado (single-page application) gerenciado no componente principal `App.tsx`.

### Fluxo Principal
1.  **Login (`Login.tsx`)**: Tela inicial para usuários não autenticados.
2.  **Dashboard (`Dashboard.tsx`)**: Tela principal após o login. Contém a visão geral, KPIs e mapas.
3.  **Monitoramento (`Monitor.tsx`)**: Tela detalhada de incidentes (acessada via `Monitoramento` ou clique em incidente).
4.  **Gestão de Usuários (`UserManagement.tsx`)**: Área administrativa para criar e gerenciar usuários.
5.  **Alertas (`Alerts.tsx`)**: Configuração e visualização de alertas do sistema.
6.  **Relatórios (`Reports.tsx`)**: Geração e visualização de relatórios operacionais.

O menu lateral (`components/Navigation.tsx`) controla a troca entre essas visualizações.

## 2. Estrutura de Diretórios e Arquivos

### `src/` (Raiz do código fonte)
-   **`App.tsx`**: O "coração" da aplicação. Gerencia o estado da sessão (login/logout) e qual tela está sendo exibida.
-   **`main.tsx`**: Ponto de entrada do React que "monta" o aplicativo no HTML.
-   **`apiService.ts`**: Camada de serviço. Todas as chamadas de dados (seja para o Supabase ou dados mockados) ficam aqui. Centraliza a lógica de buscar incidentes.
-   **`constants.ts`**: Constantes globais do sistema.
-   **`types.ts`**: Definições de tipos TypeScript (Interfaces para Usuário, Incidente, etc.).

### `src/pages/` (Telhas Completas)
Aqui ficam os componentes que representam uma "tela" inteira.
-   **`Login.tsx`**: Formulário de autenticação.
-   **`Dashboard.tsx`**: A tela mais complexa. Possui abas internas (Visão Geral, SGO, GPON) e renderiza os gráficos e mapas.
-   **`Monitor.tsx`**: Tela focada em uma lista ou detalhe de incidentes ativos.
-   **`UserManagement.tsx`**: Tabela de usuários com permissões de editar/excluir.
-   **`Alerts.tsx`**: Interface para alarmes.
-   **`Reports.tsx`**: Interface para relatórios.

### `src/components/` (Componentes Reutilizáveis)
Pedaços de interface usados dentro das páginas.
-   **`Navigation/`**: O menu lateral/inferior.
-   **`ui/`**: Botões, inputs e elementos de design genéricos.
-   **`charts/`**: (Se existir) Componentes isolados para os gráficos do Recharts.

### `public/` (Arquivos Estáticos)
-   **`dados_gpon.json`**: Arquivo JSON que alimenta a visão GPON. Este arquivo é atualizado externamente (ex: via n8n).
-   **Imagens e ícones**: Assets estáticos.

## 3. Detalhamento do Dashboard (`Dashboard.tsx`)

O Dashboard é o componente central e possui uma lógica interna de abas:
-   **Aba Geral**: Mostra métricas consolidadas.
-   **Aba SGO**: Filtra e exibe dados vindo da API do SGO (mockada em `apiService`).
-   **Aba GPON**: Lê os dados de `public/dados_gpon.json`.
-   **Aba Massivas**: Foca em grandes incidentes.

### Principais Elementos do Dashboard
-   **KPI Cards**: Cards no topo com números totais.
-   **Leaflet Map**: Mapa interativo mostrando a localização dos problemas.
-   **Gráficos**: "Evolução Temporal" e "Top Falhas" gerados com a biblioteca `Recharts`.

## 4. Integração de Dados

Todo o fluxo de dados segue este padrão:
1.  O componente (ex: `Dashboard`) chama uma função de `apiService.ts` (ex: `fetchSGO()`) ao carregar (`useEffect`).
2.  `apiService` busca os dados (do Supabase, arquivo JSON ou Mock).
3.  `apiService` processa os dados (calcula totais, formata datas).
4.  O componente recebe os dados prontos e atualiza a tela.
