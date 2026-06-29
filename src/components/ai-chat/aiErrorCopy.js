const ERROR_COPY = {
  AI_DISABLED: 'Trợ lý AI đang tạm thời bị tắt.',
  TOOL_DISABLED: 'Tính năng AI này hiện đang tạm dừng.',
  RATE_LIMITED: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
  AI_RATE_LIMITED: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
  AI_PROVIDER_RATE_LIMITED: 'Nhà cung cấp AI đang quá tải hoặc hết hạn mức tạm thời. Vui lòng thử lại sau.',
  BUDGET_LIMITED: 'Trợ lý AI đang tạm dừng do vượt ngân sách vận hành.',
  AI_UNAVAILABLE: 'Trợ lý AI đang tạm thời không khả dụng. Vui lòng thử lại sau.',
  AI_TIMEOUT: 'Trợ lý phản hồi quá lâu. Vui lòng thử lại.',
  AI_AUTH_ERROR: 'Cấu hình Trợ lý BookEat chưa hợp lệ.',
};

const AUDIENCE_PREFIX = {
  customer: 'BookEat',
  owner: 'Owner AI',
  admin: 'Admin AI',
};

export const getAIWidgetErrorMessage = (error, audience = 'customer') => {
  const code = error?.code || error?.errorCode;
  const base = ERROR_COPY[code];
  if (base) {
    const prefix = AUDIENCE_PREFIX[audience] || 'AI';
    return `${prefix}: ${base}`;
  }
  return error?.message || 'AI response was interrupted. Please try again.';
};

export const isNonRetryableAIError = (error) => (
  ['AI_DISABLED', 'TOOL_DISABLED', 'BUDGET_LIMITED', 'AI_AUTH_ERROR'].includes(error?.code || error?.errorCode)
  || error?.retryable === false
);
