import { promises as fs, mkdirSync, existsSync, readdirSync, statSync, copyFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BACKUP_KEEP = 10;

export async function atomicWriteJson(target: string, body: unknown): Promise<void> {
  const dir = path.dirname(target);
  const tmpDir = path.join(dir, '.tmp');
  const backupDir = path.join(dir, '.backup');
  mkdirSync(tmpDir, { recursive: true });
  mkdirSync(backupDir, { recursive: true });

  const base = path.basename(target, '.json');
  if (existsSync(target)) {
    const backupName = `${base}-${Date.now()}.json`;
    copyFileSync(target, path.join(backupDir, backupName));
    rotateBackups(dir, base);
  }

  const tmpFile = path.join(tmpDir, `${base}-${crypto.randomBytes(6).toString('hex')}.json`);
  await fs.writeFile(tmpFile, JSON.stringify(body, null, 2), 'utf8');
  await fs.rename(tmpFile, target);
}

export function listBackups(rootDir: string, base: string): string[] {
  const backupDir = path.join(rootDir, '.backup');
  if (!existsSync(backupDir)) return [];
  return readdirSync(backupDir)
    .filter((f) => f.startsWith(`${base}-`) && f.endsWith('.json'))
    .map((f) => path.join(backupDir, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
}

function rotateBackups(rootDir: string, base: string): void {
  const backups = listBackups(rootDir, base);
  for (const old of backups.slice(BACKUP_KEEP)) unlinkSync(old);
}
