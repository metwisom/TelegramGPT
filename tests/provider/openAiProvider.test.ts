import {describe, it, expect, vi} from 'vitest';

vi.mock('../../src/provider/httpProvider', () => ({
  httpProvider: (host: string) => ({ post: vi.fn((path: string) => {
    if (path === '/chat/completions') return Promise.resolve({ choices: [{ message: { content: ' hello ' } }] });
    if (path === '/images/generations') return Promise.resolve({ data: [{ url: 'http://img' }] });
    return Promise.resolve({});
  }) })
}));

import {openAiProvider} from '../../src/provider/openAiProvider';

describe('openAiProvider', () => {
  it('returns trimmed chat content and image url', async () => {
    const prov = openAiProvider('https://host', 'key');
    const chat = await prov.chat('hi');
    expect(chat).toBe('hello');
    const img = await prov.image('draw');
    expect(img).toBe('http://img');
  });
});
