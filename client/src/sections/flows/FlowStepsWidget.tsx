import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import { AutoField } from '@/renderer/AutoField';
import { styles } from '@/renderer/styles';

const STEP_TYPES = ['Action', 'Screen visit', 'Decision', 'System', 'End'] as const;
type StepType = typeof STEP_TYPES[number];
type Step = { id: string; type: StepType; description: string; decisionYes?: string; decisionNo?: string };

const placeholderFor = (t: StepType) => ({
  Action: 'What does the user do? e.g. Answers a quiz question',
  'Screen visit': 'Which screen? e.g. User arrives at Results page',
  Decision: 'What is the decision? e.g. Has user completed the quiz?',
  System: 'What does the app do? e.g. Calculates profile type',
  End: 'How does this flow end?',
})[t];

export function FlowStepsWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const steps: Step[] = Array.isArray(value) ? (value as Step[]) : [];

  const set = (next: Step[]) => onChange(next);
  const add = () => set([...steps, { id: crypto.randomUUID().slice(0, 8), type: 'Action', description: '' }]);
  const upd = (id: string, k: keyof Step, v: unknown) => set(steps.map((st) => (st.id === id ? { ...st, [k]: v } as Step : st)));
  const rm = (id: string) => set(steps.filter((st) => st.id !== id));

  return (
    <div>
      {steps.map((step, i) => (
        <div key={step.id} style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div aria-hidden style={{ width: 22, height: 22, minWidth: 22, borderRadius: '50%', background: C.accentDim, border: `1px solid ${C.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.accent, marginTop: 8 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: step.type === 'Decision' ? 10 : 0 }}>
                <select aria-label={`Step ${i + 1} type`} style={{ ...s.fb, width: mobile ? '100%' : 140, cursor: 'pointer' }} value={step.type} onChange={(e) => upd(step.id, 'type', e.target.value as StepType)}>
                  {STEP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ flex: '1 1 160px' }}>
                  <AutoField baseStyle={s.fb} value={step.description} onChange={(v) => upd(step.id, 'description', v)} placeholder={placeholderFor(step.type)} single ariaLabel={`Step ${i + 1} description`} />
                </div>
                <button style={s.btnRm} onClick={() => rm(step.id)} aria-label={`Remove step ${i + 1}`}>✕</button>
              </div>
              {step.type === 'Decision' && (
                <div style={s.g2}>
                  <div>
                    <label style={{ ...s.lbl, color: C.green }}>→ Yes / True path</label>
                    <AutoField baseStyle={s.fb} value={step.decisionYes ?? ''} onChange={(v) => upd(step.id, 'decisionYes', v)} placeholder="What happens if yes?" ariaLabel={`Step ${i + 1} yes path`} />
                  </div>
                  <div>
                    <label style={{ ...s.lbl, color: C.red }}>→ No / False path</label>
                    <AutoField baseStyle={s.fb} value={step.decisionNo ?? ''} onChange={(v) => upd(step.id, 'decisionNo', v)} placeholder="What happens if no?" ariaLabel={`Step ${i + 1} no path`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <button style={{ ...s.btnAdd, fontSize: 12, padding: 8 }} onClick={add}>+ Add step</button>
    </div>
  );
}
