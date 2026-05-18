# Appwork v2 — Design Spec

**Date:** 2026-05-18
**Status:** Draft (pending user review)

## 1. Purpose

Appwork is a guided framework for non-technical users to capture everything an engineer or AI needs to build an app: screens, flows, logic, data, roles, integrations, constraints. v1 (`app-planner.html`) is a single-file React-via-CDN tool with five sections (Overview, Screens, Flows, Logic, Data), single-project localStorage persistence, and plain-text export. An untracked component (`app-logic-builder.jsx`) defines a richer typed-attribute logic builder but is not wired in.

v2 replaces the single-file approach with a small Vite + React + TypeScript app served by a tiny Express backend that reads and writes project JSON files from a local folder. It supports multiple concurrent projects, integrates the logic-builder, broadens the question framework, and exports machine-readable JSON alongside upgraded Markdown.

## 2. Goals

1. Run multiple projects in parallel, each a JSON file on disk.
2. Provide a clear framework of questions that captures the information an engineer/AI needs.
3. Export brief in two formats: structured JSON, and AI-pasteable Markdown.
4. Stay extensible — new sections defined as schema config, not hand-coded UI.
5. First-class mobile + desktop support; basic accessibility (keyboard, contrast, labels).

## 3. Non-goals (v2)

- Cloud sync or multi-user collaboration.
- Authentication, accounts, or permissions on the server (it binds to localhost only).
- Generating code from the brief.
- Visual diagramming of flows beyond the structured step list.
- Cross-project linking (e.g. referencing roles across projects).

## 4. Architecture

### 4.1 Stack

- **Client:** Vite + React 18 + TypeScript
- **Server:** Node + Express (TypeScript via `tsx` in dev, compiled in prod)
- **Persistence:** JSON files in a host filesystem directory
- **Dev:** `npm run dev` runs Vite (port 5173) + Express (port 5174) concurrently; Vite proxies `/api/*` to Express
- **Prod:** `npm run build` produces `client/dist/`; Express serves the static bundle plus the API on a single port (default 4173)

### 4.2 Repo layout

```
appwork/
  server/
    index.ts                # Express bootstrap
    projects.ts             # CRUD on projects/*.json
    fs-atomic.ts            # temp-write + rename, backup rotation
    watch.ts                # optional fs.watch broadcast for hot reload
  client/
    src/
      schema/
        sections/           # one file per section config
        index.ts            # ordered export of all sections
        types.ts            # FieldConfig, SectionConfig
      renderer/
        SectionRenderer.tsx # generic schema-driven form
        FieldRenderer.tsx
        widgets.ts          # custom widget registry
      sections/
        flows/              # custom widget for Flow steps
        logic/              # custom widget (Simple rules + Attributes)
        data/               # custom widget (fields sub-list)
      storage/
        api.ts              # fetch wrapper
        debounce.ts
        migrations.ts       # schemaVersion upgrades
      export/
        markdown.ts
        json.ts
        zip.ts
      shell/
        TopBar.tsx
        ProjectSwitcher.tsx
        SectionsDrawer.tsx  # mobile drawer + desktop rail share this
        App.tsx
      theme/
        tokens.ts           # DARK / LIGHT colour tokens
        ThemeProvider.tsx
    index.html
  projects/                 # user data; gitignored by default
  package.json
  tsconfig.json
  vite.config.ts
```

### 4.3 Process model (production)

Single Express process. Static assets at `/`, API at `/api/*`. Binds to `127.0.0.1` by default; `APPWORK_HOST=0.0.0.0` opt-in for LAN exposure. `APPWORK_PORT` and `APPWORK_PROJECTS_DIR` env vars control listen port and data location.

## 5. Storage

### 5.1 Disk layout

```
projects/
  housematch.json
  quiz-app.json
  recipe-ai.json
  .backup/
    housematch-1715912345.json   # rolling, 10 per project
    ...
  .trash/
    quiz-app-1715912345.json     # soft-deleted, restorable from UI
```

Filename = slug derived from `meta.name`, sanitised to `[a-z0-9-]`. Server enforces uniqueness. Rename renames the file.

### 5.2 Project JSON shape

```jsonc
{
  "id": "housematch",
  "meta": {
    "name": "HouseMatch",
    "createdAt": "2026-05-18T10:00:00.000Z",
    "updatedAt": "2026-05-18T10:30:00.000Z",
    "schemaVersion": 1
  },
  "sections": {
    "overview":      { /* object */ },
    "roles":         [ /* list */ ],
    "screens":       [ /* list */ ],
    "flows":         [ /* list */ ],
    "logic": {
      "simpleRules": [],
      "groups":      [],
      "attributes":  [],
      "scoring":     [],
      "conditions":  [],
      "outcomes":    []
    },
    "data":          [],
    "integrations":  [],
    "triggers":      [],
    "nonGoals":      [],
    "brand":         { /* object */ },
    "constraints":   { /* object */ },
    "glossary":      [],
    "openQuestions": []
  }
}
```

