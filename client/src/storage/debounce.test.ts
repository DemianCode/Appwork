import { describe, it, expect, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  it('delays calls and uses latest args', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const d = debounce(spy, 100);
    d('a'); d('b'); d('c');
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(110);
    expect(spy).toHaveBeenCalledWith('c');
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
