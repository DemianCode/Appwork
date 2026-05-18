import type { Project, ProjectSummary } from '@/schema/types';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function unpack<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = res.statusText;
    try { const body = await res.json(); if (body?.error) msg = body.error; } catch {}
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export function createApi() {
  return {
    list: () => fetch('/api/projects').then(unpack<ProjectSummary[]>),
    get: (id: string) => fetch(`/api/projects/${id}`).then(unpack<Project>),
    create: (name: string) =>
      fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) })
        .then(unpack<Project>),
    save: (p: Project) =>
      fetch(`/api/projects/${p.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(p) })
        .then(unpack<Project>),
    rename: (id: string, name: string) =>
      fetch(`/api/projects/${id}/rename`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) })
        .then(unpack<Project>),
    duplicate: (id: string) =>
      fetch(`/api/projects/${id}/duplicate`, { method: 'POST' }).then(unpack<Project>),
    remove: (id: string) =>
      fetch(`/api/projects/${id}`, { method: 'DELETE' }).then(unpack<void>),
    restore: (id: string) =>
      fetch(`/api/projects/${id}/restore`, { method: 'POST' }).then(unpack<Project>),
    importProject: (body: unknown) =>
      fetch('/api/projects/import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        .then(unpack<Project>),
  };
}

export type Api = ReturnType<typeof createApi>;
