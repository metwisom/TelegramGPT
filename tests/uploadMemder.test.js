"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock('node-fetch', () => ({ default: vitest_1.vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) })) }));
vitest_1.vi.mock('fs', async () => {
    const actual = await vitest_1.vi.importActual('fs');
    return { ...actual, createReadStream: vitest_1.vi.fn(() => ({})), existsSync: actual.existsSync };
});
const uploadMemder_1 = require("../src/uploadMemder");
const config_1 = require("../src/config");
(0, vitest_1.describe)('uploadMemder', () => {
    (0, vitest_1.it)('returns success when upload ok', async () => {
        config_1.config.memderHost = 'https://memder.example';
        const res = await (0, uploadMemder_1.uploadFile)('src', 1, 2, 'file.jpg');
        (0, vitest_1.expect)(res.success).toBe(true);
        (0, vitest_1.expect)(res.data).toEqual({ id: 1 });
    });
    (0, vitest_1.it)('returns error when no host', async () => {
        config_1.config.memderHost = undefined;
        const res = await (0, uploadMemder_1.uploadFile)('src', 1, 2, 'file.jpg');
        (0, vitest_1.expect)(res.success).toBe(false);
    });
});
//# sourceMappingURL=uploadMemder.test.js.map