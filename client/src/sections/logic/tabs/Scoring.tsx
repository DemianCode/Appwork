import { useTheme } from '@/theme/useTheme';
import { styles } from '@/renderer/styles';
import { ScoringRule, LogicState } from '../state';

const OPS = ['increment', 'decrement', 'set', 'toggle'] as const;

export function Scoring({ state, onChange }: { state: LogicState; onChange: (v: ScoringRule[]) => void }) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const list = state.scoring;

  const upd = <K extends keyof ScoringRule>(id: string, k: K, v: ScoringRule[K]) =>
    onChange(list.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const add = () => onChange([...list, { id: crypto.randomUUID().slice(0, 8), name: '', trigger: '', attributeId: '', operation: 'increment', value: '1', groupId: null }]);
  const rm = (id: string) => onChange(list.filter((r) => r.id !== id));

  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>What triggers a change to a profile attribute and how it changes.</p>
      {list.map((r, i) => (
        <div key={r.id} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{r.name || `Scoring rule ${i + 1}`}</div>
            <button style={s.btnRm} onClick={() => rm(r.id)} aria-label={`Remove scoring rule ${i + 1}`}>Remove</button>
          </div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Rule name</label><input style={s.fb} value={r.name} onChange={(e) => upd(r.id, 'name', e.target.value)} placeholder="e.g. Quiz Yes Answer" aria-label={`Scoring ${i + 1} name`} /></div>
            <div>
              <label style={s.lbl}>Group</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={r.groupId ?? ''} onChange={(e) => upd(r.id, 'groupId', e.target.value || null)} aria-label={`Scoring ${i + 1} group`}>
                <option value="">No group</option>
                {state.groups.map((g) => <option key={g.id} value={g.id}>{g.name || '(unnamed)'}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={s.lbl}>Trigger</label>
            <input style={s.fb} value={r.trigger} onChange={(e) => upd(r.id, 'trigger', e.target.value)} placeholder="What causes this to fire?" aria-label={`Scoring ${i + 1} trigger`} />
          </div>
          <div style={s.g2}>
            <div>
              <label style={s.lbl}>Target attribute</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={r.attributeId} onChange={(e) => upd(r.id, 'attributeId', e.target.value)} aria-label={`Scoring ${i + 1} attribute`}>
                <option value="">Select attribute…</option>
                {state.attributes.map((a) => <option key={a.id} value={a.id}>{a.name || '(unnamed)'}</option>)}
              </select>
            </div>
            <div>
              <label style={s.lbl}>Operation</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={r.operation} onChange={(e) => upd(r.id, 'operation', e.target.value as ScoringRule['operation'])} aria-label={`Scoring ${i + 1} operation`}>
                {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div><label style={s.lbl}>Value</label><input style={s.fb} value={r.value} onChange={(e) => upd(r.id, 'value', e.target.value)} placeholder="e.g. 1" aria-label={`Scoring ${i + 1} value`} /></div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={add}>+ Add Scoring Rule</button>
    </div>
  );
}
