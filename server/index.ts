import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRepo } from './projects';
import { mountRoutes } from './routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '2mb' }));

const projectsDir = process.env.APPWORK_PROJECTS_DIR ?? path.resolve(__dirname, '../../projects');
const repo = createRepo(projectsDir);
mountRoutes(app, repo);

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(dist));
  // Guard SPA fallback so /api/* unmatched routes return JSON 404, not index.html.
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.APPWORK_PORT ?? (process.env.NODE_ENV === 'production' ? 4173 : 5174));
const host = process.env.APPWORK_HOST ?? '127.0.0.1';
app.listen(port, host, () => {
  console.log(`appwork server listening on http://${host}:${port}`);
  console.log(`projects dir: ${projectsDir}`);
});
