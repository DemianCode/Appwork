import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRepo } from './projects';

let dir: string;
let repo: ReturnType<typeof createRepo>;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'projects-'));
  repo = createRepo(dir);
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('projects repository', () => {
  it('creates a project with sanitised slug', async () => {
    const p = await repo.create('House Match!');
    expect(p.id).toBe('house-match');
    expect(p.meta.name).toBe('House Match!');
    expect(p.meta.schemaVersion).toBeGreaterThan(0);
    expect(existsSync(path.join(dir, 'house-match.json'))).toBe(true);
  });

  it('lists summaries with counts', async () => {
    const a = await repo.create('A');
    await repo.update(a.id, { ...a, sections: { screens: [{}, {}] } });
    const list = await repo.list();
    expect(list).toHaveLength(1);
    expect(list[0]!.counts.screens).toBe(2);
  });

  it('rejects duplicate slug on create', async () => {
    await repo.create('X');
    await expect(repo.create('X')).rejects.toThrow(/already exists/);
  });

  it('soft-deletes to .trash and restores', async () => {
    const p = await repo.create('Z');
    await repo.remove(p.id);
    expect(existsSync(path.join(dir, 'z.json'))).toBe(false);
    expect(existsSync(path.join(dir, '.trash'))).toBe(true);
    const restored = await repo.restore(p.id);
    expect(restored.id).toBe('z');
    expect(existsSync(path.join(dir, 'z.json'))).toBe(true);
  });

  it('renames to a new slug', async () => {
    const p = await repo.create('Original');
    const renamed = await repo.rename(p.id, 'Brand New');
    expect(renamed.id).toBe('brand-new');
    expect(existsSync(path.join(dir, 'original.json'))).toBe(false);
    expect(existsSync(path.join(dir, 'brand-new.json'))).toBe(true);
  });

  it('duplicates with -copy suffix', async () => {
    const p = await repo.create('Orig');
    const dup = await repo.duplicate(p.id);
    expect(dup.id).toBe('orig-copy');
    expect(dup.meta.name).toBe('Orig (copy)');
  });
});
