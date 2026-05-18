import type { ProjectSummary } from '@/schema/types';
import { useTheme } from '@/theme/useTheme';
import { useBreakpoint } from './useBreakpoint';
import type { SyncStatus } from '@/storage/useProjectSync';

export function TopBar({
  projects, currentId, status, dark, onToggleTheme, onOpenSwitcher, onOpenSectionsDrawer, onOpenMenu, onOpenExport,
}: {
  projects: ProjectSummary[];
  currentId: string | null;
  status: SyncStatus;
  dark: boolean;
  onToggleTheme: () => void;
  onOpenSwitcher: () => void;
  onOpenSectionsDrawer: () => void;
  onOpenMenu: () => void;
  onOpenExport: () => void;
}) {
  const { tokens: C } = useTheme();
  const mobile = useBreakpoint();
  const current = projects.find((p) => p.id === currentId);
  const dotColor = status === 'saving' ? '#fbbf24' : status === 'error' ? C.red : status === 'saved' ? C.green : C.muted;

  return (
    <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 10 }}>
      {mobile && (
        <button type="button" aria-label="Open sections menu" onClick={onOpenSectionsDrawer} style={{ background: 'none', border: 'none', color: C.text, fontSize: 18, cursor: 'pointer' }}>☰</button>
      )}
      {!mobile && <strong style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>◈ Appwork</strong>}
      <button type="button" onClick={onOpenSwitcher} aria-label="Switch project" style={{
        background: C.card, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: 6,
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: C.text,
        flex: mobile ? 1 : undefined, justifyContent: mobile ? 'center' : undefined,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{current?.name ?? 'No project'}</span>
        <span style={{ fontSize: 9, color: C.muted }}>▾</span>
        <span aria-label={`Save status: ${status}`} style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, marginLeft: 4 }} />
      </button>
      {!mobile && status === 'saved' && <span style={{ fontSize: 11, color: C.green }}>Saved</span>}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={onToggleTheme} aria-label="Toggle theme" style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: '6px 10px', cursor: 'pointer', lineHeight: 1 }}>{dark ? '☀️' : '🌙'}</button>
        <button type="button" onClick={onOpenExport} style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Export ↗</button>
        <button type="button" onClick={onOpenMenu} aria-label="Project menu" style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: '6px 10px', cursor: 'pointer' }}>⋯</button>
      </div>
    </header>
  );
}
