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
