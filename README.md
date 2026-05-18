# Appwork

A guided framework that captures the information an engineer or AI needs to build an app — written by people who don't code.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173 (client), http://localhost:5174 (api)
```

Open http://localhost:5173, create a project, fill in the Overview, switch between sections via the sidebar (or the ☰ drawer on mobile).

## Production

```bash
npm run build
npm start         # http://localhost:4173
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `APPWORK_PORT` | `5174` dev / `4173` prod | Server listen port |
| `APPWORK_HOST` | `127.0.0.1` | Server bind address (use `0.0.0.0` for LAN) |
| `APPWORK_PROJECTS_DIR` | `./projects/` | Where project JSON files live |

## Storage and backups

Each save copies the previous file to `projects/.backup/` (rolling 10 per project). Soft-deleted projects move to `projects/.trash/<id>-<timestamp>.json` and can be restored from the project menu (or by hand if the UI is unavailable).

## Importing from v1

The original `legacy/app-planner.html` stored a single project in browser localStorage under the `ap-data` key. Opening v2 for the first time with no projects on disk will offer to import that data as `Untitled (imported from v1)`.

## Sections

Each project captures:

**Core** — Overview, Roles, Screens, Flows  
**Logic & data** — Logic, Data, Integrations, Triggers  
**Context** — Non-goals, Brand, Constraints, Glossary, Open questions

Each section is defined by a config in `client/src/schema/sections/`. Adding a new section is one new config file plus an entry in `index.ts`. Complex sections (Flows, Logic, Data fields) use custom widgets registered in `client/src/sections/`.

## Export

`Export ↗` (or `⌘/Ctrl+E`) opens a modal with three formats:

- **Markdown** — human-readable brief, AI-pasteable, with an "AI planning" footer.
- **JSON** — raw project shape, safe to commit / version-control.
- **Both (.zip)** — `brief.md` + `project.json` in one download.

## Keyboard shortcuts

- `⌘/Ctrl+N` — open project switcher (also serves as create)
- `⌘/Ctrl+K` — open project switcher
- `⌘/Ctrl+E` — open export
- `Esc` — close any open modal/sheet/drawer

## Tests

```bash
npm test              # unit + integration (vitest)
npm run test:e2e      # playwright smoke (needs `npx playwright install chromium` first)
npm run typecheck     # tsc on both client + server
```

## Architecture

- **Client** — Vite + React 18 + TypeScript. Schema-driven section renderer (`client/src/renderer/`) reads section configs (`client/src/schema/sections/`) and dispatches to standard field types or custom widgets (`client/src/sections/<name>/`).
- **Server** — Express + TypeScript. Atomic JSON writes with backup rotation (`server/fs-atomic.ts`). Project CRUD repo (`server/projects.ts`) mounted as REST under `/api/projects` (`server/routes.ts`).
- **Storage** — One JSON file per project under `projects/`. Save is debounced 500ms client-side, with IndexedDB buffer for crash resilience and exponential-backoff retry on network failure.
