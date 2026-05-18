import { ReactNode, useEffect } from 'react';
import { useTheme } from '@/theme/useTheme';
import { useBreakpoint } from './useBreakpoint';

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const { tokens: C } = useTheme();
  const mobile = useBreakpoint();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 100, padding: mobile ? 0 : 24,
    }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: mobile ? '12px 12px 0 0' : 12,
        width: '100%', maxWidth: mobile ? '100%' : 480, maxHeight: mobile ? '85vh' : '80vh', overflow: 'auto',
      }}>
        {mobile && <div style={{ width: 32, height: 3, background: C.border, borderRadius: 2, margin: '8px auto 0' }} />}
        <div style={{ padding: 14, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
          <strong style={{ color: C.text, fontSize: 14 }}>{title}</strong>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}
