import { useTheme } from '@/theme/useTheme';
import { styles } from '@/renderer/styles';
import { Attribute, LogicState } from '../state';

const TYPES = ['number', 'boolean', 'text', 'enum'] as const;

export function Attributes({ state, onChange }: { state: LogicState; onChange: (v: Attribute[]) => void }) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const list = state.attributes;

  const upd = <K extends keyof Attribute>(id: string, k: K, v: Attribute[K]) =>
    onChange(list.map((a) => (a.id === id ? { ...a, [k]: v } : a)));
  const add = () => onChange([...list, { id: crypto.randomUUID().slice(0, 8), name: '', type: 'number', description: '', defaultValue: '', groupId: null }]);
  const rm = (id: string) => onChange(list.filter((a) => a.id !== id));

  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Stored per user. Scoring writes to them, conditions read from them.</p>
      {list.map((a, i) => (
        <div key={a.id} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{a.name || `Attribute ${i + 1}`}</div>
            <button style={s.btnRm} onClick={() => rm(a.id)} aria-label={`Remove attribute ${i + 1}`}>Remove</button>
          </div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Name</label><input style={s.fb} value={a.name} onChange={(e) => upd(a.id, 'name', e.target.value)} aria-label={`Attribute ${i + 1} name`} /></div>
            <div>
              <label style={s.lbl}>Type</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={a.type} onChange={(e) => upd(a.id, 'type', e.target.value as Attribute['type'])} aria-label={`Attribute ${i + 1} type`}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Default</label><input style={s.fb} value={a.defaultValue} onChange={(e) => upd(a.id, 'defaultValue', e.target.value)} aria-label={`Attribute ${i + 1} default`} /></div>
            <div>
              <label style={s.lbl}>Group</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={a.groupId ?? ''} onChange={(e) => upd(a.id, 'groupId', e.target.value || null)} aria-label={`Attribute ${i + 1} group`}>
                <option value="">No group</option>
                {state.groups.map((g) => <option key={g.id} value={g.id}>{g.name || '(unnamed)'}</option>)}
              </select>
            </div>
          </div>
          <div><label style={s.lbl}>Description</label><input style={s.fb} value={a.description} onChange={(e) => upd(a.id, 'description', e.target.value)} aria-label={`Attribute ${i + 1} description`} /></div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={add}>+ Add Attribute</button>
    </div>
  );
}
