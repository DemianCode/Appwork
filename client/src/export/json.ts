import type { Project } from '@/schema/types';

export function toJsonExport(project: Project): string {
  return JSON.stringify({
    generator: 'appwork',
    exportedAt: new Date().toISOString(),
    schemaVersion: project.meta.schemaVersion,
    project,
  }, null, 2);
}
