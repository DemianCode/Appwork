import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import { createRepo } from './projects';
import { mountRoutes } from './routes';

function makeApp(dir: string) {
  const app = express();
  app.use(express.json());
  mountRoutes(app, createRepo(dir));
  return app;
}

async function req(app: express.Express, method: string, url: string, body?: unknown) {
  const { default: supertest } = await import('supertest');
  const r = supertest(app);
  // @ts-ignore
  const m = r[method.toLowerCase()](url);
  return body ? await m.send(body) : await m;
}

let dir: string;
beforeEach(() => { dir = mkdtempSync(path.join(tmpdir(), 'routes-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('routes', () => {
  it('lists empty initially', async () => {
    const res = await req(makeApp(dir), 'GET', '/api/projects');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates, fetches, updates, deletes', async () => {
    const app = makeApp(dir);
    const created = await req(app, 'POST', '/api/projects', { name: 'Demo' });
    expect(created.status).toBe(201);
    expect(created.body.id).toBe('demo');

    const fetched = await req(app, 'GET', '/api/projects/demo');
    expect(fetched.status).toBe(200);

    const updated = await req(app, 'PUT', '/api/projects/demo', {
      ...fetched.body,
      sections: { screens: [{}, {}] },
    });
    expect(updated.status).toBe(200);
    expect(updated.body.sections.screens).toHaveLength(2);

    const del = await req(app, 'DELETE', '/api/projects/demo');
    expect(del.status).toBe(204);
  });

  it('409 on duplicate create', async () => {
    const app = makeApp(dir);
    await req(app, 'POST', '/api/projects', { name: 'Same' });
    const dup = await req(app, 'POST', '/api/projects', { name: 'Same' });
    expect(dup.status).toBe(409);
  });

  it('404 on missing get', async () => {
    const res = await req(makeApp(dir), 'GET', '/api/projects/nope');
    expect(res.status).toBe(404);
  });
});
