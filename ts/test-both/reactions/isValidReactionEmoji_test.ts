// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';

import { isValidReactionEmoji } from '../../reactions/isValidReactionEmoji';

describe('isValidReactionEmoji', () => {
  it('returns false for non-strings', () => {
    assert.isFalse(isValidReactionEmoji(undefined));
    assert.isFalse(isValidReactionEmoji(null));
    assert.isFalse(isValidReactionEmoji(1));
  });

  it("returns false for strings that aren't a single emoji", () => {
    assert.isFalse(isValidReactionEmoji(''));

    assert.isFalse(isValidReactionEmoji('a'));
    assert.isFalse(isValidReactionEmoji('abc'));

    assert.isFalse(isValidReactionEmoji('π©π©'));

    assert.isFalse(isValidReactionEmoji('πΈ'));
    assert.isFalse(isValidReactionEmoji('β'));
  });

  it('returns true for strings that are exactly 1 emoji', () => {
    assert.isTrue(isValidReactionEmoji('πΊπΈ'));
    assert.isTrue(isValidReactionEmoji('π'));
    assert.isTrue(isValidReactionEmoji('ππΎ'));
    assert.isTrue(isValidReactionEmoji('π©ββ€οΈβπ©'));
  });
});
