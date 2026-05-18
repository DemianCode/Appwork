import { useEffect, useState, useCallback } from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import { useTheme } from './theme/useTheme';
import { useBreakpoint } from './shell/useBreakpoint';
import { TopBar } from './shell/TopBar';
import { ProjectSwitcher } from './shell/ProjectSwitcher';
import { SectionsNav } from './shell/SectionsNav';
import { Sheet } from './shell/Sheet';
import { SectionRenderer } from './renderer/SectionRenderer';
import { createApi } from './storage/api';
import { useProjectSync } from './storage/useProjectSync';
import { ExportModal } from './shell/ExportModal';
import { readLegacyLocalStorage, migrateLegacy } from './storage/migrations';
import { SECTIONS, SECTION_MAP } from './schema/sections';
import type { ProjectSummary } from './schema/types';
import './sections/register';

const api = createApi();

function EmptyState({ onCreate }: { onCreate: (name: string) => Promise<void> }) {
  const { tokens: C } = useTheme();
  const [name, setName] = useState('');
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, maxWidth: 360, width: '100%' }}>
        <h1 style={{ fontSize: 18, marginBottom: 6 }}>Create your first project</h1>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>Pick a name. You can rename it later.</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HouseMatch" onKeyDown={(e) => e.key === 'Enter' && name.trim() && onCreate(name.trim())} style={{ width: '100%', padding: 10, borderRadius: 6, background: C.surface, color: C.text, border: `1px solid ${C.border}`, marginBottom: 10 }} aria-label="Project name" />
        <button type="button" onClick={() => name.trim() && onCreate(name.trim())} disabled={!name.trim()} style={{ width: '100%', padding: 10, borderRadius: 6, background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Create</button>
      </div>
    </div>
  );
}

function ProjectMenu({ open, onClose, currentId, onChanged, onDeleted }: {
  open: boolean; onClose: () => void; currentId: string | null;
  onChanged: () => Promise<void>; onDeleted: () => Promise<void>;
}) {
  const { tokens: C } = useTheme();
  if (!currentId) return null;
  const run = async (fn: () => Promise<void>) => {
    try { await fn(); onClose(); }
    catch (e) { alert(e instanceof Error ? e.message : String(e)); }
  };
  const btn = { padding: 10, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: 'pointer', textAlign: 'left' as const };
  return (
    <Sheet open={open} onClose={onClose} title="Project">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button type="button" style={btn} onClick={() => run(async () => {
          const name = prompt('New name'); if (!name) return;
          await api.rename(currentId, name); await onChanged();
        })}>Rename</button>
        <button type="button" style={btn} onClick={() => run(async () => { await api.duplicate(currentId); await onChanged(); })}>Duplicate</button>
        <button type="button" style={{ ...btn, color: C.red }} onClick={() => run(async () => {
          if (!confirm('Move to trash?')) return;
          await api.remove(currentId); await onDeleted();
        })}>Delete (to trash)</button>
      </div>
    </Sheet>
  );
}

function Shell() {
  const { tokens: C, dark, toggle } = useTheme();
  const mobile = useBreakpoint();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [section, setSection] = useState<string>('overview');
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const sync = useProjectSync(api, currentId);

  const refresh = useCallback(async () => {
    const list = await api.list();
    setProjects(list);
    setCurrentId((prev) => prev ?? list[0]?.id ?? null);
    setBootstrapped(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const [legacyOffered, setLegacyOffered] = useState(false);
  useEffect(() => {
    if (legacyOffered || !bootstrapped || projects.length) return;
    const legacy = readLegacyLocalStorage();
    if (!legacy) return;
    setLegacyOffered(true);
    if (confirm("Found data from the old App Planner. Import it as a new project called 'Untitled (imported from v1)'?")) {
      api.importProject(migrateLegacy(legacy)).then(() => { localStorage.removeItem('ap-data'); refresh(); });
    } else {
      localStorage.removeItem('ap-data');
    }
  }, [bootstrapped, projects.length, legacyOffered, refresh]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === 'n' || e.key === 'k')) { e.preventDefault(); setSwitcherOpen(true); }
      if (meta && e.key === 'e') { e.preventDefault(); setExportOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!bootstrapped) {
    return <div style={{ minHeight: '100vh', background: C.bg, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Loading…</div>;
  }
  if (!projects.length) {
    return <EmptyState onCreate={async (name) => { await api.create(name); await refresh(); }} />;
  }

  const project = sync.project;
  const config = SECTION_MAP[section];
  const sectionValue = project ? (project.sections as Record<string, unknown>)[section] : undefined;
  const counts: Record<string, number> = {};
  if (project) {
    for (const sec of SECTIONS) {
      const v = (project.sections as Record<string, unknown>)[sec.id];
      counts[sec.id] = Array.isArray(v) ? v.length : v ? 1 : 0;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        textarea::placeholder, input::placeholder { color: ${dark ? '#3a3d55' : '#9ea4c0'}; }
        textarea:focus-visible, input:focus-visible, select:focus-visible, button:focus-visible {
          outline: 2px solid ${C.accent}; outline-offset: 2px;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>

      <TopBar
        projects={projects} currentId={currentId} status={sync.status} dark={dark}
        onToggleTheme={toggle}
        onOpenSwitcher={() => setSwitcherOpen(true)}
        onOpenSectionsDrawer={() => setDrawerOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1, flexDirection: mobile ? 'column' : 'row' }}>
        {!mobile && <SectionsNav current={section} counts={counts} onSelect={setSection} open onClose={() => {}} />}
        {mobile && drawerOpen && <SectionsNav current={section} counts={counts} onSelect={setSection} open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
        <main style={{ flex: 1, padding: mobile ? '20px 16px 90px' : '32px 36px', maxWidth: mobile ? '100%' : 820 }}>
          {project && config && (
            <SectionRenderer
              config={config}
              value={sectionValue}
              onChange={(v) => sync.update({ ...project, sections: { ...project.sections, [section]: v } })}
              project={project}
            />
          )}
        </main>
      </div>

      <ProjectSwitcher
        api={api} projects={projects} currentId={currentId}
        onSelect={setCurrentId}
        onCreated={(id) => { setCurrentId(id); refresh(); }}
        onRefresh={refresh}
        open={switcherOpen} onClose={() => setSwitcherOpen(false)}
      />

      <ProjectMenu
        open={menuOpen} onClose={() => setMenuOpen(false)}
        currentId={currentId}
        onChanged={refresh}
        onDeleted={async () => { setCurrentId(null); await refresh(); }}
      />

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} project={project} />
    </div>
  );
}

export function App() {
  return <ThemeProvider><Shell /></ThemeProvider>;
}
