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

registerExporter('brand-overview', () => '');

type ToneSlot = { words?: string[]; customWords?: string[]; description?: string; voiceNotes?: string };
registerExporter('brand-tone', (value) => {
  const v = (value ?? {}) as ToneSlot;
  const lines: string[] = [];
  if (Array.isArray(v.words) && v.words.length) lines.push(`**Tone words:** ${v.words.join(', ')}`);
  if (v.description) lines.push(`**Description:** ${v.description}`);
  if (v.voiceNotes) lines.push(`**Voice notes:** ${v.voiceNotes}`);
  return lines.join('\n\n') || '_(none)_';
});

type ColourRecord = { name?: string; description?: string; hex?: string };
type ColourSlot = { direction?: string; colours?: ColourRecord[] };
registerExporter('brand-colour', (value) => {
  const v = (value ?? {}) as ColourSlot;
  const lines: string[] = [];
  if (v.direction) lines.push(`**Direction:** ${v.direction}`);
  if (Array.isArray(v.colours) && v.colours.length) {
    lines.push('**Colours:**');
    for (const c of v.colours) {
      let row = `- ${c.name || '(unnamed)'} \`${c.hex || ''}\``;
      if (c.description) row += ` — ${c.description}`;
      lines.push(row);
    }
  }
  return lines.join('\n\n') || '_(none)_';
});

type ReferenceItem = { title?: string; url?: string; description?: string };
type RefSlot = { notes?: string; items?: ReferenceItem[] };
registerExporter('brand-references', (value) => {
  const v = (value ?? {}) as RefSlot;
  const lines: string[] = [];
  if (v.notes) lines.push(`**Notes:** ${v.notes}`);
  if (Array.isArray(v.items) && v.items.length) {
    lines.push('**References:**');
    for (const it of v.items) {
      let row = `- ${it.title || '(untitled)'}`;
      if (it.url) row += ` (${it.url})`;
      if (it.description) row += ` — ${it.description}`;
      lines.push(row);
    }
  }
  return lines.join('\n\n') || '_(none)_';
});
