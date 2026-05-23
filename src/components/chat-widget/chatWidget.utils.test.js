import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterConversations,
  getConversationTitle,
  getTotalUnread,
  sortConversations,
} from './chatWidget.utils.js';

test('getConversationTitle formats titles by role and conversation type', () => {
  assert.equal(
    getConversationTitle({ type: 'ADMIN_RESTAURANT', restaurant: { name: 'Pho Thin' } }, 'admin'),
    'Pho Thin'
  );
  assert.equal(
    getConversationTitle({ type: 'ADMIN_RESTAURANT', restaurant: { name: 'Pho Thin' } }, 'restaurant_owner'),
    'BookEat Admin'
  );
  assert.equal(
    getConversationTitle({ type: 'CUSTOMER_RESTAURANT', customer: { fullName: 'Minh Thu' } }, 'restaurant_owner'),
    'Minh Thu'
  );
});

test('sortConversations orders latest activity first', () => {
  const sorted = sortConversations([
    { id: 'old', lastMessageAt: '2026-05-20T10:00:00.000Z' },
    { id: 'new', updatedAt: '2026-05-21T10:00:00.000Z' },
  ]);

  assert.deepEqual(sorted.map((item) => item.id), ['new', 'old']);
});

test('filterConversations matches title, restaurant, customer, and last message', () => {
  const conversations = [
    {
      id: '1',
      type: 'CUSTOMER_RESTAURANT',
      customer: { fullName: 'Khach #29cafe', email: 'a@example.com' },
      restaurant: { name: 'Nha hang A' },
      lastMessagePreview: 'Can dat ban toi nay',
    },
    {
      id: '2',
      type: 'ADMIN_RESTAURANT',
      restaurant: { name: 'Bistro B' },
      lastMessagePreview: 'Ho so duyet nha hang',
    },
  ];

  assert.deepEqual(filterConversations(conversations, '29cafe', 'restaurant_owner').map((item) => item.id), ['1']);
  assert.deepEqual(filterConversations(conversations, 'duyet', 'admin').map((item) => item.id), ['2']);
});

test('getTotalUnread sums unreadCount safely', () => {
  assert.equal(getTotalUnread([{ unreadCount: 2 }, { unreadCount: 3 }, {}]), 5);
});
