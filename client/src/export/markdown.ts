import type { Project, SectionConfig, FieldConfig } from '@/schema/types';
import { SECTIONS } from '@/schema/sections';
import { getExporter } from './widgetExporters';

export function toMarkdown(project: Project): string {
  const L: string[] = [];
  L.push(`# ${project.meta.name}`);
  L.push('');
  const overview = project.sections.overview as Record<string, unknown> | undefined;
  if (overview?.problem) { L.push(`> ${overview.problem as string}`); L.push(''); }
  if (overview?.tagline) L.push(`**One-liner:** ${overview.tagline as string}`);
  if (overview?.uniqueValue) L.push(`**Unique value:** ${overview.uniqueValue as string}`);
  if (overview?.successCriteria) L.push(`**Success criteria:** ${overview.successCriteria as string}`);
  L.push('');

  for (const sec of SECTIONS) {
    if (sec.id === 'overview') continue;
    if (sec.id === 'logic' || sec.id === 'brand') continue; // navigation hubs, no data
    const value = project.sections[sec.id];
    if (sec.shape === 'list' && (!Array.isArray(value) || value.length === 0)) continue;
    if (sec.shape === 'object' && !value) continue;

    L.push(`## ${sec.title}`);
    if (sec.intro) L.push(`_${sec.intro}_`);
    L.push('');
    L.push(renderSection(sec, value, project));
    L.push('');
  }

  L.push('---');
  L.push('');
  L.push('## Brief for AI planning');
  L.push('');
  L.push('Using this brief, please help me:');
  L.push('');
  L.push('1. Identify gaps in flows, logic, or data');
  L.push('2. Flag missing integrations or roles');
  L.push('3. Recommend where the rules/personalisation layer should live');
  L.push('4. Suggest MVP scope — what to build first');
  L.push('5. Highlight risks, ambiguity, or open questions');
  L.push('');
  return L.join('\n');
}

function renderSection(sec: SectionConfig, value: unknown, project: Project): string {
  if (sec.shape === 'object') return renderObject(sec.fields, (value as Record<string, unknown>) ?? {}, project);
  return renderList(sec, Array.isArray(value) ? value as Array<Record<string, unknown>> : [], project);
}

function renderObject(fields: FieldConfig[], obj: Record<string, unknown>, project: Project): string {
  const out: string[] = [];
  for (const f of fields) {
    const v = obj[f.key];
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    if (f.type === 'custom' && f.widget) {
      const exp = getExporter(f.widget);
      if (exp) { out.push(exp(v, project)); continue; }
    }
    out.push(`**${f.label}:** ${renderScalar(f, v, project)}`);
  }
  return out.join('\n\n');
}

function renderList(sec: SectionConfig, items: Array<Record<string, unknown>>, project: Project): string {
  if (!items.length) return '_(none)_';
  const out: string[] = [];
  for (const item of items) {
    const title = (item.name ?? item.term ?? item.question ?? '(unnamed)') as string;
    const category = item.category as string | undefined;
    out.push(`### ${title}${category ? ` _(${category})_` : ''}`);
    for (const f of sec.fields) {
      if (f.key === 'name' || f.key === 'category' || f.key === 'term' || f.key === 'question') continue;
      const v = item[f.key];
      if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
      if (f.type === 'custom' && f.widget) {
        const exp = getExporter(f.widget);
        if (exp) { out.push(`**${f.label}:**\n\n${exp(v, project)}`); continue; }
      }
      out.push(`- **${f.label}:** ${renderScalar(f, v, project)}`);
    }
    out.push('');
  }
  return out.join('\n');
}

function renderScalar(field: FieldConfig, value: unknown, project: Project): string {
  if (field.type === 'ref') {
    const ids = (Array.isArray(value) ? value as string[] : value ? [value as string] : []);
    if (!field.refSection) return ids.join(', ');
    const refList = (project.sections[field.refSection] as Array<Record<string, unknown>> | undefined) ?? [];
    return ids.map((id) => (refList.find((it) => it.id === id)?.name as string | undefined) ?? id).join(', ');
  }
  if (field.type === 'enum-chips') {
    return Array.isArray(value) ? (value as string[]).join(', ') : String(value);
  }
  if (field.type === 'list') {
    const arr = Array.isArray(value) ? value as Array<Record<string, unknown>> : [];
    if (!arr.length) return '_(none)_';
    return '\n' + arr.map((it) => {
      const lines: string[] = [];
      lines.push(`  - ${(it.name ?? it.kind ?? '(item)') as string}`);
      for (const sub of field.itemFields ?? []) {
        if (sub.key === 'name' || sub.key === 'kind') continue;
        const sv = it[sub.key];
        if (sv) lines.push(`    - **${sub.label}:** ${sv as string}`);
      }
      return lines.join('\n');
    }).join('\n');
  }
  return String(value);
}
