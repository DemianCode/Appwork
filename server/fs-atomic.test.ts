import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { atomicWriteJson, listBackups } from './fs-atomic';

let dir: string;
beforeEach(() => { dir = mkdtempSync(path.join(tmpdir(), 'fsatomic-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('atomicWriteJson', () => {
  it('writes a new file', async () => {
    const target = path.join(dir, 'foo.json');
    await atomicWriteJson(target, { a: 1 });
    expect(JSON.parse(readFileSync(target, 'utf8'))).toEqual({ a: 1 });
  });

  it('backs up the previous file before overwrite', async () => {
    const target = path.join(dir, 'foo.json');
    await atomicWriteJson(target, { a: 1 });
    await atomicWriteJson(target, { a: 2 });
    const backups = listBackups(dir, 'foo');
    expect(backups.length).toBe(1);
    expect(JSON.parse(readFileSync(backups[0]!, 'utf8'))).toEqual({ a: 1 });
  });

  it('rotates backups, keeping newest 10', async () => {
    const target = path.join(dir, 'foo.json');
    for (let i = 0; i < 12; i++) await atomicWriteJson(target, { i });
    const backups = listBackups(dir, 'foo');
    expect(backups.length).toBe(10);
  });

  it('does not leave .tmp files behind', async () => {
    await atomicWriteJson(path.join(dir, 'foo.json'), { a: 1 });
    const tmpDir = path.join(dir, '.tmp');
    if (existsSync(tmpDir)) expect(readdirSync(tmpDir).length).toBe(0);
  });
});
