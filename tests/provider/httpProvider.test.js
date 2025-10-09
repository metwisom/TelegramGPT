"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const httpProvider_1 = require("../../src/provider/httpProvider");
vitest_1.vi.mock('axios', () => {
    const createMock = vitest_1.vi.fn(() => ({ post: vitest_1.vi.fn(() => Promise.resolve({ data: { ok: true, value: 42 } })) }));
    return { default: { create: createMock }, create: createMock };
});
const axios_1 = __importDefault(require("axios"));
(0, vitest_1.describe)('httpProvider', () => {
    (0, vitest_1.it)('merges headers and returns data', async () => {
        const provider = (0, httpProvider_1.httpProvider)('https://api.example.com', { 'X-Default': '1' });
        const res = await provider.post('/test', { a: 1 }, { 'X-Custom': '2' });
        (0, vitest_1.expect)(res).toEqual({ ok: true, value: 42 });
        const client = axios_1.default.create.mock.results[0].value;
        (0, vitest_1.expect)(client.post.mock.calls[0][0]).toBe('/test');
        const sentHeaders = client.post.mock.calls[0][2].headers;
        (0, vitest_1.expect)(sentHeaders['X-Default']).toBe('1');
        (0, vitest_1.expect)(sentHeaders['X-Custom']).toBe('2');
    });
});
//# sourceMappingURL=httpProvider.test.js.map