### 5.3 API

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/api/projects` | List `{id, name, updatedAt, counts}` |
| `POST`   | `/api/projects` | Create from `{name}`; returns slug |
| `GET`    | `/api/projects/:id` | Full project JSON |
| `PUT`    | `/api/projects/:id` | Replace project body (atomic write, backup taken) |
| `DELETE` | `/api/projects/:id` | Soft delete → moves file to `.trash/` |
| `POST`   | `/api/projects/:id/duplicate` | Copy with `-copy` suffix on slug |
| `POST`   | `/api/projects/:id/rename` | `{name}` → rename file + update meta |
| `POST`   | `/api/projects/import` | Body = JSON; validates schema, writes file |
| `POST`   | `/api/projects/:id/restore` | Restore newest matching `.trash/` file |
| `GET`    | `/api/health` | Server liveness |

### 5.4 Atomic writes & concurrency

- PUT writes to `projects/.tmp/<id>-<rand>.json` then `fs.rename` to target. Backup of previous file copied to `.backup/` first.
- Backup rotation: keep newest 10 per project id, sorted by mtime.
- `If-Match` header carries client-known mtime hash (ETag). Server compares; on mismatch returns `409 Conflict` with current body. Client opens "Reload / Overwrite / Cancel" modal.
- Optional `fs.watch` on `projects/` (toggleable via env) broadcasts SSE events so external edits surface as a "Refresh" prompt.

### 5.5 Client save behaviour

- Debounce 500ms after last edit; trailing save.
- Unsaved buffer in IndexedDB (per project id) so a hard reload during transient network loss doesn't lose work.
- Header shows status dot: gray (idle), amber (saving), green ("Saved", text on desktop only).
- Exponential backoff on save failure: 1s, 3s, 9s, 30s cap; user-visible toast after second failure.

## 6. Schema-driven sections

### 6.1 Types

```ts
type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'enum-chips'
  | 'list'
  | 'ref'        // reference to another section's list items
  | 'custom';

type FieldConfig = {
  key: string;
  label: string;
  hint?: string;
  placeholder?: string;
  type: FieldType;
  optional?: boolean;
  options?: string[];               // select / enum-chips
  itemFields?: FieldConfig[];       // when type='list'
  refSection?: string;              // when type='ref' (e.g. 'roles')
  refMulti?: boolean;
  widget?: string;                  // when type='custom'
};

