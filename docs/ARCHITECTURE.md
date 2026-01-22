# Architecture Documentation

## System Overview
The COP Rede Dashboard is a modern, responsive Network Operations Center (NOC) dashboard designed to monitor and manage network incidents. It integrates with Supabase for authentication and backend services, and uses React with Vite for the frontend.

## Technology Stack

### Frontend
-   **Framework**: [React 19](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Maps**: [Leaflet](https://leafletjs.com/) with `react-leaflet`
-   **Charts**: [Recharts](https://recharts.org/)
-   **Icons**: Material Symbols

### Backend / Services
-   **Supabase**: Used for Authentication (Auth), Database (Postgres), and potentially Realtime subscriptions.
-   **GitHub Pages**: Host for the static frontend application.
-   **GitHub Actions**: CI/CD pipeline for automated deployment.

## Project Structure

```
coprede/
├── .github/              # GitHub Actions workflows (CI/CD)
├── docs/                 # Documentation (Architecture, Guides)
├── public/               # Static assets (images, JSON data)
├── src/                  # (Implicit source root - Vite uses root)
│   ├── components/       # Reusable UI components (Cards, Charts, Maps)
│   ├── pages/            # Page components (Dashboard views)
│   ├── apiService.ts     # API interaction layer (Supabase, Mock data)
│   ├── App.tsx           # Main application component & Routing
│   ├── main.tsx          # Entry point
│   ├── types.ts          # TypeScript interfaces and definitions
│   └── constants.ts      # Global constants and configuration
├── .env.local            # Local environment variables (Supabase keys)
├── package.json          # Project dependencies and scripts
├── vite.config.ts        # Vite configuration
└── README.md             # Entry point documentation
```

## Data Flow

1.  **Data Ingestion**:
    -   **Incidents/Events**: Fetched via `apiService.ts`.
    -   **Sources**:
        -   **Supabase**: For authenticated user data and persistent application state.
        -   **Mock Data**: Currently used for simulating Incidents (`fetchRawIncidents`) and SGO Incidents (`fetchSGO`).
        -   **Static JSON**: `dados_gpon.json` (in `public/`) is fetched for GPON events, updated via external workflows (e.g., n8n).

2.  **State Management**:
    -   Local component state (`useState`, `useEffect`) is primarily used for managing fetched data and UI state.
    -   React Context (if applicable) or prop drilling handles passing data to child components.

3.  **Visualization**:
    -   Data is transformed in `apiService.ts` (e.g., `calculateMetrics`, `calculateSgoMetrics`) before being passed to `Dashboard.tsx` or other views.
    -   `Recharts` renders statistical data (Evolution, Top Failures).
    -   `Leaflet` renders geospatial data (Map markers for incidents).

## Key Components

-   **Dashboard**: The central hub displaying KPIS, charts, and maps. It switches views based on selected tabs (Overview, SGO, GPON).
-   **MapView**: Detailed map visualization using Leaflet tiles and markers.
-   **IncidentTable**: Tabular view of active incidents.
-   **KPICards**: High-level summary metrics (Total, Pending, Efficiency).
