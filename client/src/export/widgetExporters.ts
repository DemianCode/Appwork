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

// logic-overview is navigation-only — nothing to export
registerExporter('logic-overview', () => '');
