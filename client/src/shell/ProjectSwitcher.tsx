import { useState } from 'react';
import type { ProjectSummary } from '@/schema/types';
import type { Api } from '@/storage/api';
import { useTheme } from '@/theme/useTheme';
import { Sheet } from './Sheet';

export function ProjectSwitcher({
  api, projects, currentId, onSelect, onCreated, onRefresh, open, onClose,
}: {
  api: Api;
  projects: ProjectSummary[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onCreated: (id: string) => void;
  onRefresh: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const { tokens: C } = useTheme();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const p = await api.create(name.trim());
      setName(''); setCreating(false);
      onCreated(p.id);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg);
    } finally { setBusy(false); }
  };

  const importJson = async (file: File) => {
    const text = await file.text();
    try {
      const body = JSON.parse(text);
      const p = await api.importProject(body.project ?? body);
      onRefresh();
      onSelect(p.id);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Import failed: ${msg}`);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Projects">
      <div>
        {projects.map((p) => {
          const active = p.id === currentId;
          const summary = Object.entries(p.counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`).join(' · ') || 'empty';
          return (
            <button key={p.id} onClick={() => { onSelect(p.id); onClose(); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 10px', marginBottom: 4, borderRadius: 4, cursor: 'pointer',
              background: active ? C.accentDim : 'transparent',
              borderLeft: active ? `2px solid ${C.accent}` : '2px solid transparent',
              borderTop: 'none', borderRight: 'none', borderBottom: 'none',
              color: C.text,
            }} aria-current={active ? 'true' : undefined}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}{active && <span style={{ float: 'right', color: C.accent }}>✓</span>}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{summary}</div>
            </button>
          );
        })}
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: 'flex', gap: 6 }}>
          {!creating ? (
            <>
              <button type="button" onClick={() => setCreating(true)} style={{ flex: 1, padding: 7, borderRadius: 5, border: `1px dashed ${C.accent}`, background: 'transparent', color: C.accent, fontSize: 12, cursor: 'pointer' }}>+ New</button>
              <label style={{ flex: 1, padding: 7, borderRadius: 5, border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
                ↑ Import
                <input type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
              </label>
            </>
          ) : (
            <>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" onKeyDown={(e) => e.key === 'Enter' && submit()} style={{ flex: 1, padding: 7, borderRadius: 5, border: `1px solid ${C.border}`, background: C.surface, color: C.text }} aria-label="New project name" />
              <button type="button" onClick={submit} disabled={busy} style={{ padding: '7px 12px', borderRadius: 5, border: 'none', background: C.accent, color: '#fff', cursor: 'pointer', fontSize: 12 }}>Create</button>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}
