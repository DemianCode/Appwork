import { useTheme } from '@/theme/useTheme';
import { styles } from '@/renderer/styles';
import { Condition, LogicState } from '../state';

const OPS = ['>', '<', '>=', '<=', '==', '!=', 'contains', 'not contains'] as const;

export function Conditions({ state, onChange }: { state: LogicState; onChange: (v: Condition[]) => void }) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const list = state.conditions;

  const upd = <K extends keyof Condition>(id: string, k: K, v: Condition[K]) =>
    onChange(list.map((c) => (c.id === id ? { ...c, [k]: v } : c)));
  const add = () => onChange([...list, { id: crypto.randomUUID().slice(0, 8), name: '', attributeId: '', operator: '>', value: '', groupId: null }]);
  const rm = (id: string) => onChange(list.filter((c) => c.id !== id));

  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Named threshold checks on attributes. Selectable in Outcomes.</p>
      {list.map((c, i) => (
        <div key={c.id} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{c.name || `Condition ${i + 1}`}</div>
            <button style={s.btnRm} onClick={() => rm(c.id)} aria-label={`Remove condition ${i + 1}`}>Remove</button>
          </div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Name</label><input style={s.fb} value={c.name} onChange={(e) => upd(c.id, 'name', e.target.value)} placeholder="e.g. Is Thoughtful" aria-label={`Condition ${i + 1} name`} /></div>
            <div>
              <label style={s.lbl}>Group</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={c.groupId ?? ''} onChange={(e) => upd(c.id, 'groupId', e.target.value || null)} aria-label={`Condition ${i + 1} group`}>
                <option value="">No group</option>
                {state.groups.map((g) => <option key={g.id} value={g.id}>{g.name || '(unnamed)'}</option>)}
              </select>
            </div>
          </div>
          <div style={s.g2}>
            <div>
              <label style={s.lbl}>Attribute</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={c.attributeId} onChange={(e) => upd(c.id, 'attributeId', e.target.value)} aria-label={`Condition ${i + 1} attribute`}>
                <option value="">Select attribute…</option>
                {state.attributes.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
              </select>
            </div>
            <div>
              <label style={s.lbl}>Operator</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={c.operator} onChange={(e) => upd(c.id, 'operator', e.target.value as Condition['operator'])} aria-label={`Condition ${i + 1} operator`}>
                {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div><label style={s.lbl}>Value</label><input style={s.fb} value={c.value} onChange={(e) => upd(c.id, 'value', e.target.value)} placeholder="e.g. 3" aria-label={`Condition ${i + 1} value`} /></div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={add}>+ Add Condition</button>
    </div>
  );
}
