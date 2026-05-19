import { promises as fs, existsSync, readdirSync, statSync, mkdirSync, copyFileSync, unlinkSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { atomicWriteJson } from './fs-atomic.js';
import { CURRENT_SCHEMA_VERSION, Project, ProjectSummary } from './types.js';

export type ProjectsRepo = {
  list: () => Promise<ProjectSummary[]>;
  get: (id: string) => Promise<Project>;
  create: (name: string) => Promise<Project>;
  update: (id: string, body: Project) => Promise<Project>;
  rename: (id: string, name: string) => Promise<Project>;
  duplicate: (id: string) => Promise<Project>;
  remove: (id: string) => Promise<void>;
  restore: (id: string) => Promise<Project>;
  importProject: (body: unknown) => Promise<Project>;
};

export function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 64) || 'untitled';
}

function emptySections(): Record<string, unknown> {
  return {};
}

function countsOf(project: Project): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(project.sections ?? {})) {
    if (Array.isArray(v)) out[k] = v.length;
  }
  return out;
}

export function createRepo(root: string): ProjectsRepo {
  mkdirSync(root, { recursive: true });
  const fileFor = (id: string) => path.join(root, `${id}.json`);

  async function readFile(id: string): Promise<Project> {
    const f = fileFor(id);
    if (!existsSync(f)) throw new Error(`project ${id} not found`);
    return JSON.parse(await fs.readFile(f, 'utf8')) as Project;
  }

  async function writeFile(p: Project): Promise<Project> {
    p.meta.updatedAt = new Date().toISOString();
    await atomicWriteJson(fileFor(p.id), p);
    return p;
  }

  return {
    async list() {
      const files = readdirSync(root).filter((f) => f.endsWith('.json') && !f.startsWith('.'));
      const out: ProjectSummary[] = [];
      for (const f of files) {
        const p = JSON.parse(readFileSync(path.join(root, f), 'utf8')) as Project;
        out.push({ id: p.id, name: p.meta.name, updatedAt: p.meta.updatedAt, counts: countsOf(p) });
      }
      out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return out;
    },

    get: readFile,

    async create(name) {
      const id = slugify(name);
      if (existsSync(fileFor(id))) throw new Error(`project '${id}' already exists`);
      const now = new Date().toISOString();
      const p: Project = {
        id,
        meta: { name, createdAt: now, updatedAt: now, schemaVersion: CURRENT_SCHEMA_VERSION },
        sections: emptySections(),
      };
      return writeFile(p);
    },

    async update(id, body) {
      if (body.id !== id) throw new Error('id mismatch');
      return writeFile(body);
    },

    async rename(id, name) {
      const existing = await readFile(id);
      const newId = slugify(name);
      if (newId !== id && existsSync(fileFor(newId))) throw new Error(`slug '${newId}' already exists`);
      existing.meta.name = name;
      if (newId !== id) {
        existing.id = newId;
        await writeFile(existing);
        unlinkSync(fileFor(id));
      } else {
        await writeFile(existing);
      }
      return existing;
    },

    async duplicate(id) {
      const orig = await readFile(id);
      let newId = `${id}-copy`;
      let n = 2;
      while (existsSync(fileFor(newId))) { newId = `${id}-copy-${n++}`; }
      const now = new Date().toISOString();
      const copy: Project = {
        ...orig,
        id: newId,
        meta: { ...orig.meta, name: `${orig.meta.name} (copy)`, createdAt: now, updatedAt: now },
      };
      return writeFile(copy);
    },

    async remove(id) {
      const src = fileFor(id);
      if (!existsSync(src)) throw new Error(`project ${id} not found`);
      mkdirSync(path.join(root, '.trash'), { recursive: true });
      const dest = path.join(root, '.trash', `${id}-${Date.now()}.json`);
      copyFileSync(src, dest);
      unlinkSync(src);
    },

    async restore(id) {
      const trashDir = path.join(root, '.trash');
      if (!existsSync(trashDir)) throw new Error('no trash');
      const candidates = readdirSync(trashDir)
        .filter((f) => f.startsWith(`${id}-`) && f.endsWith('.json'))
        .sort((a, b) => statSync(path.join(trashDir, b)).mtimeMs - statSync(path.join(trashDir, a)).mtimeMs);
      const newest = candidates[0];
      if (!newest) throw new Error(`no trashed copy of ${id}`);
      const body = JSON.parse(readFileSync(path.join(trashDir, newest), 'utf8')) as Project;
      if (existsSync(fileFor(id))) throw new Error(`cannot restore — '${id}' already exists`);
      await writeFile(body);
      unlinkSync(path.join(trashDir, newest));
      return body;
    },

    async importProject(body) {
      const p = body as Project;
      if (!p?.meta?.name) throw new Error('invalid project: missing meta.name');
      let id = slugify(p.meta.name);
      let n = 2;
      while (existsSync(fileFor(id))) { id = `${slugify(p.meta.name)}-${n++}`; }
      const now = new Date().toISOString();
      const copy: Project = {
        ...p,
        id,
        meta: { ...p.meta, createdAt: p.meta.createdAt ?? now, updatedAt: now, schemaVersion: p.meta.schemaVersion ?? CURRENT_SCHEMA_VERSION },
      };
      return writeFile(copy);
    },
  };
}
