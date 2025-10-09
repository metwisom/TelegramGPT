import {describe, it, expect, vi} from 'vitest';
import {httpProvider} from '../../src/provider/httpProvider';

vi.mock('axios', () => {
  const createMock = vi.fn(() => ({ post: vi.fn(() => Promise.resolve({ data: { ok: true, value: 42 } })) }));
  return { default: { create: createMock }, create: createMock };
});
import axios from 'axios';

describe('httpProvider', () => {
  it('merges headers and returns data', async () => {
    const provider = httpProvider('https://api.example.com', { 'X-Default': '1' });
    const res = await provider.post('/test', { a: 1 }, { 'X-Custom': '2' });
    expect(res).toEqual({ ok: true, value: 42 });
    const client = (axios as any).create.mock.results[0].value;
    expect(client.post.mock.calls[0][0]).toBe('/test');
    const sentHeaders = client.post.mock.calls[0][2].headers;
    expect(sentHeaders['X-Default']).toBe('1');
    expect(sentHeaders['X-Custom']).toBe('2');
  });
});
