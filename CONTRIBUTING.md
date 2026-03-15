# Contributing to LedgerLlama

First off, thank you for considering contributing to LedgerLlama! It's people like you that make open source such a fantastic community.

## Development Setup

1. Fork the repo and create your branch from `main`.
2. Clone your fork locally.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the Vite development server.

## Making Changes

- Create a feature branch (`git checkout -b feature/my-amazing-feature`).
- Follow the existing code style (Tailwind classes, custom React hooks for DB interactions).
- Ensure your changes work offline (no external backend API calls unless strictly opt-in).
- If modifying the database, add a new migration object to `src/lib/schema.ts` rather than modifying the original setup script.

## Submitting a Pull Request

1. Lint your code (`npm run lint` if configured) and ensure `npm run build` succeeds locally.
2. Push to your fork and submit a PR.
3. Describe your changes clearly in the PR description, including what problem it solves and how you tested it.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
