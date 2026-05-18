# Appwork v2 — Feedback Addendum

> Follow-up plan for three UX changes requested after Tasks 1-20 landed. To be executed AFTER Tasks 21-27 of the main plan (or interleaved if priorities shift).

**Goal:** Replace Logic tab UI with nav-level submenu items; add accordion explainers per logic subsection; allow custom user-defined notes on the Overview page.

**Prior plan:** `docs/superpowers/plans/2026-05-18-appwork-v2.md` (Tasks 1-27).

---

## Background

User feedback after seeing the v2 alpha:

1. **Logic tabs → nav submenu.** Tab bar inside the Logic section eats vertical space and feels cramped. Move the six sub-tools (Simple rules, Groups, Attributes, Scoring, Conditions, Outcomes) to first-class entries in the sidebar nav, indented under a Logic parent. Each page now owns the full content area.
2. **Per-subsection explainers.** Each logic sub-tool needs a short accordion explainer at the top so a non-technical user can decide whether the section is relevant before reading the fields.
3. **Custom fields on Overview.** The fixed Overview field set is a constraint. Add an open-ended list where users can capture ad-hoc ideas/notes/references tied to the project.

## Design

### Storage refactor (item 1)

The current `project.sections.logic` stores `{ simpleRules, groups, attributes, scoring, conditions, outcomes }` as one object (LogicState). With six independent nav entries each owning their own section slot, we split it into six top-level slots:

| Slot | Shape |
|---|---|
| `project.sections.logicRules` | `SimpleRule[]` |
| `project.sections.logicGroups` | `Group[]` |
| `project.sections.logicAttributes` | `Attribute[]` |
| `project.sections.logicScoring` | `ScoringRule[]` |
| `project.sections.logicConditions` | `Condition[]` |
| `project.sections.logicOutcomes` | `Outcome[]` |

`project.sections.logic` is repurposed: holds nothing (parent is content-light overview page) — does not need its own storage slot.

Cross-references (Attributes uses Groups; Scoring/Conditions use Attributes+Groups; Outcomes uses Conditions+Attributes) read from sibling `project.sections.*` slots via the `project` prop passed to every widget. No change to FieldRenderer API.

### Schema additions

`SectionConfig` gains two optional fields:

```ts
type SectionConfig = {
  // ...existing...
  details?: string;     // long-form accordion explainer rendered below intro
  parentId?: string;    // id of another section; when set, this section renders indented under parent in the nav
};
```

### Section inventory after refactor

Logic group becomes:

- `logic` (parent) — `shape: 'object'`, custom widget `logic-overview` that renders six cards linking to children
- `logic-rules` (child, `parentId: 'logic'`) — `shape: 'list'`, custom widget `logic-rules`
- `logic-groups` (child) — `shape: 'list'`, custom widget `logic-groups`
- `logic-attributes` (child) — `shape: 'list'`, custom widget `logic-attributes`
- `logic-scoring` (child) — `shape: 'list'`, custom widget `logic-scoring`
- `logic-conditions` (child) — `shape: 'list'`, custom widget `logic-conditions`
- `logic-outcomes` (child) — `shape: 'list'`, custom widget `logic-outcomes`

Each child config carries a `details` paragraph (the accordion explainer copy).

