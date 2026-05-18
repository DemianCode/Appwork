import type { Express } from 'express';
import type { ProjectsRepo } from './projects';

export function mountRoutes(app: Express, repo: ProjectsRepo): void {
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/projects', async (_req, res, next) => {
    try { res.json(await repo.list()); } catch (e) { next(e); }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try { res.json(await repo.get(req.params.id)); }
    catch { res.status(404).json({ error: 'not found' }); }
  });

  app.post('/api/projects', async (req, res) => {
    const name = (req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'name required' });
    try { res.status(201).json(await repo.create(name)); }
    catch (e: any) {
      if (/already exists/.test(e.message)) return res.status(409).json({ error: e.message });
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try { res.json(await repo.update(req.params.id, req.body)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.post('/api/projects/:id/rename', async (req, res) => {
    const name = (req.body?.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'name required' });
    try { res.json(await repo.rename(req.params.id, name)); }
    catch (e: any) {
      if (/already exists/.test(e.message)) return res.status(409).json({ error: e.message });
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/projects/:id/duplicate', async (req, res) => {
    try { res.status(201).json(await repo.duplicate(req.params.id)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.delete('/api/projects/:id', async (req, res) => {
    try { await repo.remove(req.params.id); res.status(204).end(); }
    catch (e: any) { res.status(404).json({ error: e.message }); }
  });

  app.post('/api/projects/:id/restore', async (req, res) => {
    try { res.json(await repo.restore(req.params.id)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.post('/api/projects/import', async (req, res) => {
    try { res.status(201).json(await repo.importProject(req.body)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
}