type SectionConfig = {
  id: string;
  title: string;
  group: 'core' | 'logic' | 'context';
  icon: string;
  intro: string;
  shape: 'object' | 'list';
  fields: FieldConfig[];
};
```

### 6.2 Renderer responsibilities

- Two-column grid on desktop (`>700px`), single column on mobile, controlled by parent breakpoint hook.
- Item add/remove for `shape: 'list'`; collapsed card preview when not editing (current behaviour).
- Custom widgets mounted via `registerWidget(name, Component)`; widget receives `{value, onChange, project, schema}`.
- Counts surfaced to the shell (sidebar badges) via `sectionCounts(project) → Record<sectionId, number>`.
- Empty-section call-to-action: "Add your first X" inline with the `+` button.
- `ref` field renders chip autocomplete sourced from the target section's items (by `id`); multi when `refMulti: true`. In markdown export, ref values render as the target item's `name` (or `term` for Glossary); JSON export keeps the underlying `id` list so cross-refs survive round-tripping.

### 6.3 Custom widgets

- `flows.steps` — keeps the current Action / Screen visit / Decision / System / End step UI with Yes/No branches.
- `logic.tabs` — tabbed UI hosting Simple Rules + Attribute system tabs (Groups, Attributes, Scoring, Conditions, Outcomes).
- `data.fields` — sub-list of `{name, type, required, validationNote}` per data item.

Each custom widget also exports a `renderMarkdown(value): string` companion used by the Markdown exporter.

### 6.4 Migrations

`client/src/storage/migrations.ts` maps `schemaVersion` to upgrade functions. v0 (legacy `ap-data` localStorage shape) → v1 adds new empty sections and reshapes `logic` from array to object with `simpleRules`.

## 7. Sections inventory

Order, grouping, and field summary. Each is its own config file in `client/src/schema/sections/`.

### Core

1. **Overview** *(object)* — `name`, `tagline`, `targetUsers` (list of short strings), `problem`, `uniqueValue`, `successCriteria`.
2. **Roles** *(list)* — `name`, `description`, `canDo`, `cannotDo`, `sampleUser`.
3. **Screens** *(list)* — `name`, `category`, `purpose`, `seenBy` (`ref` → roles, multi), `shows`, `states` (sub-list of `{kind: empty|loading|error|success, description}`).
4. **Flows** *(list)* — `name`, `category`, `description`, `steps` (custom widget), `acceptance`.

### Logic & data

5. **Logic** *(object, custom widget)* — two tabs: Simple rules; Attribute system (Groups, Attributes, Scoring, Conditions, Outcomes — from `app-logic-builder.jsx`, refactored to consume external state).
6. **Data** *(list, custom widget on `fields`)* — `name`, `source` (select), `description`, `usedIn`, `category`, `fields` (sub-list).
7. **Integrations** *(list)* — `name`, `type` (select: auth / payments / email / analytics / storage / AI / maps / other), `purpose`, `whoPays`, `notes`, `configNeeded` (textarea).
8. **Triggers** *(list)* — `name`, `triggerType` (select: time-based / event-based), `when` (plain-English), `does`, `audience` (`ref` → roles, multi).

### Context

9. **Non-goals** *(list)* — `name`, `whyExcluded`.
10. **Brand** *(object)* — `toneWords` (enum-chips: formal/playful/calm/bold/serious/warm/etc — extensible), `references` (textarea; URLs or descriptive notes), `colourDirection` (textarea), `voiceNotes` (textarea).
11. **Constraints** *(object)* — `devices`, `offlineBehaviour`, `languages`, `accessibilityLevel`, `performance`, `dataRetention`.
12. **Glossary** *(list)* — `term`, `definition`.
13. **Open questions** *(list)* — `question`, `status` (select: open / answered / parked), `notes`.

## 8. Shell, navigation, responsive behaviour

### 8.1 Top bar (always visible)

- Logo + app name (desktop only)
- Project chip (current name + ▾) → opens project switcher
- Save status indicator (dot; word "Saved" on desktop)
- Right cluster: theme toggle, `Export ↗`, `⋯` menu (Rename, Duplicate, Delete, Import, Restore from trash)

### 8.2 Sections nav

- **Desktop (`≥700px`):** left rail, always visible. Groups: Core, Logic & data, Context. Section count badges. Active section highlighted with accent left-border.
- **Mobile (`<700px`):** `☰` button in top bar → slide-in drawer from left, full height, focus-trapped. Tap section closes drawer. Sticky search field appears when section count > 10.

### 8.3 Project switcher

- **Desktop:** dropdown anchored under project chip; 260px wide; project list with name + meta (counts + relative time); footer buttons `+ New`, `↑ Import`.
- **Mobile:** bottom sheet with drag handle, same content. Pinned `+ New` + `↑ Import` at bottom.

### 8.4 Empty states

- First launch with no projects: centred "Create your first project" card with name input + "Import JSON" button + optional "Try sample project" link.
- Section with zero items: inline "+ Add your first X" prompt above the regular add button.

### 8.5 Responsive baseline (applies to every view)

- All forms reflow 2-col → 1-col at `<700px`.
- Touch targets ≥ 40px square.
- Sticky `+ Add` button at bottom of long list sections on mobile.
- No fixed widths that cause horizontal scroll.
- Modal/sheet patterns differ by breakpoint: centred modal desktop; bottom sheet mobile.

## 9. Accessibility (enforced from v2.0)

- All icon-only buttons have `aria-label`.
- `:focus-visible` rings restored (accent colour, 2px offset). The v1 habit of `outline:none` is removed.
- Tab order follows visual order; section drawer focus-trap on mobile open.
- Contrast: muted text bumped to ≥ 4.5:1 against backgrounds in both themes (current `#5c6080` on `#0b0c14` ≈ 4.0:1 — adjust palette).
- Form fields paired with `<label>` (already true in v1 markup).
- Live regions: save toast and validation errors use `role="status"`/`role="alert"`.
- Keyboard shortcuts: `⌘/Ctrl+E` Export, `⌘/Ctrl+N` New project, `⌘/Ctrl+K` Project search, `Esc` closes modals/sheets/drawers.

## 10. Export

### 10.1 Trigger

`Export ↗` opens modal (desktop) or sheet (mobile). Format toggle: `Markdown` | `JSON` | `Both (.zip)`. Copy and Download buttons mirror v1.

### 10.2 Markdown

Generated by `client/src/export/markdown.ts`. Iterates `schema/sections` in order; dispatches per `field.type` to a markdown fragment. Custom widgets contribute their own `renderMarkdown(value)`.

Structure:

