import { ThemeTokens } from '@/theme/tokens';

export const styles = (C: ThemeTokens, mobile: boolean) => ({
  fb: {
    width: '100%', backgroundColor: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 6, padding: '8px 10px', color: C.text, fontSize: 14,
    outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', display: 'block',
  },
  card: { backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: mobile ? 14 : 18, marginBottom: 10 },
  lbl: { fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 5, display: 'block' },
  hint: { fontSize: 11, color: C.muted, marginTop: 5, lineHeight: 1.5, display: 'block' },
  g2: { display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 },
  btnAdd: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', backgroundColor: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: 'pointer', width: '100%', fontFamily: 'inherit' },
  btnRm: { padding: '5px 10px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5, color: C.red, fontSize: 12, cursor: 'pointer', flexShrink: 0 },
  ch: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  ct: { fontSize: 14, fontWeight: 600, color: C.text },
});
