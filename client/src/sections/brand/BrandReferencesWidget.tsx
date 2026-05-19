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
