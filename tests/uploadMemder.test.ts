import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock('node-fetch', () => ({ default: vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) })) }));
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return { ...actual, createReadStream: vi.fn(() => ({})), existsSync: actual.existsSync };
});

import {uploadFile} from '../src/uploadMemder';
import {config} from '../src/config';

describe('uploadMemder', () => {
  it('returns success when upload ok', async () => {
    (config as any).memderHost = 'https://memder.example';
    const res = await uploadFile('src', 1, 2, 'file.jpg');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: 1 });
  });
  it('returns error when no host', async () => {
    (config as any).memderHost = undefined;
    const res = await uploadFile('src', 1, 2, 'file.jpg');
    expect(res.success).toBe(false);
  });
});
