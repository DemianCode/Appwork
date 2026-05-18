# Brand Split, Nav Accordion, Tone Editing, Colour Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add sidebar accordion toggle for parent sections, split Brand into Tone / Colour Direction / References child pages, make tone words editable, and introduce a structured colour list with HEX/HSL/sRGB picker.

**Architecture:** Mirrors the existing Logic parent/hub pattern (parent section with `widget: '<id>-overview'`, children with `parentId`). Brand children use one root custom widget per page that owns the multi-field state. A new accordion toggle in `SectionsNav` collapses/expands a parent's child list, persisting choice in localStorage and auto-expanding when the active section is a child of that parent.

**Tech Stack:** React 18 + TypeScript, Vite, Vitest, Playwright e2e. No new deps. Colour conversions implemented as pure utility functions.

**Spec:** `docs/superpowers/specs/2026-05-19-brand-split-and-nav-accordion-design.md`

---

## File map

**Modified:**
- `client/src/shell/SectionsNav.tsx` — accordion toggle, localStorage persistence, auto-expand on active child.
- `client/src/schema/sections/brand.ts` — rewrite into hub parent.
- `client/src/schema/sections/index.ts` — register new sections.
- `client/src/sections/register.ts` — import brand widgets.
- `client/src/storage/migrations.ts` — `migrateBrandShape` shim.
- `client/src/App.tsx` — call `migrateBrandShape` alongside `migrateLogicShape` on project load, include new section ids in counts (existing loop already covers all `SECTIONS`).
- `client/src/storage/migrations.ts` — extend `migrateLegacy` to seed empty brand child slots instead of `brand: {}`.
- `client/src/export/markdown.ts` — skip the `brand` parent hub section.
- `client/src/export/widgetExporters.ts` — register exporters for `brand-overview` (no-op), `brand-tone`, `brand-colour`, `brand-references`.

**Created:**
- `client/src/schema/sections/brand-tone.ts`
- `client/src/schema/sections/brand-colour.ts`
- `client/src/schema/sections/brand-references.ts`
- `client/src/sections/brand/index.ts` — registers widgets.
- `client/src/sections/brand/BrandOverviewWidget.tsx`
- `client/src/sections/brand/BrandToneWidget.tsx` (contains `ToneChips` inner component).
- `client/src/sections/brand/BrandColourWidget.tsx`
- `client/src/sections/brand/BrandReferencesWidget.tsx`
- `client/src/sections/brand/ColourPickerWidget.tsx`
- `client/src/sections/brand/colour-utils.ts`
- `client/src/sections/brand/colour-utils.test.ts`
- `client/src/sections/brand/ToneChips.test.tsx`
- `client/src/shell/SectionsNav.test.tsx` (if not present — accordion test).

---

## Task 1 — Sidebar accordion toggle

**Files:**
- Modify: `client/src/shell/SectionsNav.tsx`
- Create: `client/src/shell/SectionsNav.test.tsx`

- [ ] **Step 1: Write failing test for accordion behavior**

Create `client/src/shell/SectionsNav.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionsNav } from './SectionsNav';
import { ThemeProvider } from '@/theme/ThemeProvider';

vi.mock('@/schema/sections', () => ({
  SECTIONS: [
    { id: 'overview', title: 'Overview', group: 'core', icon: '●', intro: '', shape: 'object', fields: [] },
    { id: 'logic', title: 'Logic', group: 'logic', icon: '◆', intro: '', shape: 'object', fields: [] },
    { id: 'logicRules', title: 'Rules', group: 'logic', icon: '·', intro: '', shape: 'list', fields: [], parentId: 'logic' },
    { id: 'logicGroups', title: 'Groups', group: 'logic', icon: '·', intro: '', shape: 'list', fields: [], parentId: 'logic' },
  ],
}));

function renderNav(props: Partial<React.ComponentProps<typeof SectionsNav>> = {}) {
  return render(
    <ThemeProvider>
      <SectionsNav
        current={props.current ?? 'overview'}
        counts={{}}
        onSelect={vi.fn()}
        open
        onClose={() => {}}
      />
    </ThemeProvider>
  );
}

describe('SectionsNav accordion', () => {
  beforeEach(() => localStorage.clear());

  it('hides children of a collapsed parent', () => {
    renderNav({ current: 'overview' });
    expect(screen.queryByRole('button', { name: /^Rules/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Groups/ })).toBeNull();
  });

  it('auto-expands the parent of the active section', () => {
    renderNav({ current: 'logicRules' });
    expect(screen.getByRole('button', { name: /Rules/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Groups/ })).toBeTruthy();
  });

  it('toggles via chevron and persists to localStorage', () => {
    renderNav({ current: 'overview' });
    const chevron = screen.getByRole('button', { name: /Toggle Logic/i });
    fireEvent.click(chevron);
    expect(screen.getByRole('button', { name: /Rules/ })).toBeTruthy();
    expect(localStorage.getItem('appwork.nav.expanded')).toContain('"logic":true');
  });

  it('hydrates expanded state from localStorage', () => {
    localStorage.setItem('appwork.nav.expanded', JSON.stringify({ logic: true }));
    renderNav({ current: 'overview' });
    expect(screen.getByRole('button', { name: /Rules/ })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

```
npx vitest run client/src/shell/SectionsNav.test.tsx
```

Expected: FAIL (no chevron button, children always rendered).

- [ ] **Step 3: Implement accordion in `SectionsNav.tsx`**

Replace the body of `client/src/shell/SectionsNav.tsx` with:

```tsx
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/theme/useTheme';
import { useBreakpoint } from './useBreakpoint';
import { SECTIONS } from '@/schema/sections';

const GROUPS: Array<{ id: 'core' | 'logic' | 'context'; label: string }> = [
  { id: 'core', label: 'Core' },
  { id: 'logic', label: 'Logic & data' },
  { id: 'context', label: 'Context' },
];

