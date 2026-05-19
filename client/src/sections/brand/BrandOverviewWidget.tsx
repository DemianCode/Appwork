import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useNavigation } from '@/shell/NavigationContext';
import { useTheme } from '@/theme/useTheme';
import { useBreakpoint } from '@/shell/useBreakpoint';

type ColourRecord = { id: string; name: string; description: string; hex: string };

export function BrandOverviewWidget({ project }: FieldRendererProps) {
  const { setSection } = useNavigation();
  const { tokens: C } = useTheme();
  const mobile = useBreakpoint();
  const sections = (project?.sections ?? {}) as Record<string, unknown>;
  const tone = (sections.brandTone ?? {}) as { words?: string[] };
  const colour = (sections.brandColour ?? {}) as { direction?: string; colours?: ColourRecord[] };
  const refs = (sections.brandReferences ?? {}) as { notes?: string; items?: Array<unknown> };

  const words = Array.isArray(tone.words) ? tone.words : [];
  const colours = Array.isArray(colour.colours) ? colour.colours : [];
  const refItems = Array.isArray(refs.items) ? refs.items : [];
  const refsNotes = typeof refs.notes === 'string' ? refs.notes : '';

  const cardStyle: React.CSSProperties = {
    textAlign: 'left', background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: 16, cursor: 'pointer', color: C.text,
    fontFamily: 'inherit', display: 'flex', flexDirection: 'column', gap: 10,
  };
  const titleStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600 };
  const emptyStyle: React.CSSProperties = { fontSize: 12, color: C.muted, lineHeight: 1.6 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
      <button type="button" onClick={() => setSection('brandTone')} style={cardStyle}>
        <div style={titleStyle}>Tone</div>
        {words.length === 0 ? (
          <div style={emptyStyle}>No tone words yet.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {words.slice(0, 8).map((w) => (
              <span key={w} style={{
                padding: '2px 8px', fontSize: 11, borderRadius: 12,
                background: C.accentDim, color: C.text, border: `1px solid ${C.accent}`,
              }}>{w}</span>
            ))}
            {words.length > 8 && <span style={emptyStyle}>+{words.length - 8} more</span>}
          </div>
        )}
      </button>

      <button type="button" onClick={() => setSection('brandColour')} style={cardStyle}>
        <div style={titleStyle}>Colour direction</div>
        {colours.length === 0 ? (
          <div style={emptyStyle}>No colours yet.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {colours.slice(0, 8).map((c) => (
                <span key={c.id} aria-label={c.name || c.hex} style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: c.hex || 'transparent',
                  border: `1px solid ${C.border}`,
                }} />
              ))}
            </div>
            {colour.direction && <div style={{ ...emptyStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{colour.direction}</div>}
          </>
        )}
      </button>

      <button type="button" onClick={() => setSection('brandReferences')} style={cardStyle}>
        <div style={titleStyle}>References</div>
        {refItems.length === 0 && !refsNotes ? (
          <div style={emptyStyle}>No references yet.</div>
        ) : (
          <>
            <div style={emptyStyle}>{refItems.length} reference{refItems.length === 1 ? '' : 's'}</div>
            {refsNotes && (
              <div style={{ ...emptyStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {refsNotes.split('\n')[0]}
              </div>
            )}
          </>
        )}
      </button>
    </div>
  );
}
