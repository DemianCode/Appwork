import { useState } from 'react';
import type { Project } from '@/schema/types';
import { useTheme } from '@/theme/useTheme';
import { Sheet } from './Sheet';
import { toMarkdown } from '@/export/markdown';
import { toJsonExport } from '@/export/json';
import { toZipBlob } from '@/export/zip';

type Fmt = 'markdown' | 'json' | 'zip';

export function ExportModal({ open, onClose, project }: { open: boolean; onClose: () => void; project: Project | null }) {
  const { tokens: C } = useTheme();
  const [fmt, setFmt] = useState<Fmt>('markdown');
  const [copied, setCopied] = useState(false);
  if (!project) return null;
  const content = fmt === 'json' ? toJsonExport(project) : toMarkdown(project);

  const download = async () => {
    const slug = project.id;
    let blob: Blob, name: string;
    if (fmt === 'zip') { blob = await toZipBlob(project); name = `${slug}-brief.zip`; }
    else { blob = new Blob([content], { type: 'text/plain' }); name = `${slug}-brief.${fmt === 'json' ? 'json' : 'md'}`; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Export brief">
      <div role="radiogroup" aria-label="Format" style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['markdown', 'json', 'zip'] as const).map((f) => (
          <button key={f} type="button" role="radio" aria-checked={fmt === f} onClick={() => setFmt(f)} style={{
            flex: 1, padding: '7px 10px', borderRadius: 6, border: `1px solid ${fmt === f ? C.accent : C.border}`,
            background: fmt === f ? C.accentDim : 'transparent', color: C.text, cursor: 'pointer', fontSize: 12,
          }}>{f === 'zip' ? 'Both (.zip)' : f}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={copy} disabled={fmt === 'zip'} style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: copied ? C.green : C.accent, color: '#fff', cursor: fmt === 'zip' ? 'not-allowed' : 'pointer', opacity: fmt === 'zip' ? 0.5 : 1 }}>{copied ? '✓ Copied' : 'Copy'}</button>
        <button type="button" onClick={download} style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: C.green, color: '#fff', cursor: 'pointer' }}>Download</button>
      </div>
      {fmt !== 'zip' && (
        <pre style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, maxHeight: '40vh', overflow: 'auto', fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{content}</pre>
      )}
    </Sheet>
  );
}
