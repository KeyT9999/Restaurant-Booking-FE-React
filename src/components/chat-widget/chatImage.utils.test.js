import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_CHAT_IMAGE_SIZE,
  getImageAttachments,
  getMessageType,
  validateChatImageFile,
} from './chatImage.utils.js';

test('validateChatImageFile accepts common image formats under 5MB', () => {
  assert.equal(validateChatImageFile({
    name: 'dish.png',
    type: 'image/png',
    size: MAX_CHAT_IMAGE_SIZE - 1,
  }), '');
});

test('validateChatImageFile rejects non-image, svg, and oversized files', () => {
  assert.match(validateChatImageFile({ name: 'note.txt', type: 'text/plain', size: 100 }), /Chi chap nhan/i);
  assert.match(validateChatImageFile({ name: 'bad.svg', type: 'image/svg+xml', size: 100 }), /khong duoc ho tro/i);
  assert.match(validateChatImageFile({ name: 'big.jpg', type: 'image/jpeg', size: MAX_CHAT_IMAGE_SIZE + 1 }), /5MB/i);
});

test('getMessageType distinguishes text, image, and mixed payloads', () => {
  assert.equal(getMessageType('hello', []), 'TEXT');
  assert.equal(getMessageType('', [{ type: 'image' }]), 'IMAGE');
  assert.equal(getMessageType('caption', [{ type: 'image' }]), 'MIXED');
});

test('getImageAttachments returns only image attachments', () => {
  assert.deepEqual(getImageAttachments({
    attachments: [{ type: 'image', url: 'a' }, { type: 'file', url: 'b' }],
  }), [{ type: 'image', url: 'a' }]);
});