const EXPAND_KEY = 'appwork.nav.expanded';
function readExpanded(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(EXPAND_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch { return {}; }
}
function writeExpanded(state: Record<string, boolean>) {
  try { localStorage.setItem(EXPAND_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function SectionsNav({
  current, counts, onSelect, open, onClose,
}: {
  current: string;
  counts: Record<string, number>;
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const { tokens: C } = useTheme();
  const mobile = useBreakpoint();
  const firstFocusable = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => readExpanded());

  useEffect(() => {
    if (mobile && open && firstFocusable.current) firstFocusable.current.focus();
  }, [mobile, open]);

  useEffect(() => {
    if (!mobile || !open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobile, open, onClose]);

  const toggleParent = (parentId: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [parentId]: !prev[parentId] };
      writeExpanded(next);
      return next;
    });
  };

  const activeParentId = SECTIONS.find((s) => s.id === current)?.parentId;

  const renderItem = (s: typeof SECTIONS[number], opts: {
    indent: boolean;
    isParent: boolean;
    childOpen?: boolean;
    onToggle?: () => void;
    refProp?: React.RefObject<HTMLButtonElement>;
  }) => {
    const active = s.id === current;
    const count = counts[s.id];
    const rowStyle: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 9,
      padding: `7px 16px 7px ${opts.indent ? 36 : 16}px`,
      fontSize: opts.indent ? 12 : 13, cursor: 'pointer',
      background: active ? C.accentDim : 'none',
      width: '100%', textAlign: 'left', border: 'none',
      borderLeft: active ? `2px solid ${C.accent}` : '2px solid transparent',
      fontWeight: active ? 600 : 400, color: active ? C.text : C.muted, fontFamily: 'inherit',
    };
    return (
      <div key={s.id} style={{ display: 'flex', alignItems: 'stretch' }}>
        <button
          type="button"
          ref={opts.refProp}
          onClick={() => { onSelect(s.id); if (mobile) onClose(); }}
          aria-current={active ? 'page' : undefined}
          style={{ ...rowStyle, paddingRight: opts.isParent ? 0 : 16 }}
        >
          <span aria-hidden style={{ opacity: 0.7 }}>{s.icon}</span>
          <span style={{ flex: 1 }}>{s.title}</span>
          {count !== undefined && count > 0 && (
            <span style={{ fontSize: 10, background: C.dim, borderRadius: 20, padding: '1px 6px', color: C.muted }}>
              {count}
            </span>
          )}
        </button>
        {opts.isParent && (
          <button
            type="button"
            onClick={opts.onToggle}
            aria-label={`Toggle ${s.title} children`}
            aria-expanded={opts.childOpen ?? false}
            style={{
              width: 32, border: 'none', background: 'none', cursor: 'pointer',
              color: C.muted, fontSize: 12, paddingRight: 12,
            }}
          >
            {opts.childOpen ? '▾' : '▸'}
          </button>
        )}
      </div>
    );
  };

  const navBody = (
    <nav aria-label="Sections">
      {GROUPS.map((g, gi) => {
        const sections = SECTIONS.filter((s) => s.group === g.id);
        const sectionIds = new Set(sections.map((s) => s.id));
        const rendered: JSX.Element[] = [];
        let firstRefAssigned = false;

        for (let i = 0; i < sections.length; i++) {
          const s = sections[i];
          const isChild = !!(s.parentId && sectionIds.has(s.parentId));
          if (isChild) continue; // children rendered under their parent

          const hasChildren = sections.some((c) => c.parentId === s.id);
          const stored = !!expanded[s.id];
          const childOpen = stored || activeParentId === s.id;
          const refProp = !firstRefAssigned && gi === 0 ? firstFocusable : undefined;
          if (refProp) firstRefAssigned = true;

          rendered.push(renderItem(s, {
            indent: false,
            isParent: hasChildren,
            childOpen,
            onToggle: () => toggleParent(s.id),
            refProp,
          }));

          if (hasChildren && childOpen) {
            for (const c of sections.filter((x) => x.parentId === s.id)) {
              rendered.push(renderItem(c, { indent: true, isParent: false }));
            }
          }
        }

        return (
          <div key={g.id} style={{ marginTop: gi === 0 ? 0 : 8, paddingTop: gi === 0 ? 0 : 8, borderTop: gi === 0 ? 'none' : `1px solid ${C.border}` }}>
            <div style={{ padding: '8px 16px 6px', fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{g.label}</div>
            {rendered}
          </div>
        );
      })}
    </nav>
  );

  if (!mobile) {
    return (
      <aside style={{ width: 220, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, padding: '14px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {navBody}
      </aside>
    );
  }

  if (!open) return null;
  return (
    <div role="dialog" aria-modal aria-label="Sections" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
      <div style={{ width: '78%', maxWidth: 320, height: '100%', background: C.surface, borderRight: `1px solid ${C.border}`, padding: '14px 0', overflowY: 'auto' }}>
        {navBody}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to confirm pass**

```
npx vitest run client/src/shell/SectionsNav.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Type-check + full test suite sanity**

```
npx tsc -p tsconfig.json --noEmit
npx vitest run
```

Expected: no type errors, no regressions.

- [ ] **Step 6: Commit**

```bash
git add client/src/shell/SectionsNav.tsx client/src/shell/SectionsNav.test.tsx
git commit -m "feat(shell): collapsible accordion for parent sections in nav"
```

---

## Task 2 — Brand schema split

**Files:**
- Modify: `client/src/schema/sections/brand.ts`
- Create: `client/src/schema/sections/brand-tone.ts`, `brand-colour.ts`, `brand-references.ts`
- Modify: `client/src/schema/sections/index.ts`

- [ ] **Step 1: Rewrite `brand.ts` as parent hub**

```ts
// client/src/schema/sections/brand.ts
import type { SectionConfig } from '../types';
export const brand: SectionConfig = {
  id: 'brand', title: 'Brand', group: 'context', icon: '🎨', shape: 'object',
  intro: 'How the app should look and sound. Three sub-tools cover tone, colour direction, and references — pick the ones your app needs.',
  fields: [
    { key: 'overview', label: 'Brand overview', type: 'custom', widget: 'brand-overview' },
  ],
};
```

- [ ] **Step 2: Create `brand-tone.ts`**

```ts
// client/src/schema/sections/brand-tone.ts
import type { SectionConfig } from '../types';
export const brandTone: SectionConfig = {
  id: 'brandTone', title: 'Tone', group: 'context', icon: '◐', shape: 'object', parentId: 'brand',
  intro: 'How the app should sound.',
  details: 'Tone words are quick descriptors of the brand voice. Tone description gives room for a richer narrative. Voice notes capture rules about how copy is written (e.g. "no jargon, contractions OK").',
  fields: [
    { key: 'editor', label: 'Tone', type: 'custom', widget: 'brand-tone' },
  ],
};
```

- [ ] **Step 3: Create `brand-colour.ts`**

```ts
// client/src/schema/sections/brand-colour.ts
import type { SectionConfig } from '../types';
export const brandColour: SectionConfig = {
  id: 'brandColour', title: 'Colour direction', group: 'context', icon: '◑', shape: 'object', parentId: 'brand',
  intro: 'The palette and how it is used.',
  details: 'The direction text captures intent ("neutral with a single warm accent"). The colour list captures the actual swatches with names and usage notes. Pick colours via the visual picker or paste HEX, HSL, or RGB.',
  fields: [
    { key: 'editor', label: 'Colour direction', type: 'custom', widget: 'brand-colour' },
  ],
};
```

- [ ] **Step 4: Create `brand-references.ts`**

```ts
// client/src/schema/sections/brand-references.ts
import type { SectionConfig } from '../types';
export const brandReferences: SectionConfig = {
  id: 'brandReferences', title: 'References', group: 'context', icon: '◒', shape: 'object', parentId: 'brand',
  intro: 'Sites or apps you want to draw inspiration from.',
  details: 'Use the notes field for quick thoughts or pasted URLs. Add structured references for items worth describing.',
  fields: [
    { key: 'editor', label: 'References', type: 'custom', widget: 'brand-references' },
  ],
};
```

- [ ] **Step 5: Register new sections in `index.ts`**

Replace `client/src/schema/sections/index.ts`:

```ts
import { overview } from './overview';
import { roles } from './roles';
import { screens } from './screens';
import { flows } from './flows';
import { logic } from './logic';
import { logicRules } from './logic-rules';
import { logicGroups } from './logic-groups';
import { logicAttributes } from './logic-attributes';
import { logicScoring } from './logic-scoring';
import { logicConditions } from './logic-conditions';
import { logicOutcomes } from './logic-outcomes';
import { data } from './data';
import { integrations } from './integrations';
import { triggers } from './triggers';
import { nonGoals } from './non-goals';
import { brand } from './brand';
import { brandTone } from './brand-tone';
import { brandColour } from './brand-colour';
import { brandReferences } from './brand-references';
import { constraints } from './constraints';
import { glossary } from './glossary';
import { openQuestions } from './open-questions';
import type { SectionConfig } from '../types';

export const SECTIONS: SectionConfig[] = [
  overview, roles, screens, flows,
  logic, logicRules, logicGroups, logicAttributes, logicScoring, logicConditions, logicOutcomes,
  data, integrations, triggers,
  nonGoals,
  brand, brandTone, brandColour, brandReferences,
  constraints, glossary, openQuestions,
];
export const SECTION_MAP: Record<string, SectionConfig> = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
```

- [ ] **Step 6: Type-check**

```
npx tsc -p tsconfig.json --noEmit
```

Expected: PASS (widgets not yet registered, but renderer falls back to ListField then to nothing — app will display warnings; covered next task).

- [ ] **Step 7: Commit**

```bash
git add client/src/schema/sections/brand.ts client/src/schema/sections/brand-tone.ts client/src/schema/sections/brand-colour.ts client/src/schema/sections/brand-references.ts client/src/schema/sections/index.ts
git commit -m "feat(schema): split brand into tone, colour, references child sections"
```

---

## Task 3 — Colour conversion utilities (TDD)

**Files:**
- Create: `client/src/sections/brand/colour-utils.ts`
- Create: `client/src/sections/brand/colour-utils.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// client/src/sections/brand/colour-utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  normalizeHex, hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  parseRgb, parseHsl,
} from './colour-utils';

describe('normalizeHex', () => {
  it('accepts 6-digit hex with hash', () => expect(normalizeHex('#3366ff')).toBe('#3366ff'));
  it('accepts 6-digit hex without hash', () => expect(normalizeHex('3366FF')).toBe('#3366ff'));
  it('expands 3-digit hex', () => expect(normalizeHex('#f0a')).toBe('#ff00aa'));
  it('expands 3-digit hex without hash', () => expect(normalizeHex('fa3')).toBe('#ffaa33'));
  it('returns null for invalid input', () => {
    expect(normalizeHex('zzz')).toBe(null);
    expect(normalizeHex('')).toBe(null);
    expect(normalizeHex('#12345')).toBe(null);
  });
});

describe('hex/rgb round-trip', () => {
  const cases: Array<[string, [number, number, number]]> = [
    ['#000000', [0, 0, 0]],
    ['#ffffff', [255, 255, 255]],
    ['#3366ff', [51, 102, 255]],
    ['#ff8800', [255, 136, 0]],
  ];
  for (const [hex, rgb] of cases) {
    it(`${hex} ↔ rgb(${rgb.join(',')})`, () => {
      expect(hexToRgb(hex)).toEqual(rgb);
      expect(rgbToHex(rgb[0], rgb[1], rgb[2])).toBe(hex);
    });
  }
});

describe('rgb/hsl round-trip', () => {
  const cases: Array<[[number, number, number], [number, number, number]]> = [
    [[0, 0, 0], [0, 0, 0]],
    [[255, 255, 255], [0, 0, 100]],
    [[255, 0, 0], [0, 100, 50]],
    [[51, 102, 255], [225, 100, 60]],
  ];
  for (const [rgb, hsl] of cases) {
    it(`rgb(${rgb.join(',')}) → hsl(${hsl.join(',')}) and back`, () => {
      const out = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      expect(out[0]).toBeCloseTo(hsl[0], 0);
      expect(out[1]).toBeCloseTo(hsl[1], 0);
      expect(out[2]).toBeCloseTo(hsl[2], 0);
      const back = hslToRgb(out[0], out[1], out[2]);
      expect(back[0]).toBeCloseTo(rgb[0], 0);
      expect(back[1]).toBeCloseTo(rgb[1], 0);
      expect(back[2]).toBeCloseTo(rgb[2], 0);
    });
  }
});

describe('parseRgb', () => {
  it('accepts rgb() syntax', () => expect(parseRgb('rgb(51, 102, 255)')).toEqual([51, 102, 255]));
  it('accepts bare numbers', () => expect(parseRgb('51, 102, 255')).toEqual([51, 102, 255]));
  it('returns null on garbage', () => expect(parseRgb('not a colour')).toBe(null));
  it('returns null on out of range', () => expect(parseRgb('300, 0, 0')).toBe(null));
});

describe('parseHsl', () => {
  it('accepts hsl() syntax', () => expect(parseHsl('hsl(225, 100%, 60%)')).toEqual([225, 100, 60]));
  it('accepts bare numbers', () => expect(parseHsl('225, 100%, 60%')).toEqual([225, 100, 60]));
  it('accepts no percent sign', () => expect(parseHsl('225, 100, 60')).toEqual([225, 100, 60]));
  it('returns null on out-of-range hue', () => expect(parseHsl('400, 50, 50')).toBe(null));
  it('returns null on garbage', () => expect(parseHsl('xxx')).toBe(null));
});
```

- [ ] **Step 2: Run tests to confirm failure**

```
npx vitest run client/src/sections/brand/colour-utils.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `colour-utils.ts`**

```ts
// client/src/sections/brand/colour-utils.ts
export function normalizeHex(input: string): string | null {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/.test(cleaned)) {
    return '#' + cleaned.split('').map((c) => c + c).join('');
  }
  if (/^[0-9a-f]{6}$/.test(cleaned)) return '#' + cleaned;
  return null;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = normalizeHex(hex);
  if (!n) return [0, 0, 0];
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(hn + 1 / 3) * 255),
    Math.round(hue2rgb(hn) * 255),
    Math.round(hue2rgb(hn - 1 / 3) * 255),
  ];
}

export function parseRgb(input: string): [number, number, number] | null {
  if (!input) return null;
  const m = input.match(/^\s*(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?\s*$/i);
  if (!m) return null;
  const r = +m[1], g = +m[2], b = +m[3];
  if ([r, g, b].some((n) => n < 0 || n > 255)) return null;
  return [r, g, b];
}

export function parseHsl(input: string): [number, number, number] | null {
  if (!input) return null;
  const m = input.match(/^\s*(?:hsl\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)?\s*$/i);
  if (!m) return null;
  const h = +m[1], s = +m[2], l = +m[3];
  if (h < 0 || h > 360) return null;
  if (s < 0 || s > 100) return null;
  if (l < 0 || l > 100) return null;
  return [h, s, l];
}
```

- [ ] **Step 4: Run tests to confirm pass**

```
npx vitest run client/src/sections/brand/colour-utils.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/sections/brand/colour-utils.ts client/src/sections/brand/colour-utils.test.ts
git commit -m "feat(brand): pure colour conversion utils with round-trip tests"
```

---

## Task 4 — ColourPickerWidget

**Files:**
- Create: `client/src/sections/brand/ColourPickerWidget.tsx`

- [ ] **Step 1: Implement widget**

```tsx
// client/src/sections/brand/ColourPickerWidget.tsx
import { useEffect, useState } from 'react';
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import {
  normalizeHex, hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  parseRgb, parseHsl,
} from './colour-utils';

export function ColourPickerWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const hex = typeof value === 'string' ? value : '';
  const valid = !!normalizeHex(hex);

  const [hexInput, setHexInput] = useState(hex);
  const [rgbInput, setRgbInput] = useState('');
  const [hslInput, setHslInput] = useState('');
  const [errs, setErrs] = useState<{ hex?: boolean; rgb?: boolean; hsl?: boolean }>({});

  useEffect(() => {
    if (!valid) {
      setHexInput(hex);
      setRgbInput('');
      setHslInput('');
      return;
    }
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    setHexInput(hex);
    setRgbInput(`${r}, ${g}, ${b}`);
    setHslInput(`${h}, ${s}%, ${l}%`);
    setErrs({});
  }, [hex, valid]);

  const commitHex = () => {
    const n = normalizeHex(hexInput);
    if (n) { onChange(n); setErrs((e) => ({ ...e, hex: false })); }
    else setErrs((e) => ({ ...e, hex: true }));
  };
  const commitRgb = () => {
    const rgb = parseRgb(rgbInput);
    if (rgb) { onChange(rgbToHex(rgb[0], rgb[1], rgb[2])); setErrs((e) => ({ ...e, rgb: false })); }
    else setErrs((e) => ({ ...e, rgb: true }));
  };
  const commitHsl = () => {
    const hsl = parseHsl(hslInput);
    if (hsl) { const [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]); onChange(rgbToHex(r, g, b)); setErrs((e) => ({ ...e, hsl: false })); }
    else setErrs((e) => ({ ...e, hsl: true }));
  };

  const inputStyle = (err?: boolean): React.CSSProperties => ({
    padding: '6px 8px',
    border: `1px solid ${err ? C.red : C.border}`,
    borderRadius: 6,
    background: C.surface,
    color: C.text,
    fontFamily: 'inherit',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
  });

  const swatchColor = valid ? hex : 'transparent';

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 12 }}>
      <label style={{
        position: 'relative', width: 56, height: 56, borderRadius: 8,
        border: `1px solid ${C.border}`, background: swatchColor,
        backgroundImage: valid ? 'none' : `repeating-linear-gradient(45deg, ${C.dim}, ${C.dim} 4px, transparent 4px, transparent 8px)`,
        cursor: 'pointer', flexShrink: 0,
      }} aria-label="Pick colour visually">
        <input
          type="color"
          value={valid ? hex : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 6, flex: 1, minWidth: 220 }}>
        <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>HEX</span>
        <input
          aria-label="HEX value"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => e.key === 'Enter' && commitHex()}
          placeholder="#000000"
          style={inputStyle(errs.hex)}
        />
        <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>RGB</span>
        <input
          aria-label="RGB value"
          value={rgbInput}
          onChange={(e) => setRgbInput(e.target.value)}
          onBlur={commitRgb}
          onKeyDown={(e) => e.key === 'Enter' && commitRgb()}
          placeholder="0, 0, 0"
          style={inputStyle(errs.rgb)}
        />
        <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>HSL</span>
        <input
          aria-label="HSL value"
          value={hslInput}
          onChange={(e) => setHslInput(e.target.value)}
          onBlur={commitHsl}
          onKeyDown={(e) => e.key === 'Enter' && commitHsl()}
          placeholder="0, 0%, 0%"
          style={inputStyle(errs.hsl)}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```
npx tsc -p tsconfig.json --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/sections/brand/ColourPickerWidget.tsx
git commit -m "feat(brand): colour picker widget with hex/rgb/hsl inputs + native picker"
```

---

## Task 5 — Tone chips + BrandToneWidget (TDD chip logic)

**Files:**
- Create: `client/src/sections/brand/BrandToneWidget.tsx`
- Create: `client/src/sections/brand/ToneChips.test.tsx`

- [ ] **Step 1: Write failing test for ToneChips**

```tsx
// client/src/sections/brand/ToneChips.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToneChips } from './BrandToneWidget';
import { ThemeProvider } from '@/theme/ThemeProvider';

function setup(overrides: { words?: string[]; customWords?: string[] } = {}) {
  const onChange = vi.fn();
  render(
    <ThemeProvider>
      <ToneChips
        words={overrides.words ?? []}
        customWords={overrides.customWords ?? []}
        onChange={onChange}
      />
    </ThemeProvider>
  );
  return { onChange };
}

describe('ToneChips', () => {
  it('renders all defaults', () => {
    setup();
    expect(screen.getByRole('button', { name: /^formal$/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^playful$/ })).toBeTruthy();
  });

  it('toggles selection', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /^playful$/ }));
    expect(onChange).toHaveBeenCalledWith({ words: ['playful'], customWords: [] });
  });

  it('deselects when clicking selected chip', () => {
    const { onChange } = setup({ words: ['playful'] });
    fireEvent.click(screen.getByRole('button', { name: /^playful$/ }));
    expect(onChange).toHaveBeenCalledWith({ words: [], customWords: [] });
  });

  it('renders custom chips alongside defaults', () => {
    setup({ customWords: ['cosy'] });
    expect(screen.getByRole('button', { name: /^cosy$/ })).toBeTruthy();
  });

  it('adds a new word via + Add', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Add tone word/i }));
    const input = screen.getByPlaceholderText('tone word');
    fireEvent.change(input, { target: { value: 'cosy' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith({ words: ['cosy'], customWords: ['cosy'] });
  });

  it('ignores duplicate adds', () => {
    const { onChange } = setup({ customWords: ['cosy'], words: ['cosy'] });
    fireEvent.click(screen.getByRole('button', { name: /Add tone word/i }));
    const input = screen.getByPlaceholderText('tone word');
    fireEvent.change(input, { target: { value: 'cosy' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a custom chip via × button', () => {
    const { onChange } = setup({ customWords: ['cosy'], words: ['cosy'] });
    fireEvent.click(screen.getByRole('button', { name: /Remove cosy/i }));
    expect(onChange).toHaveBeenCalledWith({ words: [], customWords: [] });
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

```
npx vitest run client/src/sections/brand/ToneChips.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `BrandToneWidget.tsx` with inner `ToneChips`**

```tsx
// client/src/sections/brand/BrandToneWidget.tsx
import { useRef, useState } from 'react';
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import { AutoField } from '@/renderer/AutoField';
import { styles } from '@/renderer/styles';

const DEFAULT_TONES = ['formal', 'playful', 'calm', 'bold', 'warm', 'serious', 'minimal', 'expressive'];

type ToneSlot = {
  words?: string[];
  customWords?: string[];
  description?: string;
  voiceNotes?: string;
};

export function ToneChips({
  words, customWords, onChange,
}: {
  words: string[];
  customWords: string[];
  onChange: (next: { words: string[]; customWords: string[] }) => void;
}) {
  const { tokens: C } = useTheme();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const all = [...DEFAULT_TONES, ...customWords];
  const isCustom = (w: string) => customWords.includes(w);
  const isSelected = (w: string) => words.includes(w);

  const toggle = (w: string) => {
    const next = isSelected(w) ? words.filter((x) => x !== w) : [...words, w];
    onChange({ words: next, customWords });
  };

  const removeCustom = (w: string) => {
    onChange({ words: words.filter((x) => x !== w), customWords: customWords.filter((x) => x !== w) });
  };

  const commitDraft = () => {
    const v = draft.trim();
    setDraft('');
    setAdding(false);
    if (!v) return;
    if (all.includes(v)) return;
    onChange({ words: [...words, v], customWords: [...customWords, v] });
  };

  const chip = (w: string) => {
    const on = isSelected(w);
    return (
      <span key={w} style={{ position: 'relative', display: 'inline-flex' }}>
        <button
          type="button"
          aria-pressed={on}
          aria-label={w}
          onClick={() => toggle(w)}
          style={{
            padding: '5px 11px',
            paddingRight: isCustom(w) ? 24 : 11,
            borderRadius: 16, fontSize: 12,
            background: on ? C.accentDim : 'transparent',
            border: `1px solid ${on ? C.accent : C.border}`,
            color: on ? C.text : C.muted, cursor: 'pointer',
          }}
        >{w}</button>
        {isCustom(w) && (
          <button
            type="button"
            aria-label={`Remove ${w}`}
            onClick={() => removeCustom(w)}
            style={{
              position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 16, border: 'none', background: 'transparent',
              color: C.muted, cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0,
            }}
          >×</button>
        )}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {all.map(chip)}
      {!adding ? (
        <button
          type="button"
          aria-label="Add tone word"
          onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0); }}
          style={{
            padding: '5px 11px', borderRadius: 16, fontSize: 12,
            background: 'transparent', border: `1px dashed ${C.border}`,
            color: C.muted, cursor: 'pointer',
          }}
        >+ Add</button>
      ) : (
        <input
          ref={inputRef}
          value={draft}
          placeholder="tone word"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft();
            else if (e.key === 'Escape') { setDraft(''); setAdding(false); }
          }}
          onBlur={commitDraft}
          style={{
            padding: '5px 11px', borderRadius: 16, fontSize: 12,
            background: C.surface, border: `1px solid ${C.accent}`,
            color: C.text, outline: 'none', width: 110,
          }}
        />
      )}
    </div>
  );
}

export function BrandToneWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const slot = (value ?? {}) as ToneSlot;
  const words = Array.isArray(slot.words) ? slot.words : [];
  const customWords = Array.isArray(slot.customWords) ? slot.customWords : [];
  const description = typeof slot.description === 'string' ? slot.description : '';
  const voiceNotes = typeof slot.voiceNotes === 'string' ? slot.voiceNotes : '';

  const update = (patch: Partial<ToneSlot>) => onChange({ ...slot, ...patch });

  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: mobile ? 14 : 18 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={s.lbl}>Tone words</label>
        <ToneChips words={words} customWords={customWords} onChange={(next) => update(next)} />
        <span style={s.hint}>Pick all that apply. Use + Add to introduce custom words.</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={s.lbl}>Tone description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <AutoField
          baseStyle={s.fb}
          value={description}
          onChange={(v) => update({ description: v })}
          placeholder="A free-text description of how the brand should feel."
          ariaLabel="Tone description"
        />
      </div>
      <div>
        <label style={s.lbl}>Voice notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <AutoField
          baseStyle={s.fb}
          value={voiceNotes}
          onChange={(v) => update({ voiceNotes: v })}
          placeholder="How copy should sound — friendly, terse, no jargon, etc."
          ariaLabel="Voice notes"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to confirm pass**

```
npx vitest run client/src/sections/brand/ToneChips.test.tsx
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/sections/brand/BrandToneWidget.tsx client/src/sections/brand/ToneChips.test.tsx
git commit -m "feat(brand): tone chips with custom + Add and full tone widget"
```

---

## Task 6 — BrandColourWidget (direction + colour list)

**Files:**
- Create: `client/src/sections/brand/BrandColourWidget.tsx`

- [ ] **Step 1: Implement widget**

```tsx
// client/src/sections/brand/BrandColourWidget.tsx
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import { AutoField } from '@/renderer/AutoField';
import { styles } from '@/renderer/styles';
import { ColourPickerWidget } from './ColourPickerWidget';

type ColourRecord = { id: string; name: string; description: string; hex: string };
type ColourSlot = { direction?: string; colours?: ColourRecord[] };

export function BrandColourWidget({ value, onChange, project }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const slot = (value ?? {}) as ColourSlot;
  const direction = typeof slot.direction === 'string' ? slot.direction : '';
  const colours = Array.isArray(slot.colours) ? slot.colours : [];

  const update = (patch: Partial<ColourSlot>) => onChange({ ...slot, ...patch });

  const updateColour = (idx: number, patch: Partial<ColourRecord>) =>
    update({ colours: colours.map((c, i) => i === idx ? { ...c, ...patch } : c) });

  const addColour = () =>
    update({ colours: [...colours, { id: crypto.randomUUID().slice(0, 8), name: '', description: '', hex: '' }] });

  const removeColour = (idx: number) =>
    update({ colours: colours.filter((_, i) => i !== idx) });

  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: mobile ? 14 : 18 }}>
      <div style={{ marginBottom: 18 }}>
        <label style={s.lbl}>Direction <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <AutoField
          baseStyle={s.fb}
          value={direction}
          onChange={(v) => update({ direction: v })}
          placeholder="e.g. neutral with a single warm accent"
          ariaLabel="Colour direction"
        />
      </div>

      <label style={s.lbl}>Colours</label>
      {colours.map((c, idx) => (
        <div key={c.id} style={s.card}>
          <div style={s.ch}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden style={{
                width: 14, height: 14, borderRadius: 4, background: c.hex || 'transparent',
                border: `1px solid ${C.border}`, display: 'inline-block',
              }} />
              <div style={s.ct}>{c.name || `Colour ${idx + 1}`}</div>
            </div>
            <button style={s.btnRm} onClick={() => removeColour(idx)} aria-label={`Remove colour ${idx + 1}`}>Remove</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.lbl}>Name</label>
            <AutoField
              baseStyle={s.fb} single
              value={c.name}
              onChange={(v) => updateColour(idx, { name: v })}
              placeholder="e.g. Primary, Accent, Surface"
              ariaLabel="Colour name"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.lbl}>Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <AutoField
              baseStyle={s.fb}
              value={c.description}
              onChange={(v) => updateColour(idx, { description: v })}
              placeholder="When to use it."
              ariaLabel="Colour description"
            />
          </div>
          <div>
            <label style={s.lbl}>Colour</label>
            <ColourPickerWidget
              field={{ key: 'hex', label: 'Colour', type: 'custom', widget: 'colour-picker' }}
              value={c.hex}
              onChange={(v) => updateColour(idx, { hex: String(v) })}
              project={project}
            />
          </div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={addColour}>+ Add colour</button>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```
npx tsc -p tsconfig.json --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/sections/brand/BrandColourWidget.tsx
git commit -m "feat(brand): colour direction widget with structured colour list"
```

---

## Task 7 — BrandReferencesWidget

**Files:**
- Create: `client/src/sections/brand/BrandReferencesWidget.tsx`

- [ ] **Step 1: Implement widget**

```tsx
// client/src/sections/brand/BrandReferencesWidget.tsx
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import { AutoField } from '@/renderer/AutoField';
import { styles } from '@/renderer/styles';

type ReferenceItem = { id: string; title: string; url: string; description: string };
type RefSlot = { notes?: string; items?: ReferenceItem[] };

export function BrandReferencesWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const slot = (value ?? {}) as RefSlot;
  const notes = typeof slot.notes === 'string' ? slot.notes : '';
  const items = Array.isArray(slot.items) ? slot.items : [];

  const update = (patch: Partial<RefSlot>) => onChange({ ...slot, ...patch });
  const updateItem = (idx: number, patch: Partial<ReferenceItem>) =>
    update({ items: items.map((it, i) => i === idx ? { ...it, ...patch } : it) });
  const addItem = () =>
    update({ items: [...items, { id: crypto.randomUUID().slice(0, 8), title: '', url: '', description: '' }] });
  const removeItem = (idx: number) =>
    update({ items: items.filter((_, i) => i !== idx) });

  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: mobile ? 14 : 18 }}>
      <div style={{ marginBottom: 18 }}>
        <label style={s.lbl}>Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <AutoField
          baseStyle={s.fb}
          value={notes}
          onChange={(v) => update({ notes: v })}
          placeholder="URLs to apps/sites you like, or descriptive notes."
          ariaLabel="Reference notes"
        />
      </div>

      <label style={s.lbl}>References</label>
      {items.map((it, idx) => (
        <div key={it.id} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{it.title || `Reference ${idx + 1}`}</div>
            <button style={s.btnRm} onClick={() => removeItem(idx)} aria-label={`Remove reference ${idx + 1}`}>Remove</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.lbl}>Title</label>
            <AutoField
              baseStyle={s.fb} single
              value={it.title}
              onChange={(v) => updateItem(idx, { title: v })}
              placeholder="e.g. Linear marketing site"
              ariaLabel="Reference title"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.lbl}>URL</label>
            <AutoField
              baseStyle={s.fb} single
              value={it.url}
              onChange={(v) => updateItem(idx, { url: v })}
              placeholder="https://…"
              ariaLabel="Reference URL"
            />
          </div>
          <div>
            <label style={s.lbl}>Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <AutoField
              baseStyle={s.fb}
              value={it.description}
              onChange={(v) => updateItem(idx, { description: v })}
              placeholder="What's interesting about it."
              ariaLabel="Reference description"
            />
          </div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={addItem}>+ Add reference</button>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```
npx tsc -p tsconfig.json --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/sections/brand/BrandReferencesWidget.tsx
git commit -m "feat(brand): references widget with notes + structured list"
```

---

## Task 8 — BrandOverviewWidget (hub)

**Files:**
- Create: `client/src/sections/brand/BrandOverviewWidget.tsx`

- [ ] **Step 1: Implement widget**

```tsx
// client/src/sections/brand/BrandOverviewWidget.tsx
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useNavigation } from '@/shell/NavigationContext';
import { useTheme } from '@/theme/useTheme';
import { useBreakpoint } from '@/shell/useBreakpoint';

type ColourRecord = { id: string; name: string; description: string; hex: string };

export function BrandOverviewWidget({ project }: FieldRendererProps) {
  const { setSection } = useNavigation();
  const { tokens: C } = useTheme();
  const mobile = useBreakpoint();
  const sections = (project?.sections ?? {}) as Record<string, unknown>;
  const tone = (sections.brandTone ?? {}) as { words?: string[] };
  const colour = (sections.brandColour ?? {}) as { direction?: string; colours?: ColourRecord[] };
  const refs = (sections.brandReferences ?? {}) as { notes?: string; items?: Array<unknown> };

  const words = Array.isArray(tone.words) ? tone.words : [];
  const colours = Array.isArray(colour.colours) ? colour.colours : [];
  const refItems = Array.isArray(refs.items) ? refs.items : [];
  const refsNotes = typeof refs.notes === 'string' ? refs.notes : '';

  const cardStyle: React.CSSProperties = {
    textAlign: 'left', background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: 16, cursor: 'pointer', color: C.text,
    fontFamily: 'inherit', display: 'flex', flexDirection: 'column', gap: 10,
  };
  const titleStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600 };
  const emptyStyle: React.CSSProperties = { fontSize: 12, color: C.muted, lineHeight: 1.6 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
      <button type="button" onClick={() => setSection('brandTone')} style={cardStyle}>
        <div style={titleStyle}>Tone</div>
        {words.length === 0 ? (
          <div style={emptyStyle}>No tone words yet.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {words.slice(0, 8).map((w) => (
              <span key={w} style={{
                padding: '2px 8px', fontSize: 11, borderRadius: 12,
                background: C.accentDim, color: C.text, border: `1px solid ${C.accent}`,
              }}>{w}</span>
            ))}
            {words.length > 8 && <span style={emptyStyle}>+{words.length - 8} more</span>}
          </div>
        )}
      </button>

      <button type="button" onClick={() => setSection('brandColour')} style={cardStyle}>
        <div style={titleStyle}>Colour direction</div>
        {colours.length === 0 ? (
          <div style={emptyStyle}>No colours yet.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {colours.slice(0, 8).map((c) => (
                <span key={c.id} aria-label={c.name || c.hex} style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: c.hex || 'transparent',
                  border: `1px solid ${C.border}`,
                }} />
              ))}
            </div>
            {colour.direction && <div style={{ ...emptyStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{colour.direction}</div>}
          </>
        )}
      </button>

      <button type="button" onClick={() => setSection('brandReferences')} style={cardStyle}>
        <div style={titleStyle}>References</div>
        {refItems.length === 0 && !refsNotes ? (
          <div style={emptyStyle}>No references yet.</div>
        ) : (
          <>
            <div style={emptyStyle}>{refItems.length} reference{refItems.length === 1 ? '' : 's'}</div>
            {refsNotes && (
              <div style={{ ...emptyStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {refsNotes.split('\n')[0]}
              </div>
            )}
          </>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```
npx tsc -p tsconfig.json --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/sections/brand/BrandOverviewWidget.tsx
git commit -m "feat(brand): overview hub widget with previews per child"
```

---

## Task 9 — Register brand widgets

**Files:**
- Create: `client/src/sections/brand/index.ts`
- Modify: `client/src/sections/register.ts`

- [ ] **Step 1: Create brand index**

```ts
// client/src/sections/brand/index.ts
import { registerWidget } from '@/renderer/widgets';
import { BrandOverviewWidget } from './BrandOverviewWidget';
import { BrandToneWidget } from './BrandToneWidget';
import { BrandColourWidget } from './BrandColourWidget';
import { BrandReferencesWidget } from './BrandReferencesWidget';
import { ColourPickerWidget } from './ColourPickerWidget';

registerWidget('brand-overview', BrandOverviewWidget);
registerWidget('brand-tone', BrandToneWidget);
registerWidget('brand-colour', BrandColourWidget);
registerWidget('brand-references', BrandReferencesWidget);
registerWidget('colour-picker', ColourPickerWidget);
```

- [ ] **Step 2: Import in `register.ts`**

```ts
// client/src/sections/register.ts
import '@/sections/flows';
import '@/sections/data';
import '@/sections/logic';
import '@/sections/brand';
```

- [ ] **Step 3: Type-check**

```
npx tsc -p tsconfig.json --noEmit
```

Expected: PASS.

- [ ] **Step 4: Manual smoke**

```
npm run dev
```

Open http://localhost:5173, create a new project, navigate to Brand. Verify:
- Sidebar shows Brand as parent with chevron; clicking chevron toggles three children (Tone / Colour direction / References).
- Brand hub renders three preview cards (all empty states).
- Tone page: chip toggles work, + Add accepts a new word, × removes it.
- Colour direction page: + Add colour produces a row with picker; typing `#3366ff` into HEX shows RGB + HSL after blur; native picker also works.
- References page: notes + structured list edit + save.

- [ ] **Step 5: Commit**

```bash
git add client/src/sections/brand/index.ts client/src/sections/register.ts
git commit -m "feat(brand): register brand widgets"
```

---

## Task 10 — Migration shim for v2-alpha brand

**Files:**
- Modify: `client/src/storage/migrations.ts`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Add migration test**

Append to `client/src/storage/migrations.test.ts` if it exists; otherwise create:

```ts
// client/src/storage/migrations.test.ts (extend or create)
import { describe, it, expect } from 'vitest';
import { migrateBrandShape, migrateLegacy } from './migrations';
import type { Project } from '@/schema/types';

const now = new Date().toISOString();
const proj = (sections: Record<string, unknown>): Project => ({
  id: 'p', meta: { name: 'p', createdAt: now, updatedAt: now, schemaVersion: 1 }, sections,
});

describe('migrateBrandShape', () => {
  it('splits old brand object into three slots', () => {
    const p = proj({
      brand: {
        toneWords: ['playful', 'warm'],
        colourDirection: 'neutral with warm accent',
        references: 'https://linear.app',
        voiceNotes: 'friendly, no jargon',
      },
    });
    migrateBrandShape(p);
    expect(p.sections.brandTone).toEqual({
      words: ['playful', 'warm'], customWords: [], description: '', voiceNotes: 'friendly, no jargon',
    });
    expect(p.sections.brandColour).toEqual({ direction: 'neutral with warm accent', colours: [] });
    expect(p.sections.brandReferences).toEqual({ notes: 'https://linear.app', items: [] });
    expect(p.sections.brand).toBeUndefined();
  });

  it('is a no-op when already migrated', () => {
    const p = proj({
      brandTone: { words: ['cosy'], customWords: ['cosy'], description: '', voiceNotes: '' },
    });
    migrateBrandShape(p);
    expect(p.sections.brandTone).toEqual({ words: ['cosy'], customWords: ['cosy'], description: '', voiceNotes: '' });
  });

  it('is a no-op when brand is empty', () => {
    const p = proj({ brand: {} });
    migrateBrandShape(p);
    expect(p.sections.brand).toEqual({});
    expect(p.sections.brandTone).toBeUndefined();
  });
});

describe('migrateLegacy', () => {
  it('seeds empty brand child slots, no parent', () => {
    const p = migrateLegacy({});
    expect(p.sections.brand).toBeUndefined();
    expect(p.sections.brandTone).toEqual({ words: [], customWords: [], description: '', voiceNotes: '' });
    expect(p.sections.brandColour).toEqual({ direction: '', colours: [] });
    expect(p.sections.brandReferences).toEqual({ notes: '', items: [] });
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

```
npx vitest run client/src/storage/migrations.test.ts
```

Expected: FAIL (no `migrateBrandShape`, legacy still seeds `brand: {}`).

- [ ] **Step 3: Implement `migrateBrandShape` + update `migrateLegacy`**

Edit `client/src/storage/migrations.ts`. Add at end:

```ts
type OldBrandShape = {
  toneWords?: unknown;
  references?: unknown;
  colourDirection?: unknown;
  voiceNotes?: unknown;
};

/**
 * Maps a v2-alpha `project.sections.brand` object into three per-page slots.
 * No-op if the project already uses the new layout.
 */
export function migrateBrandShape(project: Project): Project {
  const sections = project.sections as Record<string, unknown>;
  const old = sections.brand as OldBrandShape | undefined;
  if (!old || typeof old !== 'object' || Array.isArray(old)) return project;
  const hasOldKeys = !!(old.toneWords || old.references || old.colourDirection || old.voiceNotes);
  if (!hasOldKeys) return project;
  if (sections.brandTone || sections.brandColour || sections.brandReferences) return project;

  sections.brandTone = {
    words: Array.isArray(old.toneWords) ? (old.toneWords as string[]) : [],
    customWords: [],
    description: '',
    voiceNotes: typeof old.voiceNotes === 'string' ? old.voiceNotes : '',
  };
  sections.brandColour = {
    direction: typeof old.colourDirection === 'string' ? old.colourDirection : '',
    colours: [],
  };
  sections.brandReferences = {
    notes: typeof old.references === 'string' ? old.references : '',
    items: [],
  };
  delete sections.brand;
  return project;
}
```

Then in the same file, update the existing `migrateLegacy` return object — replace `brand: {},` with:

```ts
      brandTone: { words: [], customWords: [], description: '', voiceNotes: '' },
      brandColour: { direction: '', colours: [] },
      brandReferences: { notes: '', items: [] },
```

(Remove the `brand: {}` line entirely.)

- [ ] **Step 4: Call shim on load in `useProjectSync.ts`**

In `client/src/storage/useProjectSync.ts`:

- Change the import to `import { migrateLogicShape, migrateBrandShape } from './migrations';`
- Change the hydration line from `.then((p) => { if (!cancelled) setProject(migrateLogicShape(p)); })` to `.then((p) => { if (!cancelled) setProject(migrateBrandShape(migrateLogicShape(p))); })`.

- [ ] **Step 5: Run tests**

```
npx vitest run client/src/storage/migrations.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/storage/migrations.ts client/src/storage/migrations.test.ts client/src/App.tsx client/src/storage/useProjectSync.ts
git commit -m "feat(migrations): map v2-alpha brand object to per-page slots"
```

---

## Task 11 — Export wiring

**Files:**
- Modify: `client/src/export/markdown.ts`
- Modify: `client/src/export/widgetExporters.ts`

- [ ] **Step 1: Skip brand parent hub in markdown**

In `client/src/export/markdown.ts`, change:

```ts
    if (sec.id === 'logic') continue; // navigation hub, no data
```

to:

```ts
    if (sec.id === 'logic' || sec.id === 'brand') continue; // navigation hubs, no data
```

- [ ] **Step 2: Add widget exporters**

Append to `client/src/export/widgetExporters.ts`:

```ts
registerExporter('brand-overview', () => '');

type ToneSlot = { words?: string[]; customWords?: string[]; description?: string; voiceNotes?: string };
registerExporter('brand-tone', (value) => {
  const v = (value ?? {}) as ToneSlot;
  const lines: string[] = [];
  if (Array.isArray(v.words) && v.words.length) lines.push(`**Tone words:** ${v.words.join(', ')}`);
  if (v.description) lines.push(`**Description:** ${v.description}`);
  if (v.voiceNotes) lines.push(`**Voice notes:** ${v.voiceNotes}`);
  return lines.join('\n\n') || '_(none)_';
});

type ColourRecord = { name?: string; description?: string; hex?: string };
type ColourSlot = { direction?: string; colours?: ColourRecord[] };
registerExporter('brand-colour', (value) => {
  const v = (value ?? {}) as ColourSlot;
  const lines: string[] = [];
  if (v.direction) lines.push(`**Direction:** ${v.direction}`);
  if (Array.isArray(v.colours) && v.colours.length) {
    lines.push('**Colours:**');
    for (const c of v.colours) {
      let row = `- ${c.name || '(unnamed)'} \`${c.hex || ''}\``;
      if (c.description) row += ` — ${c.description}`;
      lines.push(row);
    }
  }
  return lines.join('\n\n') || '_(none)_';
});

type ReferenceItem = { title?: string; url?: string; description?: string };
type RefSlot = { notes?: string; items?: ReferenceItem[] };
registerExporter('brand-references', (value) => {
  const v = (value ?? {}) as RefSlot;
  const lines: string[] = [];
  if (v.notes) lines.push(`**Notes:** ${v.notes}`);
  if (Array.isArray(v.items) && v.items.length) {
    lines.push('**References:**');
    for (const it of v.items) {
      let row = `- ${it.title || '(untitled)'}`;
      if (it.url) row += ` (${it.url})`;
      if (it.description) row += ` — ${it.description}`;
      lines.push(row);
    }
  }
  return lines.join('\n\n') || '_(none)_';
});
```

- [ ] **Step 3: Run existing markdown export test**

```
npx vitest run client/src/export/markdown.test.ts
```

Expected: PASS (existing tests do not cover brand; new fields rendered via exporters).

- [ ] **Step 4: Commit**

```bash
git add client/src/export/markdown.ts client/src/export/widgetExporters.ts
git commit -m "feat(export): render brand child sections, skip brand hub"
```

---

## Task 12 — E2E smoke extension

**Files:**
- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Extend smoke flow**

In `e2e/smoke.spec.ts`, before the export step, add:

```ts
// Toggle Brand accordion in sidebar
await page.getByRole('button', { name: /Toggle Brand children/i }).click();

// Open Tone page
await page.getByRole('button', { name: /^Tone/ }).click();
await page.getByRole('button', { name: /^playful$/ }).click();

// Add a custom tone word
await page.getByRole('button', { name: /Add tone word/i }).click();
await page.getByPlaceholder('tone word').fill('cosy');
await page.keyboard.press('Enter');

// Open Colour direction page and add a colour
await page.getByRole('button', { name: /Colour direction/ }).click();
await page.getByRole('button', { name: /\+ Add colour/ }).click();
await page.getByLabel('Colour name').fill('Primary');
await page.getByLabel('HEX value').fill('#3366ff');
await page.getByLabel('HEX value').blur();
```

Then continue to the existing export step and assert markdown contains `playful`, `cosy`, `Primary`, `#3366ff`.

- [ ] **Step 2: Run e2e**

```
npx playwright test
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add e2e/
git commit -m "test(e2e): cover brand split, tone editing, colour picker in smoke flow"
```

---

## Final verification

- [ ] **Step 1: Full test suite**

```
npx vitest run
npx playwright test
npx tsc -p tsconfig.json --noEmit
```

All green.

- [ ] **Step 2: Manual session**

```
npm run dev
```

Walk through:
1. Sidebar: Logic collapsed by default; click chevron → six children appear. Navigate into Rules → accordion stays expanded. Refresh page → expanded state persists. Brand: same behavior.
2. Brand hub: three preview cards render (empty state copy).
3. Tone page: select defaults, add custom, remove custom, type description + voice notes. Refresh → persisted.
4. Colour direction: add 2 colours via different inputs (visual picker, HEX, HSL, RGB). Invalid input shows red border. Refresh → persisted.
5. References: notes + 1 structured ref. Refresh → persisted.
6. Export: open export modal, copy markdown, verify tone/colours/references render.
7. Mobile (resize browser): nav drawer + accordion + brand pages all usable.


