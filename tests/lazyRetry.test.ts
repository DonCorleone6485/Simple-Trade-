import { describe, it, expect } from 'vitest';
import { shouldReload } from '../src/lib/lazyRetry';

const store = (initial: Record<string, string> = {}) => {
  const m = { ...initial };
  return { getItem: (k: string) => m[k] ?? null, setItem: (k: string, v: string) => { m[k] = v; } };
};

describe('shouldReload', () => {
  it('reloads the first time a chunk fails', () => {
    expect(shouldReload(store(), 1_000_000)).toBe(true);
  });
  it('does not reload again within a minute (no reload loop)', () => {
    const s = store();
    expect(shouldReload(s, 1_000_000)).toBe(true);
    expect(shouldReload(s, 1_030_000)).toBe(false);
  });
  it('may reload again after a minute', () => {
    const s = store();
    shouldReload(s, 1_000_000);
    expect(shouldReload(s, 1_061_000)).toBe(true);
  });
  it('never reloads when storage is unavailable', () => {
    expect(shouldReload(null, 1)).toBe(false);
  });
});
