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

  const intro = (
    <>
      <h2 style={{ fontSize: mobile ? 17 : 19, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: '-0.3px' }}>
        {config.title}
      </h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>{config.intro}</p>
    </>
  );

  if (config.shape === 'list') {
    return (
      <div>
        {intro}
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
      {intro}
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
