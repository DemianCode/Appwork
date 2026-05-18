import { useState } from 'react';
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import { LogicState, emptyLogic } from './state';
import { SimpleRules } from './tabs/SimpleRules';
import { Groups } from './tabs/Groups';
import { Attributes } from './tabs/Attributes';
import { Scoring } from './tabs/Scoring';
import { Conditions } from './tabs/Conditions';
import { Outcomes } from './tabs/Outcomes';

const TABS = ['Simple rules', 'Groups', 'Attributes', 'Scoring', 'Conditions', 'Outcomes'] as const;
type TabName = typeof TABS[number];

export function LogicTabsWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const state: LogicState = (value as LogicState) ?? emptyLogic();
  const [tab, setTab] = useState<TabName>('Simple rules');
  const patch = <K extends keyof LogicState>(k: K, v: LogicState[K]) => onChange({ ...state, [k]: v });

  return (
    <div>
      <div role="tablist" aria-label="Logic tabs" style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t} role="tab" aria-selected={active} type="button" onClick={() => setTab(t)}
              style={{
                padding: '9px 15px', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
                color: active ? C.text : C.muted, background: 'none', border: 'none',
                borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap',
              }}>
              {t}
            </button>
          );
        })}
      </div>
      {tab === 'Simple rules' && <SimpleRules value={state.simpleRules} onChange={(v) => patch('simpleRules', v)} />}
      {tab === 'Groups'       && <Groups       value={state.groups}       onChange={(v) => patch('groups', v)} />}
      {tab === 'Attributes'   && <Attributes   state={state} onChange={(v) => patch('attributes', v)} />}
      {tab === 'Scoring'      && <Scoring      state={state} onChange={(v) => patch('scoring', v)} />}
      {tab === 'Conditions'   && <Conditions   state={state} onChange={(v) => patch('conditions', v)} />}
      {tab === 'Outcomes'     && <Outcomes     state={state} onChange={(v) => patch('outcomes', v)} />}
    </div>
  );
}
