# LedgerLlama Technical Guide

Welcome to the internal workings of LedgerLlama! This document outlines the architecture and key technical decisions behind this local-first, zero-backend application.

## Core Architecture

LedgerLlama is built entirely on client-side web technologies, meaning **your data never leaves your device unless you choose to export it**.

### 1. SQLite compiled to WebAssembly (WASM)
Instead of communicating with a traditional backend database server (like PostgreSQL or MySQL), LedgerLlama embeds a full standard SQLite database engine directly in your web browser. This is achieved using the official `@sqlite.org/sqlite-wasm` package. 

### 2. Origin Private File System (OPFS)
To make the data persist across page reloads (and even browser restarts), the SQLite database file is stored within the browser's Origin Private File System (OPFS). OPFS is a highly-optimized, sandboxed file system designed for high-performance reading and writing. 

### 3. Local Language Model Inference (WebLLM)
LedgerLlama integrates `@mlc-ai/web-llm` to run advanced generative AI locally. When you first use a feature like "AI Budget Planner" or "Smart Categorization", the browser downloads an instruction-tuned Large Language Model (e.g., Llama-3-8B) and executes it directly on your GPU using WebGPU. No OpenAI keys or external API calls are required.

## Project Structure

- `src/components/`: Reusable React UI components (buttons, modals, charts).
- `src/hooks/`: Custom React hooks connecting the UI to the SQLite OPFS database (e.g., `useTransactions`, `useHabits`, `useIntelligence`).
- `src/lib/`: Core utilities for the database engine (`db.ts`), schema migrations (`schema.ts`), CSV parsing (`csv-import.ts`), and AI Web Worker configuration (`ai-worker.js`).
- `src/pages/`: Primary application views (Dashboard, Transactions, Habits, Intelligence, Settings).

## Schema & Migrations

The database structure is version-controlled inside `src/lib/schema.ts`. When the app initializes, it checks the `schema_migrations` table to determine if new tables or columns need to be created.

Key tables include:
- `transactions`: Core financial records (incomes/expenses).
- `categories`: User-defined spending/income buckets.
- `habits` & `habit_logs`: 7-day trailing habit trackers.
- `budgets` & `goals`: Future financial mapping.

## Security & PWA Features

LedgerLlama is configured as a Progressive Web App (PWA) using `vite-plugin-pwa`. It caches all static assets via a Service Worker, allowing the app to load entirely offline.

To secure sensitive local data when the device is left unattended, an OS-level idle timer (`src/components/LockScreen.tsx`) monitors user activity. After 5 minutes of inactivity, the UI locks itself, requiring a user-configured 4-digit PIN. Exported `.sqlite3` backups can also be encrypted via the AES-GCM Web Crypto algorithm for secure cloud storage.
