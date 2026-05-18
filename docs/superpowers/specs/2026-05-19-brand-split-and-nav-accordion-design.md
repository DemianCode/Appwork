# Brand Split, Nav Accordion, Tone Editing, Colour Picker — Design

> Follow-up to `2026-05-18-appwork-v2-addendum-feedback.md`. Builds on the Logic parent/child split by giving Brand the same treatment, adding a sidebar accordion toggle, making tone words editable, and introducing a structured colour list with picker.

## Background

After the v2-alpha addendum landed (Logic split into six sidebar children, accordion explainers, custom overview notes), the user requested four UX upgrades:

1. **Logic sidebar should collapse.** Six always-visible Logic children make the nav crowded. Treat the Logic parent as an accordion: collapsed by default, auto-expand when a child is active, manual toggle persisted.
2. **Tone words must be editable.** The Brand `toneWords` enum-chips field uses a fixed option list. Users need to add custom words alongside defaults.
3. **Brand becomes a parent section.** Split into three child pages: **Tone**, **Colour direction**, **References**. Brand parent becomes an overview hub mirroring Logic.
4. **Colour direction needs structured colour records.** Add a colour list with a custom picker supporting HEX, HSL, sRGB inputs plus a native visual picker.

The same accordion behavior introduced for Logic must apply to Brand (and any future parent section), so the nav change is generic.

## Design

### 1. Sidebar accordion (`SectionsNav.tsx`)

Generic parent/child toggle keyed on `SectionConfig.parentId`.

- For each section in a group, render a parent row + a collapsible child list below it.
- Parent row: clickable to navigate to hub page **and** shows a chevron (▸ closed, ▾ open). Chevron is a separate inner button so screen readers announce both actions; row click navigates, chevron click toggles expand state.
- Stored expand state: `localStorage` key `appwork.nav.expanded` → `Record<parentId, boolean>`. Defaults to `false` (collapsed).
- Auto-expand override: if the active section has `parentId === P`, parent `P` renders expanded regardless of stored state. Manual toggle remains sticky for other parents.
- Children render only when `stored[parentId] === true || activeSection.parentId === parentId`.
- Mobile drawer reuses the same nav body — behavior identical.
- Keyboard: Enter / Space on parent row navigates. Chevron button: Enter / Space toggles.

### 2. Schema split — Brand

`brand` becomes a hub parent (no slot), mirroring `logic`.

```ts
// client/src/schema/sections/brand.ts
brand: SectionConfig = {
  id: 'brand', title: 'Brand', group: 'context', icon: '🎨', shape: 'object',
  intro: 'How the app should look and sound. Three sub-tools cover tone of voice, colour direction, and visual references.',
  fields: [{ key: 'overview', label: 'Brand overview', type: 'custom', widget: 'brand-overview' }],
};
```

Three new child sections (each `parentId: 'brand'`, `group: 'context'`, `shape: 'object'`). Each section uses **one root custom widget** that renders the whole page (mirrors how `logic-overview` works). This keeps multi-field widgets like the tone-chip editor straightforward — the widget owns its sibling state and dispatches a single merged `onChange`.

#### `brandTone`

```ts
fields: [
  { key: 'editor', label: 'Tone', type: 'custom', widget: 'brand-tone' },
]
```

Slot shape: `{ words: string[]; customWords: string[]; description: string; voiceNotes: string }`.

Widget renders: tone-chips (defaults + custom, with "+ Add" inline input), tone description textarea, voice notes textarea. Label/hint copy lives in the widget.

`details` on the section config carries the accordion explainer copy that the standard SectionRenderer renders above the widget.

#### `brandColour`

```ts
fields: [
  { key: 'editor', label: 'Colour direction', type: 'custom', widget: 'brand-colour' },
]
```

Slot shape: `{ direction: string; colours: ColourRecord[] }` where `ColourRecord = { id: string; name: string; description: string; hex: string }`.

Widget renders: direction textarea + a list editor for colour rows. Each row: name input, description textarea, swatch + HEX/HSL/RGB inputs (via the inner `ColourPickerWidget` component). "+ Add colour" button appends a new row.

#### `brandReferences`

