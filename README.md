# LedgerLlama 🦙 — The Post-SaaS Dashboard

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)

A fully local-first, zero-backend, SQLite-WASM powered finance and habit intelligence dashboard with local AI analysis.

LedgerLlama runs entirely within your browser. It combines a highly-stylized modern UI built with React + Vite + Tailwind CSS with the sheer power of an embedded SQLite WASM database via OPFS. In addition to personal finance and habit tracking, it uses `@mlc-ai/web-llm` to process data directly in the browser to offer LLM-powered categorization and insights!

## ✨ Features

- **Dashboard & UI Framework**
  - Clean, modern, responsive glassmorphism UI using Tailwind CSS (`var(--background)`, `var(--card)`, etc.).
  - Integrated `lucide-react` for beautiful iconography.
  - Dynamic routing to sub-pages: Dashboard, Transactions, Habits, Intelligence, and Settings.

- **SQLite WASM & OPFS**
  - Database resides in an Origin Private File System (`sqlite3_opfs_async_vfs`), allowing persistent fast reads/writes *without* ever needing a backend.
  - Full schema setup (`schema.sql`) for transactions, categories, habits, and logs.

- **Transaction Management**
  - Implemented standard CRUD (Create, Read, Update, Delete) UI for financial transactions.
  - Securely log incomes and expenses manually.
  - **Smart Search**: Integrated fuzzy filtering into the Transactions grid to easily sort by category and description.

- **Habit Tracker system**
  - Track daily consistencies on a 7-day trailing axis.
  - Clean UI that maps boolean progress to habits inside the local SQLite database.

- **Charting Insights Layer**
  - Visualize 30-day expense trends with `Chart.js`.
  - Doughnut charts representing categorical breakdowns.

- **CSV Import Utility**
  - PapaParse integration allows seamless drag-and-drop or file uploading of banking CSVs.

- **WebLLM AI Intelligence**
  - Embedded `@mlc-ai/web-llm` running inside a Web Worker.
  - Downloads an 8-B parameter instruction-tuned model (e.g., Llama-3-8B) to your GPU cache.
  - Complete data privacy: 100% of LLM queries happen locally on your own hardware!
  - **AI Budget Planner**: Embedded a full conversational chat inside the Intelligence view using WebLLM for immediate financial advice.
  - Batch categorizes uncategorized transactions and offers an "AI Financial Advisor" for 30-day analyses.

- **Data Export, Privacy & Security**
  - Export the raw `.sqlite3` OPFS DB via the File System Access API.
  - CSV and JSON backups allow users to download raw `.csv` or `.json` reports.
  - **Security Module**: Includes a `LockScreen` wrapper monitoring OS-level idle properties (`mousemove`, `keydown`) to lock the app after 5 minutes of inactivity with a PIN.
  - **AES-GCM Encryption**: Optional Web Crypto API encryption when exporting backups.

- **PWA Enablement & Performance**
  - `vite-plugin-pwa` caching for CSS/JS bundles.
  - React lazy loading out-of-the-box (`Suspense`) for splitting Intelligence models into chunks.
  - SQL indexes targeting frequently requested aggregations.

## 🚀 Getting Started

To run LedgerLlama locally:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🛠 Tech Stack

- **Frontend Core:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS, Lucide React
- **Database:** SQLite WASM, OPFS (Origin Private File System)
- **AI/ML:** `@mlc-ai/web-llm`
- **Charting:** Chart.js, react-chartjs-2
- **Data parsing:** PapaParse

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
