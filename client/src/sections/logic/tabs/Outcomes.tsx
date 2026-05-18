import { useTheme } from '@/theme/useTheme';
import { styles } from '@/renderer/styles';
import { Outcome, LogicState } from '../state';

export function Outcomes({ state, onChange }: { state: LogicState; onChange: (v: Outcome[]) => void }) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const list = state.outcomes;

  const upd = <K extends keyof Outcome>(id: string, k: K, v: Outcome[K]) =>
    onChange(list.map((o) => (o.id === id ? { ...o, [k]: v } : o)));
  const add = () => onChange([...list, { id: crypto.randomUUID().slice(0, 8), name: '', conditionIds: [], logic: 'AND', action: '', groupId: null }]);
  const rm = (id: string) => onChange(list.filter((o) => o.id !== id));
  const toggleCondition = (oid: string, cid: string) => {
    const o = list.find((x) => x.id === oid)!;
    const ids = o.conditionIds.includes(cid) ? o.conditionIds.filter((i) => i !== cid) : [...o.conditionIds, cid];
    upd(oid, 'conditionIds', ids);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>What the app shows or does when conditions are met.</p>
      {list.map((o, i) => (
        <div key={o.id} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{o.name || `Outcome ${i + 1}`}</div>
            <button style={s.btnRm} onClick={() => rm(o.id)} aria-label={`Remove outcome ${i + 1}`}>Remove</button>
          </div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Outcome name</label><input style={s.fb} value={o.name} onChange={(e) => upd(o.id, 'name', e.target.value)} placeholder="e.g. Show Thoughtful results" aria-label={`Outcome ${i + 1} name`} /></div>
            <div>
              <label style={s.lbl}>Group</label>
              <select style={{ ...s.fb, cursor: 'pointer' }} value={o.groupId ?? ''} onChange={(e) => upd(o.id, 'groupId', e.target.value || null)} aria-label={`Outcome ${i + 1} group`}>
                <option value="">No group</option>
                {state.groups.map((g) => <option key={g.id} value={g.id}>{g.name || '(unnamed)'}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={s.lbl}>When these conditions are met</label>
            <div style={{ background: C.surface, borderRadius: 6, border: `1px solid ${C.border}`, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {state.conditions.length === 0 && <span style={{ fontSize: 12, color: C.muted }}>No conditions defined yet.</span>}
              {state.conditions.map((c) => {
                const attr = state.attributes.find((a) => a.id === c.attributeId);
                const checked = o.conditionIds.includes(c.id);
                return (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleCondition(o.id, c.id)} style={{ accentColor: C.accent, width: 14, height: 14 }} aria-label={`Outcome ${i + 1} uses condition ${c.name || c.id}`} />
                    <span style={{ fontSize: 13, color: checked ? C.text : C.muted }}>
                      <span style={{ color: C.accent, fontWeight: 600 }}>{c.name || '(unnamed)'}</span>
                      {attr && <span style={{ color: C.muted, fontFamily: 'monospace', fontSize: 12, marginLeft: 6 }}>{attr.name} {c.operator} {c.value}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          {o.conditionIds.length > 1 && (
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ ...s.lbl, margin: 0 }}>Logic</label>
              <select style={{ ...s.fb, width: 'auto', cursor: 'pointer' }} value={o.logic} onChange={(e) => upd(o.id, 'logic', e.target.value as 'AND' | 'OR')} aria-label={`Outcome ${i + 1} logic`}>
                <option value="AND">ALL must be true (AND)</option>
                <option value="OR">ANY must be true (OR)</option>
              </select>
            </div>
          )}
          <div><label style={s.lbl}>Then — action or display</label><input style={s.fb} value={o.action} onChange={(e) => upd(o.id, 'action', e.target.value)} placeholder="e.g. Show matching profile and filter results" aria-label={`Outcome ${i + 1} action`} /></div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={add}>+ Add Outcome</button>
    </div>
  );
}
