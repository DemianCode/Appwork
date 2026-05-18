import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.APPWORK_PORT ?? (process.env.NODE_ENV === 'production' ? 4173 : 5174));
const host = process.env.APPWORK_HOST ?? '127.0.0.1';
app.listen(port, host, () => {
  console.log(`appwork server listening on http://${host}:${port}`);
});
