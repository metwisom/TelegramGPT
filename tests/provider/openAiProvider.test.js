"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock('../../src/provider/httpProvider', () => ({
    httpProvider: (host) => ({ post: vitest_1.vi.fn((path) => {
            if (path === '/chat/completions')
                return Promise.resolve({ choices: [{ message: { content: ' hello ' } }] });
            if (path === '/images/generations')
                return Promise.resolve({ data: [{ url: 'http://img' }] });
            return Promise.resolve({});
        }) })
}));
const openAiProvider_1 = require("../../src/provider/openAiProvider");
(0, vitest_1.describe)('openAiProvider', () => {
    (0, vitest_1.it)('returns trimmed chat content and image url', async () => {
        const prov = (0, openAiProvider_1.openAiProvider)('https://host', 'key');
        const chat = await prov.chat('hi');
        (0, vitest_1.expect)(chat).toBe('hello');
        const img = await prov.image('draw');
        (0, vitest_1.expect)(img).toBe('http://img');
    });
});
//# sourceMappingURL=openAiProvider.test.js.map