```ts
fields: [
  { key: 'editor', label: 'References', type: 'custom', widget: 'brand-references' },
]
```

Slot shape: `{ notes: string; items: ReferenceItem[] }` where `ReferenceItem = { id: string; title: string; url: string; description: string }`.

Widget renders: notes textarea + list editor for reference items (title, url, description). "+ Add reference" appends a row.

Register all three plus the parent in `client/src/schema/sections/index.ts`.

### 3. Tone chips component (inside `brand-tone` widget)

The `brand-tone` widget owns the tone page's three sub-controls. The chip editor is an inner React component `ToneChips` in the same file or a sibling file.

Defaults (`['formal', 'playful', 'calm', 'bold', 'warm', 'serious', 'minimal', 'expressive']`) live as a constant inside the widget.

`ToneChips` props: `{ words: string[], customWords: string[], onChange: (next: { words: string[]; customWords: string[] }) => void }`.

UI:

- Renders the union `DEFAULTS ∪ customWords` as toggle chips. Selected (`words` includes it) = filled style; deselected = outlined.
- Custom chips carry a small `×` button (visible on hover/focus) that removes the word from `customWords` and from `words` if currently selected.
- Trailing `+ Add` chip swaps to an inline `<input>` on click. Enter or blur commits the trimmed non-empty input; preserves user casing; duplicates against the union are ignored silently. New word added to both `customWords` and `words` (auto-selected). Esc cancels and restores the `+ Add` chip.

The parent `brand-tone` widget threads `value` (the whole brandTone slot) and `onChange` through this component, dispatching a merged section object whenever any sub-control fires.

### 4. Colour picker widget

Custom widget `colour-picker` bound to the `hex` field inside the colour list item. Standard `FieldRendererProps` — `value` is the hex string, `onChange` writes hex.

Layout:

```
┌────────────────────────────────────────────┐
│ [swatch 40×40]  HEX: [#3366ff       ]     │
│  (input type=   HSL: [220, 100%, 60%]     │
│   color over-   RGB: [51, 102, 255   ]     │
│   layed)                                   │
└────────────────────────────────────────────┘
```

- Swatch acts as the visual picker. Native `<input type="color">` is positioned absolutely over the swatch, with `opacity: 0`, so clicking the swatch opens the OS picker. `onInput` of the native picker writes the new hex.
- Each text input is independently editable. On blur or Enter, parse + convert to hex:
  - HEX accepts `#rrggbb`, `rrggbb`, `#rgb`, `rgb`.
  - RGB accepts `rgb(r, g, b)` or `r, g, b` (integers 0–255).
  - HSL accepts `hsl(h, s%, l%)` or `h, s%, l%` (h ∈ [0, 360], s/l ∈ [0%, 100%]).
- Invalid input: leave the typed text in place, render the input border red + an inline error caption. Don't overwrite the canonical hex.
- After a valid commit, all three text inputs rebuild from the canonical hex (so HSL/RGB show the normalised representation of whatever was typed).
- Initial empty value: swatch shows transparent + dotted border; text fields empty.

Conversion utilities live in `client/src/sections/brand/colour-utils.ts`:

```ts
export function normalizeHex(input: string): string | null;     // accepts shorthand + missing #
export function hexToRgb(hex: string): [number, number, number];
export function rgbToHex(r: number, g: number, b: number): string;
export function rgbToHsl(r: number, g: number, b: number): [number, number, number];
export function hslToRgb(h: number, s: number, l: number): [number, number, number];
export function parseRgb(input: string): [number, number, number] | null;
export function parseHsl(input: string): [number, number, number] | null;
```

Pure functions, no deps. Round-trip tested in `colour-utils.test.ts`.

### 5. Brand overview hub widget (`brand-overview`)

Mirrors `logic-overview`. Reads `project.sections.brandTone`, `brandColour`, `brandReferences` for previews.

Three cards in a responsive grid (1-col mobile, `auto-fit minmax(240px, 1fr)` desktop):

