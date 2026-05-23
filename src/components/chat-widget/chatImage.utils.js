export const MAX_CHAT_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_CHAT_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export function validateChatImageFile(file) {
  if (!file) return 'Vui long chon anh';
  if (!file.type || !file.type.startsWith('image/')) return 'Chi chap nhan file anh';
  if (!ALLOWED_CHAT_IMAGE_TYPES.includes(file.type)) return 'Dinh dang anh khong duoc ho tro';
  if (file.size > MAX_CHAT_IMAGE_SIZE) return 'Anh upload toi da 5MB';
  return '';
}

export function getMessageType(content, attachments = []) {
  const hasText = Boolean(content?.trim());
  const hasAttachment = attachments.length > 0;
  if (hasText && hasAttachment) return 'MIXED';
  if (hasAttachment) return 'IMAGE';
  return 'TEXT';
}

export function getImageAttachments(message) {
  return (message?.attachments || []).filter((attachment) => attachment?.type === 'image');
}

export function formatFileSize(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
