import {describe, it, expect} from 'vitest';
import {isEmoji} from '../../src/utils/isEmoji';

describe('isEmoji', () => {
  it('detects common emoji code points', () => {
    expect(isEmoji('😊'.codePointAt(0))).toBe(true);
    expect(isEmoji('A'.codePointAt(0))).toBe(false);
  });
});
