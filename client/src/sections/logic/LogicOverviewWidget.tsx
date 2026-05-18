import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useNavigation } from '@/shell/NavigationContext';
import { useTheme } from '@/theme/useTheme';
import { useBreakpoint } from '@/shell/useBreakpoint';

const SUBS: Array<{ id: string; title: string; desc: string }> = [
  { id: 'logicRules', title: 'Simple rules', desc: 'Plain-English app rules. "When X, then Y." Start here if your app is rule-driven.' },
  { id: 'logicGroups', title: 'Groups', desc: 'Colour-coded labels to organise rules across categories. Optional.' },
  { id: 'logicAttributes', title: 'Attributes', desc: 'Typed state stored per user (e.g. quiz scores, profile flags).' },
  { id: 'logicScoring', title: 'Scoring', desc: 'What triggers a change to an attribute and how it changes.' },
  { id: 'logicConditions', title: 'Conditions', desc: 'Named threshold checks over attributes. Reused in outcomes.' },
  { id: 'logicOutcomes', title: 'Outcomes', desc: 'What happens when conditions are met. Show pages, send events, etc.' },
];

export function LogicOverviewWidget(_props: FieldRendererProps) {
  const { setSection } = useNavigation();
  const { tokens: C } = useTheme();
  const mobile = useBreakpoint();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {SUBS.map((s) => (
        <button key={s.id} type="button" onClick={() => setSection(s.id)} style={{
          textAlign: 'left', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: 16, cursor: 'pointer', color: C.text, fontFamily: 'inherit',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{s.title}</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
        </button>
      ))}
    </div>
  );
}
