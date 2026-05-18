import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApi } from './api';

const ok = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('api client', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('lists projects', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => ok([{ id: 'a', name: 'A', updatedAt: '', counts: {} }]));
    const api = createApi();
    const result = await api.list();
    expect(fetchSpy).toHaveBeenCalledWith('/api/projects');
    expect(result).toHaveLength(1);
  });

  it('throws ApiError on 4xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => ok({ error: 'bad' }, 400));
    const api = createApi();
    await expect(api.create('x')).rejects.toThrow(/bad/);
  });

  it('puts a project body', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      expect(init?.method).toBe('PUT');
      return ok({ id: 'x', meta: { name: 'X' }, sections: {} });
    });
    const api = createApi();
    await api.save({ id: 'x', meta: { name: 'X', createdAt: '', updatedAt: '', schemaVersion: 1 }, sections: {} });
    expect(spy).toHaveBeenCalled();
  });
});
