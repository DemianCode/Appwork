import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import { AutoField } from '@/renderer/AutoField';
import { styles } from '@/renderer/styles';

const TYPES = ['text', 'number', 'boolean', 'date', 'enum', 'id', 'other'];
type DField = { id: string; name: string; type: string; required: boolean; validation: string };

export function DataFieldsWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const fields: DField[] = Array.isArray(value) ? (value as DField[]) : [];

  const set = (n: DField[]) => onChange(n);
  const add = () => set([...fields, { id: crypto.randomUUID().slice(0, 8), name: '', type: 'text', required: false, validation: '' }]);
  const upd = (id: string, k: keyof DField, v: unknown) => set(fields.map((f) => (f.id === id ? { ...f, [k]: v } as DField : f)));
  const rm = (id: string) => set(fields.filter((f) => f.id !== id));

  return (
    <div>
      {fields.map((f, i) => (
        <div key={f.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <div style={s.g2}>
            <div>
              <label style={s.lbl}>Field name</label>
              <AutoField baseStyle={s.fb} value={f.name} onChange={(v) => upd(f.id, 'name', v)} placeholder="e.g. firstName" single ariaLabel={`Field ${i + 1} name`} />
            </div>
            <div>
              <label style={s.lbl}>Type</label>
              <select aria-label={`Field ${i + 1} type`} style={{ ...s.fb, cursor: 'pointer' }} value={f.type} onChange={(e) => upd(f.id, 'type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={s.g2}>
            <div>
              <label style={s.lbl}>Required?</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text, fontSize: 13 }}>
                <input type="checkbox" checked={f.required} onChange={(e) => upd(f.id, 'required', e.target.checked)} aria-label={`Field ${i + 1} required`} /> Required
              </label>
            </div>
            <div>
              <label style={s.lbl}>Validation notes</label>
              <AutoField baseStyle={s.fb} value={f.validation} onChange={(v) => upd(f.id, 'validation', v)} placeholder="e.g. email format, max 100 chars" ariaLabel={`Field ${i + 1} validation`} />
            </div>
          </div>
          <button style={s.btnRm} onClick={() => rm(f.id)} aria-label={`Remove field ${i + 1}`}>Remove</button>
        </div>
      ))}
      <button style={{ ...s.btnAdd, fontSize: 12, padding: 8 }} onClick={add}>+ Add field</button>
    </div>
  );
}
