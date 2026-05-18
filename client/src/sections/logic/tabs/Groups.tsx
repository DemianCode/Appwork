import { useTheme } from '@/theme/useTheme';
import { styles } from '@/renderer/styles';
import { Group, GROUP_COLORS } from '../state';

export function Groups({ value, onChange }: { value: Group[]; onChange: (v: Group[]) => void }) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const groups = value ?? [];

  const upd = (id: string, k: keyof Group, v: string) => onChange(groups.map((g) => (g.id === id ? { ...g, [k]: v } : g)));
  const add = () => onChange([...groups, { id: crypto.randomUUID().slice(0, 8), name: '', color: GROUP_COLORS[groups.length % GROUP_COLORS.length]! }]);
  const rm = (id: string) => onChange(groups.filter((g) => g.id !== id));

  return (
    <div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Groups appear as colour-coded labels on rules. Create them first so they're available in dropdowns.</p>
      {groups.map((g, i) => (
        <div key={g.id} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{g.name || `Group ${i + 1}`}</div>
            <button style={s.btnRm} onClick={() => rm(g.id)} aria-label={`Remove group ${i + 1}`}>Remove</button>
          </div>
          <div style={s.g2}>
            <div><label style={s.lbl}>Group name</label><input style={s.fb} value={g.name} onChange={(e) => upd(g.id, 'name', e.target.value)} aria-label={`Group ${i + 1} name`} /></div>
            <div>
              <label style={s.lbl}>Colour</label>
              <div style={{ display: 'flex', gap: 7, paddingTop: 5, flexWrap: 'wrap' }} role="radiogroup" aria-label={`Group ${i + 1} colour`}>
                {GROUP_COLORS.map((c) => (
                  <button key={c} type="button" role="radio" aria-checked={g.color === c} aria-label={c} onClick={() => upd(g.id, 'color', c)} style={{
                    width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: g.color === c ? '2px solid #fff' : '2px solid transparent', flexShrink: 0,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <button style={s.btnAdd} onClick={add}>+ Add Group</button>
    </div>
  );
}
