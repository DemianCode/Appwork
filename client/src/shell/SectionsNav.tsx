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
            aria-controls={`nav-children-${s.id}`}
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

        for (const s of sections) {
          const isChild = !!(s.parentId && sectionIds.has(s.parentId));
          if (isChild) continue;

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
            const childRows = sections
              .filter((x) => x.parentId === s.id)
              .map((c) => renderItem(c, { indent: true, isParent: false }));
            rendered.push(
              <div
                key={`children-${s.id}`}
                role="group"
                id={`nav-children-${s.id}`}
                aria-label={`${s.title} children`}
              >
                {childRows}
              </div>
            );
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
