import axiosInstance from './axiosInstance';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const DEFAULT_STREAM_TIMEOUT_MS = Number(import.meta.env.VITE_AI_STREAM_TIMEOUT_MS) || 45000;
const IDEMPOTENCY_STORAGE_PREFIX = 'bookeat_ai_confirm:';

export class AIStreamError extends Error {
  constructor(message, { code = 'AI_UNAVAILABLE', status, retryable = true } = {}) {
    super(message);
    this.name = 'AIStreamError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

const parseEventBlock = (block) => {
  let event = 'message';
  const dataLines = [];

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
  }

  if (dataLines.length === 0) return null;

  try {
    return { event, data: JSON.parse(dataLines.join('\n')) };
  } catch {
    throw new AIStreamError('Dữ liệu phản hồi từ trợ lý không hợp lệ.', {
      code: 'AI_STREAM_INVALID',
    });
  }
};

export const createSSEParser = (onEvent) => {
  let buffer = '';

  const flushBlocks = (flushRemainder = false) => {
    const normalized = buffer.replace(/\r\n/g, '\n');
    const blocks = normalized.split('\n\n');
    buffer = flushRemainder ? '' : blocks.pop();

    const completeBlocks = flushRemainder ? blocks.filter(Boolean) : blocks;
    for (const block of completeBlocks) {
      const parsed = parseEventBlock(block);
      if (parsed) onEvent(parsed);
    }

    if (flushRemainder && buffer) {
      const parsed = parseEventBlock(buffer);
      if (parsed) onEvent(parsed);
      buffer = '';
    }
  };

  return {
    feed(chunk) {
      buffer += chunk;
      flushBlocks(false);
    },
    end() {
      if (buffer.trim()) {
        const parsed = parseEventBlock(buffer.replace(/\r\n/g, '\n'));
        if (parsed) onEvent(parsed);
      }
      buffer = '';
    },
  };
};

const readHttpError = async (response) => {
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  throw new AIStreamError(
    payload?.message || 'Không thể kết nối với Trợ lý BookEat.',
    {
      code: payload?.code || 'AI_UNAVAILABLE',
      status: response.status,
      retryable: response.status !== 400 && response.status !== 401 && response.status !== 403,
    },
  );
};

export const getAIHealth = () => axiosInstance.get('/ai/health');

export const sendMockMessage = (message) => (
  axiosInstance.post('/ai/mock-chat', { message })
);

export const getPendingAction = (pendingActionId) => (
  axiosInstance.get(`/ai/pending-actions/${encodeURIComponent(pendingActionId)}`)
);

export const cancelPendingAction = (pendingActionId, reason) => (
  axiosInstance.post(
    `/ai/pending-actions/${encodeURIComponent(pendingActionId)}/cancel`,
    reason ? { reason } : {},
  )
);

const createIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `ai-confirm-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

export const getOrCreateConfirmIdempotencyKey = (pendingActionId) => {
  const storageKey = `${IDEMPOTENCY_STORAGE_PREFIX}${pendingActionId}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const created = createIdempotencyKey();
  sessionStorage.setItem(storageKey, created);
  return created;
};

export const confirmPendingAction = (
  pendingActionId,
  idempotencyKey = getOrCreateConfirmIdempotencyKey(pendingActionId),
) => (
  axiosInstance.post(
    `/ai/pending-actions/${encodeURIComponent(pendingActionId)}/confirm`,
    { confirmation: true },
    {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    },
  )
);

export const streamAIMessage = async ({
  message,
  history = [],
  pageContext,
  ownerContext,
  adminContext,
  signal,
  onEvent = () => {},
  timeoutMs = DEFAULT_STREAM_TIMEOUT_MS,
}) => {
  const requestController = new AbortController();
  let timedOut = false;
  let receivedDone = false;
  let streamError = null;

  const abortFromCaller = () => requestController.abort(signal?.reason);
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    requestController.abort();
  }, timeoutMs);

  try {
    const token = localStorage.getItem('bookeat_token');
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        history,
        ...(pageContext ? { pageContext } : {}),
        ...(ownerContext ? { ownerContext } : {}),
        ...(adminContext ? { adminContext } : {}),
      }),
      signal: requestController.signal,
    });

    if (!response.ok) await readHttpError(response);
    if (!response.headers.get('content-type')?.includes('text/event-stream')) {
      throw new AIStreamError('Backend không trả về luồng SSE hợp lệ.', {
        code: 'AI_STREAM_INVALID',
      });
    }
    if (!response.body) {
      throw new AIStreamError('Trình duyệt không hỗ trợ đọc phản hồi streaming.', {
        code: 'AI_STREAM_UNSUPPORTED',
        retryable: false,
      });
    }

    const parser = createSSEParser(({ event, data }) => {
      if (event === 'error') {
        streamError = new AIStreamError(data.message || 'Phản hồi bị gián đoạn.', {
          code: data.code,
          retryable: data.retryable !== false,
        });
      }
      if (event === 'done') receivedDone = true;
      onEvent({ event, data });
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.feed(decoder.decode(value, { stream: true }));
    }
    parser.feed(decoder.decode());
    parser.end();

    if (streamError) throw streamError;
    if (!receivedDone) {
      throw new AIStreamError('Phản hồi bị ngắt giữa chừng. Vui lòng thử lại.', {
        code: 'AI_STREAM_INTERRUPTED',
      });
    }
  } catch (error) {
    if (error instanceof AIStreamError) throw error;
    if (timedOut) {
      throw new AIStreamError('Trợ lý phản hồi quá lâu. Vui lòng thử lại.', {
        code: 'AI_TIMEOUT',
      });
    }
    if (signal?.aborted || requestController.signal.aborted) {
      throw new AIStreamError('Phản hồi đã được dừng.', {
        code: 'AI_CANCELLED',
      });
    }
    throw new AIStreamError('Không thể kết nối với Trợ lý BookEat.', {
      code: 'AI_UNAVAILABLE',
    });
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
};

export const polishRestaurantField = ({ fieldKey, text, context, maxLength }) => (
  axiosInstance.post('/ai/polish-text', {
    fieldKey,
    text,
    mode: 'restaurant_form',
    context,
    maxLength,
  })
);
