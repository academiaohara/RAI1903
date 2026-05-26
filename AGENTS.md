# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 16 frontend application (App Router, React 19, TypeScript, Tailwind CSS v4). There is no backend, database, or external API — all data is mocked in `/data/mock.ts`.

### Running the app

```bash
npm run dev        # Starts Next.js dev server on http://localhost:3000
```

### Lint, typecheck, build

```bash
npm run lint       # ESLint with --max-warnings=0 (zero warnings policy)
npm run typecheck  # tsc --noEmit (strict mode)
npm run build      # Next.js production build
```

### Key notes

- No test framework is configured (no Jest, Vitest, or Playwright). Validation relies on lint, typecheck, and manual browser testing.
- No environment variables are needed — the app runs entirely on mock data.
- The dev server uses Turbopack for fast refresh.
- Browser state (Quiniela predictions) persists via `localStorage` only.
- Package manager is **npm** (lockfile: `package-lock.json`).
