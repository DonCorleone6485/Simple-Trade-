import { describe, it, expect, vi } from 'vitest';

const inserts: any[] = [];
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ gte: async () => ({ count: 0 }) }) }) }),
      insert: async (row: any) => { inserts.push(row); return {}; },
    }),
  }),
}));

import { withErrorLog } from '../api/_log';

function fakeRes() {
  const res: any = { statusCode: 200, headersSent: false, body: undefined };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: any) => { res.body = b; res.headersSent = true; return res; };
  return res;
}

describe('withErrorLog', () => {
  it('passes a healthy response through untouched and logs nothing', async () => {
    inserts.length = 0;
    const res = fakeRes();
    await withErrorLog('ok', (_q, r) => r.status(200).json({ ok: 1 }))({ url: '/api/ok', headers: {} }, res);
    expect(res.body).toEqual({ ok: 1 });
    expect(inserts).toHaveLength(0);
  });

  it('does not log a 4xx answer', async () => {
    inserts.length = 0;
    const res = fakeRes();
    await withErrorLog('bad', (_q, r) => r.status(400).json({ error: 'bad input' }))({ url: '/api/bad', headers: {} }, res);
    expect(res.statusCode).toBe(400);
    expect(inserts).toHaveLength(0);
  });

  it('turns a thrown error into a 500 and records it as kind server', async () => {
    inserts.length = 0;
    const res = fakeRes();
    await withErrorLog('boom', () => { throw new Error('db exploded'); })({ url: '/api/boom?x=1', headers: { 'user-agent': 'test' } }, res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal error' });
    expect(inserts[0]).toMatchObject({ kind: 'server', message: '[boom] db exploded', url: '/api/boom' });
  });

  it('records a 5xx answer with the error text from the body', async () => {
    inserts.length = 0;
    const res = fakeRes();
    await withErrorLog('five', (_q, r) => r.status(503).json({ error: 'CLERK_SECRET_KEY is not set' }))({ url: '/api/five', headers: {} }, res);
    expect(res.statusCode).toBe(503);
    expect(inserts[0].message).toBe('[five] HTTP 503: CLERK_SECRET_KEY is not set');
  });
});
