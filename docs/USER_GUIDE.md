# User Guide

## Accessing the System
The COP Rede Dashboard is accessible via web browser.
-   **URL**: [Link to your GitHub Pages or deployed domain]

## Authentication
The system is protected by Supabase Authentication.

1.  **Login**:
    -   Enter your email and password on the login screen.
    -   Click "Entrar".
2.  **Sign Up (Cadastro)**:
    -   Click on the "Cadastrar" link.
    -   Fill in your details.
    -   *Note: Registration may require admin approval or email verification depending on configuration.*
3.  **Password Recovery**:
    -   Click "Esqueci minha senha" to receive a reset link via email.

## Dashboard Overview
Once logged in, you will see the main Dashboard. It is divided into several key areas:

### 1. KPI Cards (Top Row)
-   **Total Incidents**: Total number of events currently tracked.
-   **Pendentes (Pending)**: Incidents that are new or open.
-   **Tratadas (Treated)**: Incidents currently being worked on or resolved.
-   **Eficiência**: A percentage score based on treated vs. total incidents.

### 2. Main Metrics (Charts)
-   **Evolução Temporal**: A line chart showing the volume of incidents over time (hourly/daily).
-   **Top Falhas/Sintomas**: A bar chart highlighting the most frequent types of network failures.

### 3. Interactive Map
-   Visualizes incident locations on a map.
-   Markers are color-coded based on severity or type.
-   Clicking a marker shows detailed information about the event.

## Navigating Views
The dashboard supports different operational views, accessible via tabs or navigation menu:

-   **Visão Geral**: Aggregated metrics for all network types.
-   **SGO**: Specific view for "Sistema de Gerência de Ocorrências" data.
-   **GPON**: Focused view for GPON/Fiber network events.
-   **Massivas**: High-level view for massive outages affecting large areas.