`logic.ts` parent config has no `details` (it's a hub) but a clear `intro` describing what the Logic area is for.

Overview adds one list field:

```ts
{
  key: 'customNotes', label: 'Custom notes', type: 'list', optional: true,
  hint: 'Anything else worth keeping with this project — ideas, references, open thoughts, links.',
  itemFields: [
    { key: 'name', label: 'Title', type: 'text', placeholder: 'e.g. Inspiration, Tech notes' },
    { key: 'content', label: 'Notes', type: 'textarea' },
  ],
}
```

### Renderer changes

`SectionRenderer.tsx` renders `<details>` element after `intro` if `config.details` is set. Closed by default. Uses muted summary + body copy. Themed colour tokens.

### Sidebar nav changes

`SectionsNav.tsx`:
- Iterate sections in declared order. For each:
  - If `parentId` matches a section we already rendered → indent (extra 16px left padding).
  - Otherwise render flush left.
- Parents stay selectable (click → shows overview content).
- No expand/collapse toggle in v1 of this change — always-expanded keeps a11y simple. Add toggle later if list gets crowded.

### Logic overview widget

`logic-overview` widget reads `setSection` from a new `NavigationContext` and renders a responsive grid of six cards:

```
Simple rules     Groups
"Plain-English   "Colour-coded
rules. When X    labels to
then Y."         organise rules."

Attributes       Scoring
...              ...
```

Each card click → `setSection(child.id)`. Mobile: 1-col grid; desktop: 2 or 3 col.

### Navigation context

```ts
// client/src/shell/NavigationContext.tsx
import { createContext, useContext } from 'react';
export const NavigationCtx = createContext<{ setSection: (id: string) => void }>({ setSection: () => {} });
export const useNavigation = () => useContext(NavigationCtx);
```

Provided by Shell in `App.tsx` near where `setSection` is owned.

### Logic widget refactor

Each existing tab component (`SimpleRules.tsx`, `Groups.tsx`, `Attributes.tsx`, `Scoring.tsx`, `Conditions.tsx`, `Outcomes.tsx`) is refactored from the current `{ state: LogicState, onChange }` shape into a `FieldRendererProps`-compatible widget that:

- Reads its slice from the `value` prop (e.g. `Attribute[]`).
- Reads sibling slices (groups, attributes, conditions) from `project.sections.<sibling>` via the `project` prop.
- Dispatches updates via the standard `onChange` callback (so the surrounding renderer writes the slice back to the section's own slot).

`LogicTabsWidget.tsx` is deleted along with its tab-bar UI; the tabs folder contents become the new per-section widgets, registered individually in `client/src/sections/logic/index.ts`.

`state.ts` keeps the per-record TypeScript types (`Group`, `Attribute`, `ScoringRule`, `Condition`, `Outcome`, `SimpleRule`, `GROUP_COLORS`) but drops the combined `LogicState` + `emptyLogic` helpers.

## Tasks (8 incremental)

Add to the main plan as Phase 11.5 / Phase 12 (post-Tier-3 sections, before export). Order assumes Tasks 21-22 already landed (logic group has new neighbours but Logic itself is untouched).

### Task A: Schema additions

**Files:** `client/src/schema/types.ts`

Add `details?: string` and `parentId?: string` to `SectionConfig`. Commit:

```
feat(schema): add details + parentId to SectionConfig
```

### Task B: SectionRenderer renders accordion

**Files:** `client/src/renderer/SectionRenderer.tsx`

After the intro paragraph, if `config.details` is present, render a `<details><summary>What to put here</summary><div>...</div></details>` block. Theme the summary with muted text + border, body with normal text + lineHeight 1.7. Closed by default. Commit:

```
feat(renderer): accordion explainer below section intro
```

### Task C: Navigation context

**Files:** `client/src/shell/NavigationContext.tsx` (new), `client/src/App.tsx` (wrap Shell content with provider supplying `setSection`)

Commit:

```
feat(shell): navigation context for cross-section links
```

### Task D: SectionsNav supports `parentId`

**Files:** `client/src/shell/SectionsNav.tsx`

When iterating sections within a group, indent any section whose `parentId` matches a section in the same group. Indent = 16px additional left padding on the button. Active state styling unchanged. Commit:

```
feat(shell): indent child sections under parent in nav
```

### Task E: Split logic into six section configs

**Files:** `client/src/schema/sections/logic.ts` (rewrite as parent), six new files (`logic-rules.ts`, `logic-groups.ts`, `logic-attributes.ts`, `logic-scoring.ts`, `logic-conditions.ts`, `logic-outcomes.ts`), `client/src/schema/sections/index.ts` (register).

Each child:
- `shape: 'list'` (their actual data shape — a list of items)
- `parentId: 'logic'`
- `group: 'logic'`
- One `custom` field referencing the matching widget name
- `details` field with 1-3 sentence explainer

Parent `logic`:
- `shape: 'object'`, single custom field `widget: 'logic-overview'`
- `intro`: "Capture how the app decides things. Six sub-tools cover rules, groups, attributes, scoring, conditions, and outcomes — pick the ones your app needs."
- No `details` (overview cards explain each child).

Commit:

```
feat(schema): split logic into six child sections + overview hub
```

### Task F: Refactor logic widgets

**Files:** `client/src/sections/logic/state.ts` (drop LogicState), `client/src/sections/logic/tabs/*.tsx` (refactor to FieldRendererProps + read cross-refs from project), `client/src/sections/logic/LogicTabsWidget.tsx` (delete), `client/src/sections/logic/LogicOverviewWidget.tsx` (new), `client/src/sections/logic/index.ts` (register all seven widgets).

For each widget, the body of the existing tab component is preserved verbatim. The wrapper just:
1. Coerces `value` to the slice type.
2. Reads cross-refs from project (e.g. Attributes widget reads `project.sections.logicGroups` to populate the group dropdown).
3. Dispatches updates via standard `onChange`.

`tabs/` folder may be flattened into `widgets/` once refactored.

Commit:

```
feat(logic): per-subsection widgets reading cross-refs from project
```

### Task G: Overview custom notes field

**Files:** `client/src/schema/sections/overview.ts`

Append the `customNotes` list field with item fields `{ name: text, content: textarea }`. Commit:

```
feat(overview): custom notes list for ad-hoc project ideas
```

### Task H: Migration shim for existing data

**Files:** `client/src/storage/migrations.ts` (or inline in App.tsx bootstrap if migrations file does not yet exist)

On project load, if `project.sections.logic` is an object with the old LogicState shape (any of the six known keys present and `project.sections.logicRules` is undefined), migrate:

```ts
const old = project.sections.logic as Partial<LogicState> | undefined;
if (old && (old.simpleRules || old.groups || old.attributes || old.scoring || old.conditions || old.outcomes)) {
  project.sections.logicRules      = old.simpleRules ?? [];
  project.sections.logicGroups     = old.groups      ?? [];
  project.sections.logicAttributes = old.attributes  ?? [];
  project.sections.logicScoring    = old.scoring     ?? [];
  project.sections.logicConditions = old.conditions  ?? [];
  project.sections.logicOutcomes   = old.outcomes    ?? [];
  delete (project.sections as Record<string, unknown>).logic;
  // bump schemaVersion if needed
}
```

Runs once on first load after the refactor. Persists on next save. No-op for new projects. Commit:

```
feat(migrations): map v2-alpha logic object to per-subsection slots
```

## Sequencing

A → B → C → D in any order (small isolated changes). Then E and F are tightly coupled — do E + F together in one PR if possible. Then G. Then H last.

After all 8 tasks: run `npm run dev`, open a project, verify:
- Logic in nav shows six indented children under it.
- Click each child → page renders with accordion + list editor.
- Cross-refs (Attributes group dropdown, Outcomes condition checkboxes) populate from sibling sections.
- Overview "Custom notes" list adds/removes rows; saved to disk.
- Reload page — data persists.

## Out of scope

- Collapse/expand toggle on the Logic parent (always expanded).
- Cross-project linking.
- Drag-to-reorder sub-sections.
- Inline reordering within each subsection list.
- Conditional rendering (e.g. hide Scoring if no Attributes exist).
- Notification when a removed Attribute leaves dangling Condition references.
