import type { SectionConfig, Project } from '@/schema/types';
import { useTheme } from '@/theme/useTheme';
import { FieldRenderer } from './FieldRenderer';

export function SectionRenderer({
  config, value, onChange, project,
}: {
  config: SectionConfig;
  value: unknown;
  onChange: (v: unknown) => void;
  project: Project | null;
}) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;

  const header = (
    <>
      <h2 style={{ fontSize: mobile ? 17 : 19, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: '-0.3px' }}>
        {config.title}
      </h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: config.details ? 10 : 20, lineHeight: 1.7 }}>{config.intro}</p>
      {config.details && (
        <details style={{ marginBottom: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <summary style={{ cursor: 'pointer', padding: '10px 14px', fontSize: 12, color: C.muted, fontWeight: 600, listStyle: 'none', userSelect: 'none' }}>
            What goes here? ▾
          </summary>
          <div style={{ padding: '4px 14px 14px', fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{config.details}</div>
        </details>
      )}
    </>
  );

  if (config.shape === 'list') {
    return (
      <div>
        {header}
        <FieldRenderer
          field={{ key: config.id, label: config.title, type: 'list', itemFields: config.fields }}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          project={project}
        />
      </div>
    );
  }

  const obj = (value ?? {}) as Record<string, unknown>;
  return (
    <div>
      {header}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: mobile ? 14 : 18 }}>
        {config.fields.map((f) => (
          <FieldRenderer
            key={f.key}
            field={f}
            value={obj[f.key]}
            onChange={(v) => onChange({ ...obj, [f.key]: v })}
            project={project}
          />
        ))}
      </div>
    </div>
  );
}
