import { useEffect, useRef, useState, useCallback } from 'react';
import type { Project } from '@/schema/types';
import { Api } from './api';
import { debounce } from './debounce';
import { bufferClear, bufferPut } from './buffer';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useProjectSync(api: Api, id: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const saveRef = useRef<((p: Project) => void) | null>(null);
  const retryCount = useRef(0);

  useEffect(() => {
    if (!id) { setProject(null); return; }
    setStatus('idle');
    let cancelled = false;
    api.get(id)
      .then((p) => { if (!cancelled) setProject(p); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [api, id]);

  useEffect(() => {
    if (!project) { saveRef.current = null; return; }
    const fn = async (p: Project) => {
      setStatus('saving');
      await bufferPut(p.id, p);
      try {
        await api.save(p);
        await bufferClear(p.id);
        setStatus('saved');
        retryCount.current = 0;
      } catch (e: any) {
        retryCount.current += 1;
        const delay = Math.min(30_000, 1000 * Math.pow(3, retryCount.current - 1));
        setStatus('error');
        setError(e.message);
        setTimeout(() => fn(p), delay);
      }
    };
    saveRef.current = debounce(fn, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, project?.id]);

  const update = useCallback((next: Project) => {
    setProject(next);
    saveRef.current?.(next);
  }, []);

  return { project, status, error, update };
}
