import { useEffect, useRef } from 'react';
import { useTheme } from '@/theme/useTheme';
import { useBreakpoint } from './useBreakpoint';
import { SECTIONS } from '@/schema/sections';

const GROUPS: Array<{ id: 'core' | 'logic' | 'context'; label: string }> = [
  { id: 'core', label: 'Core' },
  { id: 'logic', label: 'Logic & data' },
  { id: 'context', label: 'Context' },
];

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

  useEffect(() => {
    if (mobile && open && firstFocusable.current) firstFocusable.current.focus();
  }, [mobile, open]);

  useEffect(() => {
    if (!mobile || !open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobile, open, onClose]);

  const Item = ({ id, label, icon, indent, refProp }: { id: string; label: string; icon: string; indent: boolean; refProp?: React.RefObject<HTMLButtonElement> }) => {
    const active = id === current;
    const count = counts[id];
    return (
      <button
        type="button"
        ref={refProp}
        onClick={() => { onSelect(id); if (mobile) onClose(); }}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: `7px ${indent ? 16 : 16}px 7px ${indent ? 36 : 16}px`,
          fontSize: indent ? 12 : 13, cursor: 'pointer', background: active ? C.accentDim : 'none',
          width: '100%', textAlign: 'left', border: 'none',
          borderLeft: active ? `2px solid ${C.accent}` : '2px solid transparent',
          fontWeight: active ? 600 : 400, color: active ? C.text : C.muted, fontFamily: 'inherit',
        }}>
        <span aria-hidden style={{ opacity: 0.7 }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {count !== undefined && count > 0 && <span style={{ fontSize: 10, background: C.dim, borderRadius: 20, padding: '1px 6px', color: C.muted }}>{count}</span>}
      </button>
    );
  };

  const navBody = (
    <nav aria-label="Sections">
      {GROUPS.map((g, gi) => {
        const sections = SECTIONS.filter((s) => s.group === g.id);
        const sectionIds = new Set(sections.map((s) => s.id));
        return (
          <div key={g.id} style={{ marginTop: gi === 0 ? 0 : 8, paddingTop: gi === 0 ? 0 : 8, borderTop: gi === 0 ? 'none' : `1px solid ${C.border}` }}>
            <div style={{ padding: '8px 16px 6px', fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{g.label}</div>
            {sections.map((s, i) => {
              const indent = !!(s.parentId && sectionIds.has(s.parentId));
              return (
                <Item
                  key={s.id} id={s.id} label={s.title} icon={s.icon} indent={indent}
                  refProp={gi === 0 && i === 0 ? firstFocusable : undefined}
                />
              );
            })}
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
