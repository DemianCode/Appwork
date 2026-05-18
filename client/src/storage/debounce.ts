export function debounce<T extends (...args: any[]) => unknown>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  const wrapped = (...args: Parameters<T>) => {
    lastArgs = args;
    if (t) clearTimeout(t);
    t = setTimeout(() => { if (lastArgs) fn(...lastArgs); t = null; lastArgs = null; }, ms);
  };
  wrapped.flush = () => { if (t) { clearTimeout(t); if (lastArgs) fn(...lastArgs); t = null; lastArgs = null; } };
  return wrapped as T & { flush: () => void };
}