- **Tone** — body lists selected `words` as small chips (max 8 shown, "+N more" overflow). Empty: "No tone words yet."
- **Colour direction** — body shows row of colour swatches (max 8 shown, 22×22 rounded) reading `colours[i].hex`. Below: truncated `direction` text. Empty: "No colours yet."
- **References** — body shows count `"N references"` + truncated first line of `notes`. Empty: "No references yet."

Each card click → `setSection('brandTone' | 'brandColour' | 'brandReferences')` via `useNavigation`.

### 6. Migration shim

In `client/src/storage/migrations.ts` (or wherever the logic migration lives), add:

```ts
const old = project.sections.brand as Record<string, unknown> | undefined;
if (old && (old.toneWords || old.references || old.colourDirection || old.voiceNotes)) {
  project.sections.brandTone = {
    words: Array.isArray(old.toneWords) ? (old.toneWords as string[]) : [],
    customWords: [],
    description: '',
    voiceNotes: String(old.voiceNotes ?? ''),
  };
  project.sections.brandColour = {
    direction: String(old.colourDirection ?? ''),
    colours: [],
  };
  project.sections.brandReferences = {
    notes: String(old.references ?? ''),
    items: [],
  };
  delete (project.sections as Record<string, unknown>).brand;
}
```

Runs once on load, idempotent (re-running detects empty old shape and no-ops).

### 7. Counts integration

`ProjectSummary.counts` map is keyed by section id. Add reasonable counts for new sections so the sidebar pill works:

- `brandTone` count = `words.length`
- `brandColour` count = `colours.length`
- `brandReferences` count = `items.length`

Logic for computing counts lives wherever existing per-section counts are computed (likely in `App.tsx` or a `sections/count.ts` helper). Wire the new ids.

### 8. Export integration

If existing markdown / JSON exporter hardcodes the `brand` section, update it to read the three new slots and render under a "Brand" heading with three subheads. New JSON export naturally picks up the new keys; markdown needs the new section block.

## Files affected

- `client/src/shell/SectionsNav.tsx` — accordion toggle + localStorage.
- `client/src/schema/sections/brand.ts` — rewrite to parent hub.
- `client/src/schema/sections/brand-tone.ts` — new.
- `client/src/schema/sections/brand-colour.ts` — new.
- `client/src/schema/sections/brand-references.ts` — new.
- `client/src/schema/sections/index.ts` — register.
- `client/src/sections/brand/index.ts` — new, registers widgets.
- `client/src/sections/brand/BrandOverviewWidget.tsx` — new (`brand-overview`).
- `client/src/sections/brand/BrandToneWidget.tsx` — new (`brand-tone`), uses inner `ToneChips` component.
- `client/src/sections/brand/BrandColourWidget.tsx` — new (`brand-colour`), renders direction textarea + list of colour rows using `ColourPickerWidget`.
- `client/src/sections/brand/BrandReferencesWidget.tsx` — new (`brand-references`).
- `client/src/sections/brand/ColourPickerWidget.tsx` — new (`colour-picker`).
- `client/src/sections/brand/colour-utils.ts` + `colour-utils.test.ts` — new.
- `client/src/sections/register.ts` — import brand widgets.
- `client/src/storage/migrations.ts` (or inline bootstrap) — brand migration shim.
- Export modules (`client/src/export/*`) — render new brand subsections.

## Testing

- **Vitest:** `colour-utils.test.ts` round-trips hex ↔ rgb ↔ hsl across edge cases (white, black, primaries, grey, 3-digit hex). Migration shim test (old project shape → three new slots).
- **Manual:** create new project, exercise tone chips (toggle, add custom, remove custom, edit description), colour picker (HEX, RGB, HSL, native, invalid → error state). Toggle accordion, navigate to child, verify auto-expand + persistence after reload. Mobile drawer parity.
- **E2E:** extend smoke test to add a colour + a custom tone word, export, assert presence in exported markdown/JSON.

## Out of scope

- Contrast/a11y validation between saved colours.
- Drag-to-reorder within colour or reference lists.
- Importing palettes from URL or shared libraries.
- Per-device sync of accordion state (localStorage only).
- Eyedropper API (modern browsers) — possible future addition.
- Renaming default tone words.
- Tagging or grouping colours by role beyond name + description.
