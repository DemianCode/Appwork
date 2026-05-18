import { useTheme } from '@/theme/useTheme';
import { AutoField } from '@/renderer/AutoField';
import { styles } from '@/renderer/styles';
import type { SimpleRule } from '../state';

const TYPES = ['Display rule', 'Personalisation', 'Navigation', 'Validation', 'Calculation', 'Other'];

export function SimpleRules({ value, onChange }: { value: SimpleRule[]; onChange: (v: SimpleRule[]) => void }) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const rules = value ?? [];

  const upd = (id: string, k: keyof SimpleRule, v: string) => onChange(rules.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const add = () => onChange([...rules, { id: crypto.randomUUID().slice(0, 8), name: '', type: 'Display rule', condition: '', action: '', notes: '', category: '' }]);
  const rm = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div>
      {rules.map((r, i) => (
        <div key={r.id} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{r.name || `Rule ${i + 1}`}</div>
            <button style={s.btnRm} onClick={() => rm(r.id)} aria-label={`Remove rule ${i + 1}`}>Remove</button>
          </div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Rule name</label><AutoField baseStyle={s.fb} value={r.name} onChange={(v) => upd(r.id, 'name', v)} placeholder="e.g. Show personalised results" single ariaLabel={`Rule ${i + 1} name`} /></div>
            <div>
              <label style={s.lbl}>Type</label>
              <select aria-label={`Rule ${i + 1} type`} style={{ ...s.fb, cursor: 'pointer' }} value={r.type} onChange={(e) => upd(r.id, 'type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div><label style={s.lbl}>Condition — when does this apply?</label><AutoField baseStyle={s.fb} value={r.condition} onChange={(v) => upd(r.id, 'condition', v)} placeholder="Describe in plain English" ariaLabel={`Rule ${i + 1} condition`} /></div>
          <div><label style={s.lbl}>Action — what happens?</label><AutoField baseStyle={s.fb} value={r.action} onChange={(v) => upd(r.id, 'action', v)} placeholder="What the app should do" ariaLabel={`Rule ${i + 1} action`} /></div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Notes</label><AutoField baseStyle={s.fb} value={r.notes} onChange={(v) => upd(r.id, 'notes', v)} placeholder="Edge cases, exceptions" ariaLabel={`Rule ${i + 1} notes`} /></div>
            <div><label style={s.lbl}>Category</label><AutoField baseStyle={s.fb} value={r.category} onChange={(v) => upd(r.id, 'category', v)} placeholder="e.g. Onboarding" single ariaLabel={`Rule ${i + 1} category`} /></div>
          </div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={add}>+ Add Rule</button>
    </div>
  );
}
