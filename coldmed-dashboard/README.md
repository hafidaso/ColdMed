# 🖥️ ColdMed Dashboard — Cold Chain Triage & Analytics Frontend

This directory contains the interactive administrative dashboard for the **ColdMed** cold chain monitoring platform. Built using **React 19**, **TypeScript**, **Vite**, and styled with **Tailwind CSS**, it serves as a prototype workspace designed to illustrate how quality-review teams and logistics supervisors could explore vaccine cold-chain observations and analytical signals.

---

## ✨ Features

*   **⚡ Modern Stack**: React 19, Vite, TypeScript, and Tailwind CSS.
*   **📊 Interactive Visualizations**: Dynamic charts powered by `Recharts` for batch thermal profiles, anomaly timelines, and classification statistics.
*   **📂 Direct CSV Ingestion**: Employs `PapaParse` to parse the Python notebook exports client-side, allowing the dashboard to be run locally or deployed statically to GitHub Pages, Netlify, or Vercel without a backend database.
*   **📡 IoT Extension View (Roadmap)**: An interactive tab presenting the planned integration architecture using ESP32, MQTT, Fusion ABA, and real-time analytical monitoring.
*   **🩺 Medical Cold Chain Theme**: Custom color scheme utilizing medical navy blues (`#0f172a`, `#1e293b`) and ice/cyan blues (`#06b6d4`, `#0891b2`) to create a professional medical dashboard look.

---

## 📂 Codebase Architecture

```
coldmed-dashboard/
├── public/
│   └── data/                    # CSV dataset files exported from the python notebook
├── src/
│   ├── components/
│   │   └── layout/              # AppLayout container and Sidebar navigation
│   ├── context/
│   │   └── DataContext.tsx      # State manager: loads, caches, and verifies all data layers
│   ├── pages/                   # Modules & page views
│   │   ├── DashboardOverview.tsx
│   │   ├── BatchSurveillance.tsx
│   │   ├── BatchDetail.tsx
│   │   ├── ThermalAnalysis.tsx
│   │   ├── QualityReview.tsx
│   │   ├── LogisticsTraceability.tsx
│   │   ├── AnalyticalIntelligence.tsx
│   │   ├── AuditReports.tsx
│   │   └── IoTExtension.tsx
│   ├── services/
│   │   └── dataService.ts       # CSV fetchers, parsers, types, and schema validator
│   ├── App.tsx                  # Router definitions (React Router DOM v7)
│   ├── main.tsx                 # App mount
│   └── index.css                # Tailwind utility layers
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🛠️ Dashboard Pages

1.  **Vue d'ensemble (Overview)**: Validated KPIs for analysed batches, observed immunization-site arrivals, explicit discard-related outcomes, validation discrepancies and analytical signals.
2.  **Surveillance des lots (Surveillance)**: Main searchable data table showing the inventory of all 30 vaccine batches and their current status.
3.  **Détail du lot (Batch Detail)**: Interactive temperature and humidity charts for individual batches, showing full step-by-step audit logs.
4.  **Analyse thermique (Thermal Analysis)**: Evaluates thermal profiles, maximum temperatures, and cumulative time-out-of-bounds across all lots.
5.  **Revue qualité (Quality Review)**: Workboard listing shipments with critical quality flags (expired or mismatched) with a simulated review workflow for examining critical signals and documenting prototype review actions.
6.  **Traçabilité logistique (Logistics Traceability)**: Analysis of transportation hops and storage units, displaying average temperatures and transit times.
7.  **Intelligence analytique (Analytical Intelligence)**: Displays ML-based diagnostics:
    *   *Unsupervised (Isolation Forest)*: Top 5 prioritizations, contamination sensitivity curve, and lot-specific anomaly timeline charts.
    *   *Supervised (Exploratory Classification)*: Accuracy and F1-score comparisons, confusion matrices, and feature importances for Decision Tree and Logistic Regression models.
8.  **Audit & rapports (Audit & Reports)**: Displays a simulated traceability-reporting workflow and supports transparent review of the prototype’s analytical outputs.
9.  **Extension IoT (IoT Extension)**: Presents the planned integration architecture using ESP32, MQTT, Fusion ABA and real-time analytical monitoring.

---

## 📊 Data Feed Configuration

The dashboard fetches data directly from the files located in the `public/data/` folder. When you run the Python analysis notebook, it automatically exports updated analytical CSVs. Ensure the following files exist in `public/data/`:

| Filename | Purpose |
| :--- | :--- |
| `coldmed_batch_dashboard_corrige.csv` | General batch records (temperatures, storage hours, alerts) |
| `coldmed_final_state_corrige.csv` | Final observed state for each batch after hourly aggregation |
| `coldmed_kpis_dashboard_corrige.csv` | Core dashboard KPI values |
| `coldmed_lots_a_valider.csv` | Batches marked with critical alerts for quality review |
| `coldmed_anomaly_scores.csv` | Full telemetry observations with Isolation Forest scores |
| `coldmed_anomaly_flagged_observations.csv` | Hourly thermal profiles flagged by the exploratory Isolation Forest model |
| `coldmed_anomaly_batch_summary.csv` | Batch-level anomaly metrics |
| `coldmed_anomaly_top5_priority.csv` | Top 5 priority batches ranked by exploratory atypicality score |
| `coldmed_anomaly_kpis.csv` | Anomaly statistics KPIs |
| `coldmed_anomaly_sensitivity.csv` | Isolation forest contamination sensitivity simulation |
| `coldmed_classification_model_metrics.csv` | Classifier evaluation scores (Accuracy, F1, etc.) |
| `coldmed_classification_feature_importance.csv` | Machine learning model feature coefficients |
| `coldmed_classification_predictions_exploratory.csv` | Actual vs Predicted outcomes |

---

## 🚀 Commands

To set up and run the dashboard locally:

### 1. Install Dependencies
Ensure you have Node.js (v18+) installed.
```bash
npm install
```

### 2. Run Local Development Server
Starts Vite and loads the dashboard locally.
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

### 3. Build for Production
Compiles TypeScript and bundles static assets into the `dist/` directory.
```bash
npm run build
```

### 4. Code Quality
Runs ESLint to scan the project files.
```bash
npm run lint
```
