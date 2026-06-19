const ERROR_COPY = {
  AI_DISABLED: 'AI assistant is temporarily disabled.',
  TOOL_DISABLED: 'This AI capability is temporarily disabled.',
  RATE_LIMITED: 'Too many AI requests. Please wait a moment before trying again.',
  BUDGET_LIMITED: 'AI assistant is paused because the operating budget limit was reached.',
  AI_UNAVAILABLE: 'AI assistant is temporarily unavailable.',
  AI_TIMEOUT: 'AI assistant took too long to respond. Please try again.',
  AI_AUTH_ERROR: 'AI assistant is not configured correctly.',
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
