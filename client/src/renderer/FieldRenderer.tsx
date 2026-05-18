import { CSSProperties } from 'react';
import type { FieldConfig, Project } from '@/schema/types';
import { useTheme } from '@/theme/useTheme';
import { AutoField } from './AutoField';
import { styles } from './styles';
import { getWidget } from './widgets';

export type FieldRendererProps = {
  field: FieldConfig;
  value: unknown;
  onChange: (v: unknown) => void;
  project: Project | null;
};

export function FieldRenderer(props: FieldRendererProps) {
  const { field, value, onChange, project } = props;
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);

  const label = (
    <label style={s.lbl} htmlFor={`f-${field.key}`}>
      {field.label}
      {field.optional && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> (optional)</span>}
    </label>
  );
  const hint = field.hint ? <span style={s.hint}>{field.hint}</span> : null;

  switch (field.type) {
    case 'text':
      return (
        <div style={{ marginBottom: 12 }}>
          {label}
          <AutoField baseStyle={s.fb} value={String(value ?? '')} onChange={onChange as (v: string) => void} placeholder={field.placeholder} single ariaLabel={field.label} />
          {hint}
        </div>
      );

    case 'textarea':
      return (
        <div style={{ marginBottom: 12 }}>
          {label}
          <AutoField baseStyle={s.fb} value={String(value ?? '')} onChange={onChange as (v: string) => void} placeholder={field.placeholder} ariaLabel={field.label} />
          {hint}
        </div>
      );

    case 'select':
      return (
        <div style={{ marginBottom: 12 }}>
          {label}
          <select id={`f-${field.key}`} aria-label={field.label} style={{ ...s.fb, cursor: 'pointer' }} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select…</option>
            {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {hint}
        </div>
      );

    case 'enum-chips': {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (o: string) => onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]);
      return (
        <div style={{ marginBottom: 12 }} role="group" aria-label={field.label}>
          {label}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(field.options ?? []).map((o) => {
              const on = arr.includes(o);
              return (
                <button key={o} type="button" onClick={() => toggle(o)} aria-pressed={on} style={{
                  padding: '5px 11px', borderRadius: 16, fontSize: 12,
                  background: on ? C.accentDim : 'transparent',
                  border: `1px solid ${on ? C.accent : C.border}`,
                  color: on ? C.text : C.muted, cursor: 'pointer',
                }}>{o}</button>
              );
            })}
          </div>
          {hint}
        </div>
      );
    }

    case 'ref': {
      const items = pickRefItems(project, field.refSection);
      const arr = Array.isArray(value) ? (value as string[]) : value ? [value as string] : [];
      const labelFor = (id: string) => items.find((it) => it.id === id)?.name ?? id;
      const toggle = (id: string) => {
        const next = arr.includes(id) ? arr.filter((x) => x !== id) : field.refMulti ? [...arr, id] : [id];
        onChange(field.refMulti ? next : next[0] ?? '');
      };
      return (
        <div style={{ marginBottom: 12 }}>
          {label}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {items.length === 0 && <span style={s.hint}>No items in “{field.refSection}” yet.</span>}
            {items.map((it) => {
              const on = arr.includes(it.id);
              return (
                <button key={it.id} type="button" aria-pressed={on} onClick={() => toggle(it.id)} style={{
                  padding: '5px 11px', borderRadius: 16, fontSize: 12,
                  background: on ? C.accentDim : 'transparent',
                  border: `1px solid ${on ? C.accent : C.border}`,
                  color: on ? C.text : C.muted, cursor: 'pointer',
                }}>{labelFor(it.id)}</button>
              );
            })}
          </div>
          {hint}
        </div>
      );
    }

    case 'list':
    case 'custom': {
      const Widget = field.type === 'custom' ? getWidget(field.widget) : null;
      if (Widget) return <Widget {...props} />;
      return <ListField {...props} />;
    }
  }
}

function pickRefItems(project: Project | null, sectionId?: string): Array<{ id: string; name: string }> {
  if (!project || !sectionId) return [];
  const section = (project.sections as Record<string, unknown>)[sectionId];
  if (!Array.isArray(section)) return [];
  return (section as Array<Record<string, unknown>>).map((it) => ({
    id: String(it.id ?? ''),
    name: String(it.name ?? it.term ?? it.question ?? '(unnamed)'),
  }));
}

function ListField({ field, value, onChange, project }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const items = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  const itemFields = field.itemFields ?? [];

  const update = (idx: number, key: string, v: unknown) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, [key]: v } : it)));
  const add = () => {
    const blank: Record<string, unknown> = { id: crypto.randomUUID().slice(0, 8) };
    for (const f of itemFields) blank[f.key] = f.type === 'list' || f.type === 'enum-chips' ? [] : '';
    onChange([...items, blank]);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      {items.map((item, idx) => (
        <div key={String(item.id ?? idx)} style={s.card}>
          <div style={s.ch}>
            <div style={s.ct}>{String(item.name ?? '') || `Item ${idx + 1}`}</div>
            <button style={s.btnRm} onClick={() => remove(idx)} aria-label={`Remove item ${idx + 1}`}>Remove</button>
          </div>
          {itemFields.map((f) => (
            <FieldRenderer key={f.key} field={f} value={(item as any)[f.key]} onChange={(v) => update(idx, f.key, v)} project={project} />
          ))}
        </div>
      ))}
      <button style={s.btnAdd} onClick={add}>+ Add</button>
    </div>
  );
}
