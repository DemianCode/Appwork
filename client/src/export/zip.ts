import JSZip from 'jszip';
import type { Project } from '@/schema/types';
import { toMarkdown } from './markdown';
import { toJsonExport } from './json';

export async function toZipBlob(project: Project): Promise<Blob> {
  const z = new JSZip();
  z.file('brief.md', toMarkdown(project));
  z.file('project.json', toJsonExport(project));
  return z.generateAsync({ type: 'blob' });
}