- H1 = project name
- Blockquote = problem statement
- Per section: H2 title, intro paragraph, fields rendered as labelled lines (object) or markdown tables (list).
- Footer: "Brief for AI planning" with prompts (same intent as v1 questions block, updated for new sections).

### 10.3 JSON

`client/src/export/json.ts` outputs the full project JSON plus a small generator header:

```json
{
  "generator": "appwork",
  "exportedAt": "2026-05-18T...",
  "schemaVersion": 1,
  "project": { /* whole project body */ }
}
```

### 10.4 Bundle

`Both (.zip)` uses JSZip in-browser, builds `{slug}-brief.zip` containing `brief.md` and `project.json`.

## 11. Migration from v1

- On first server start with empty `projects/`, the client checks `localStorage.ap-data`. If present, a banner offers: "Found existing data. Import as 'Untitled project'?"
- "Import" → `POST /api/projects/import` with migrated body (v0 → v1 migration runs client-side first).
- Dismiss → banner disappears, `ap-data` remains untouched until user explicitly chooses.
- Theme preference (`ap-theme`) is read once and adopted as the default for v2.

## 12. Error handling

| Case | UX |
|---|---|
| Network down on save | Toast `Save failed — retrying…`; exponential backoff; IndexedDB buffer retained |
| 409 on PUT (concurrent file change) | Modal: Reload / Overwrite / Cancel |
| 404 on project load | Toast + redirect to project list |
| Duplicate slug on rename | Inline field error, no submit |
| Duplicate slug on import | Server returns 409 with suggested suffixed slug; client modal: Use suggested name / Cancel |
| Invalid JSON on import | Modal with parser error line/column |
| Schema-version newer than client | Read-only banner + Export-only mode |

## 13. Testing

- **Server:** vitest, real filesystem in temp dirs (`tmp.dir()`), atomic-write + backup rotation + restore covered.
- **Renderer:** vitest + React Testing Library. One render snapshot per section config to catch accidental schema drift.
- **Custom widgets:** unit tests for Flow step add/remove/reorder, Logic outcome condition selection, Data field add/remove.
- **Export:** golden-file tests — fixture project JSON → expected `brief.md` and `project.json`.
- **E2E (Playwright):** smoke flows — create project, fill overview, switch project, export markdown. One per critical path, not exhaustive.

## 14. Build, run, deploy

- `npm run dev` — Vite (5173) + Express (5174) concurrently; Vite proxies `/api`.
- `npm run build` — Vite → `client/dist`, server TypeScript compiled to `server/dist`.
- `npm start` — single Express process serves both, default port 4173.
- Env vars: `APPWORK_PORT`, `APPWORK_HOST`, `APPWORK_PROJECTS_DIR`.
- README documents setup, ports, data location, backup strategy, how to host on local server.
- `.gitignore` adds `projects/`, `client/dist/`, `server/dist/`, `node_modules/`, `.superpowers/`.

## 15. Out-of-scope for v2 (deferred)

- Triggers referencing Conditions/Outcomes directly (cross-section binding beyond `roles`).
- Visual flow diagram rendering.
- Multi-user, auth, cloud sync.
- Plugin API for third-party section types.
- AI-assist inside the tool (e.g. "suggest missing screens"). Export-and-paste remains the only AI loop.

## 16. Open decisions

None at this stage of design. The following were chosen during brainstorm and are settled:

- Storage = JSON files in folder (option 1)
- Project switcher = top dropdown (option B)
- Architecture approach = schema-driven sections (approach B)
- Export = both formats with toggle (option 3)
- Tier inclusion = all three (option 1)

## 17. Note on implementation decomposition

This spec is intentionally broad — it captures the full v2 target. The implementation plan (next step) is expected to split delivery into milestones, e.g.:

1. **Scaffold + storage** — repo, server, file IO API, single-project loading using the v1 schema.
2. **Schema-driven renderer** — config types, generic renderer, port the v1 five sections behind the new framework.
3. **Multi-project shell** — top bar, dropdown switcher, mobile sheet, drawer, accessibility baseline.
4. **Logic-builder integration** — port `app-logic-builder.jsx` into the Logic custom widget.
5. **New sections (Tier 1)** — Roles, Integrations, Triggers, Non-goals.
6. **Detail expansions (Tier 2)** — Screen states, Data fields, Flow acceptance criteria, validation notes.
7. **Context sections (Tier 3)** — Brand, Constraints, Glossary, Open questions.
8. **Export upgrade** — Markdown rewrite, JSON output, ZIP bundle, AI footer.
9. **Migration + polish** — v0→v1 importer, error toasts, IndexedDB buffer, keyboard shortcuts, tests.

Each milestone should be independently shippable.
