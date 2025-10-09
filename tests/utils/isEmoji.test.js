"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const isEmoji_1 = require("../../src/utils/isEmoji");
(0, vitest_1.describe)('isEmoji', () => {
    (0, vitest_1.it)('detects common emoji code points', () => {
        (0, vitest_1.expect)((0, isEmoji_1.isEmoji)('😊'.codePointAt(0))).toBe(true);
        (0, vitest_1.expect)((0, isEmoji_1.isEmoji)('A'.codePointAt(0))).toBe(false);
    });
});
//# sourceMappingURL=isEmoji.test.js.map