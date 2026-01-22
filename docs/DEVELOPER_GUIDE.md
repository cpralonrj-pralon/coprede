# Developer Guide

## Prerequisites
-   **Node.js**: Version 18 or higher.
-   **npm**: Comes with Node.js.
-   **Git**: For version control.
-   **VS Code** (Recommended): IDE for development.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/cpralonrj-pralon/coprede.git
    cd coprede
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Environment Setup
The application uses Supabase for backend services. You need to configure environment variables.

1.  Create a file named `.env.local` in the project root.
2.  Add the following keys (get these from your Supabase project settings):
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

## Running Locally
To start the development server:

```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port shown in the terminal).

## Building for Production
To create an optimized build for deployment:

```bash
npm run build
```
The output will be in the `dist/` directory. You can preview the build locally using:
```bash
npm run preview
```

## Deployment
This project is configured to deploy automatically to **GitHub Pages** using GitHub Actions.

1.  Push changes to the `main` branch.
2.  The workflow defined in `.github/workflows/deploy.yml` will trigger.
3.  It builds the project and deploys the `dist` folder to the `gh-pages` branch.

**Configuration Check:**
Ensure "Workflow permissions" in GitHub Repository Settings -> Actions -> General is set to **Read and write permissions** to allow the workflow to push to the `gh-pages` branch.

## Updating Data
-   **Mock Data**: Modify `MOCK_INCIDENTS` or `MOCK_SGO_INCIDENTS` in `src/apiService.ts`.
-   **GPON Data**: The file `public/dados_gpon.json` simulates live data. It can be updated manually or via automation (see `docs/n8n-setup.md`).
