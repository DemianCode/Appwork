import type { LogicState } from '@/sections/logic/state';
import type { Project } from '@/schema/types';

type WidgetExporter = (value: unknown, project: Project) => string;
const registry = new Map<string, WidgetExporter>();
export const registerExporter = (name: string, fn: WidgetExporter) => registry.set(name, fn);
export const getExporter = (name: string) => registry.get(name);

type FlowStep = { type: string; description?: string; decisionYes?: string; decisionNo?: string };

registerExporter('flow-steps', (value) => {
  const steps = (Array.isArray(value) ? value : []) as FlowStep[];
  if (!steps.length) return '_(no steps)_';
  return steps.map((s, i) => {
    let line = `${i + 1}. **[${s.type}]** ${s.description ?? ''}`;
    if (s.type === 'Decision') {
      if (s.decisionYes) line += `\n   - → **Yes:** ${s.decisionYes}`;
      if (s.decisionNo) line += `\n   - → **No:** ${s.decisionNo}`;
    }
    return line;
  }).join('\n');
});

type DField = { name?: string; type: string; required: boolean; validation?: string };

registerExporter('data-fields', (value) => {
  const fields = (Array.isArray(value) ? value : []) as DField[];
  if (!fields.length) return '_(no fields)_';
  let out = '| Field | Type | Required | Notes |\n|---|---|---|---|\n';
  for (const f of fields) out += `| ${f.name || '—'} | ${f.type} | ${f.required ? 'yes' : 'no'} | ${f.validation || '—'} |\n`;
  return out;
});

registerExporter('logic-tabs', (value) => {
  const s = (value as Partial<LogicState> | null) ?? null;
  if (!s) return '_(no logic defined)_';
  const out: string[] = [];
  if (s.simpleRules?.length) {
    out.push('### Simple rules\n');
    for (const r of s.simpleRules) {
      out.push(`- **${r.name || '(unnamed)'}** _(${r.type})_`);
      if (r.condition) out.push(`  - **If:** ${r.condition}`);
      if (r.action)    out.push(`  - **Then:** ${r.action}`);
      if (r.notes)     out.push(`  - **Notes:** ${r.notes}`);
    }
    out.push('');
  }
  if (s.groups?.length || s.attributes?.length || s.scoring?.length || s.conditions?.length || s.outcomes?.length) {
    out.push('### Attribute system\n');
    if (s.groups?.length) out.push(`**Groups:** ${s.groups.map((g) => g.name).join(', ')}\n`);
    if (s.attributes?.length) {
      out.push('| Attribute | Type | Default | Description |\n|---|---|---|---|');
      for (const a of s.attributes) out.push(`| ${a.name} | ${a.type} | ${a.defaultValue || '—'} | ${a.description || '—'} |`);
      out.push('');
    }
    if (s.scoring?.length && s.attributes) {
      out.push('**Scoring rules:**');
      for (const sr of s.scoring) {
        const attrName = s.attributes.find((a) => a.id === sr.attributeId)?.name ?? '?';
        out.push(`- _${sr.name}_: trigger "${sr.trigger}" → ${sr.operation} ${attrName} by ${sr.value}`);
      }
      out.push('');
    }
    if (s.conditions?.length && s.attributes) {
      out.push('**Conditions:**');
      for (const c of s.conditions) {
        const attrName = s.attributes.find((a) => a.id === c.attributeId)?.name ?? '?';
        out.push(`- _${c.name}_: ${attrName} ${c.operator} ${c.value}`);
      }
      out.push('');
    }
    if (s.outcomes?.length && s.conditions) {
      out.push('**Outcomes:**');
      for (const o of s.outcomes) {
        const names = o.conditionIds.map((id) => s.conditions?.find((c) => c.id === id)?.name ?? id).join(` ${o.logic} `);
        out.push(`- _${o.name}_: when ${names || '(no conditions)'} → ${o.action}`);
      }
    }
  }
  return out.join('\n');
});
