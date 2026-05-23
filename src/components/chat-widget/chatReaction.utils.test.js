import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_REACTION_EMOJIS,
  getMyReaction,
  getReactionSummary,
  mergeReactionUpdate,
} from './chatReaction.utils.js';

test('getReactionSummary counts reactions by emoji', () => {
  assert.deepEqual(getReactionSummary([
    { userId: 'u1', emoji: '❤️' },
    { userId: 'u2', emoji: '❤️' },
    { userId: 'u3', emoji: '😂' },
  ]), {
    '❤️': 2,
    '😂': 1,
  });
});

test('getMyReaction returns current user emoji or null', () => {
  const reactions = [
    { userId: 'u1', emoji: '👍' },
    { userId: 'u2', emoji: '😮' },
  ];

  assert.equal(getMyReaction(reactions, 'u2'), '😮');
  assert.equal(getMyReaction(reactions, 'u3'), null);
});

test('mergeReactionUpdate updates only the target message', () => {
  const messages = [
    { id: 'm1', content: 'one', reactions: [] },
    { id: 'm2', content: 'two', reactions: [] },
  ];

  const next = mergeReactionUpdate(messages, {
    messageId: 'm2',
    reactions: [{ userId: 'u1', emoji: '❤️' }],
    reactionSummary: { '❤️': 1 },
  });

  assert.equal(next[0], messages[0]);
  assert.deepEqual(next[1].reactionSummary, { '❤️': 1 });
  assert.deepEqual(next[1].reactions, [{ userId: 'u1', emoji: '❤️' }]);
});

test('ALLOWED_REACTION_EMOJIS preserves default picker order', () => {
  assert.deepEqual(ALLOWED_REACTION_EMOJIS, ['👍', '❤️', '😂', '😮', '😢', '😡']);
});
