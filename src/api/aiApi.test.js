import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import {
  cancelPendingAction,
  confirmPendingAction,
  createSSEParser,
  getAIHealth,
  getOrCreateConfirmIdempotencyKey,
  getPendingAction,
  sendMockMessage,
  streamAIMessage,
} from './aiApi';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const createStreamResponse = (chunks, init = {}) => {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', ...(init.headers || {}) },
    ...init,
  });
};

describe('aiApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('calls the AI health endpoint', async () => {
    axiosInstance.get.mockResolvedValue({ success: true });
    await getAIHealth();
    expect(axiosInstance.get).toHaveBeenCalledWith('/ai/health');
  });

  it('keeps the Phase 1 mock endpoint available', async () => {
    axiosInstance.post.mockResolvedValue({ success: true });
    await sendMockMessage('Xin chào');
    expect(axiosInstance.post).toHaveBeenCalledWith('/ai/mock-chat', {
      message: 'Xin chào',
    });
  });

  it('reads and cancels pending actions by id without resending booking payload', async () => {
    axiosInstance.get.mockResolvedValue({ success: true });
    axiosInstance.post.mockResolvedValue({ success: true });

    await getPendingAction('pending/action');
    await cancelPendingAction('pending/action', 'Đổi kế hoạch');

    expect(axiosInstance.get).toHaveBeenCalledWith('/ai/pending-actions/pending%2Faction');
    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/ai/pending-actions/pending%2Faction/cancel',
      { reason: 'Đổi kế hoạch' },
    );
    expect(JSON.stringify(axiosInstance.post.mock.calls[0])).not.toContain('numberOfGuests');
    expect(JSON.stringify(axiosInstance.post.mock.calls[0])).not.toContain('restaurantId');
  });

  it('confirms a pending action with only confirmation and a stable idempotency key', async () => {
    axiosInstance.post.mockResolvedValue({ success: true });

    const firstKey = getOrCreateConfirmIdempotencyKey('pending/action');
    const retryKey = getOrCreateConfirmIdempotencyKey('pending/action');
    await confirmPendingAction('pending/action', firstKey);

    expect(retryKey).toBe(firstKey);
    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/ai/pending-actions/pending%2Faction/confirm',
      { confirmation: true },
      {
        headers: {
          'Idempotency-Key': firstKey,
        },
      },
    );
    const request = JSON.stringify(axiosInstance.post.mock.calls[0]);
    expect(request).not.toContain('restaurantId');
    expect(request).not.toContain('tableNumbers');
    expect(request).not.toContain('voucherCode');
    expect(request).not.toContain('amountDue');
  });

  it('parses SSE events split across arbitrary network chunks', () => {
    const events = [];
    const parser = createSSEParser((event) => events.push(event));

    parser.feed('event: start\r\ndata: {"sequence":');
    parser.feed('0}\r\n\r\nevent: delta\ndata: {"sequence":1,"text":"Xin');
    parser.feed(' chào"}\n\nevent: done\ndata: {"sequence":2}\n\n');
    parser.end();

    expect(events).toEqual([
      { event: 'start', data: { sequence: 0 } },
      { event: 'delta', data: { sequence: 1, text: 'Xin chào' } },
      { event: 'done', data: { sequence: 2 } },
    ]);
  });

  it('streams events in order and attaches the bearer token', async () => {
    localStorage.setItem('bookeat_token', 'customer-token');
    const fetchMock = vi.fn().mockResolvedValue(createStreamResponse([
      'event: start\ndata: {"sequence":0}\n\n',
      'event: delta\ndata: {"sequence":1,"text":"Xin"}\n\n',
      'event: delta\ndata: {"sequence":2,"text":" chào"}\n\n',
      'event: completed\ndata: {"sequence":3,"usage":{}}\n\n',
      'event: done\ndata: {"sequence":4}\n\n',
    ]));
    vi.stubGlobal('fetch', fetchMock);
    const events = [];

    await streamAIMessage({
      message: 'Hello',
      history: [{ role: 'user', content: 'Trước đó' }],
      onEvent: (event) => events.push(event),
    });

    expect(events.map((event) => event.event)).toEqual([
      'start', 'delta', 'delta', 'completed', 'done',
    ]);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/ai/chat/stream', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer customer-token' }),
      body: JSON.stringify({
        message: 'Hello',
        history: [{ role: 'user', content: 'Trước đó' }],
      }),
    }));
  });

  it('includes page context when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createStreamResponse([
      'event: start\ndata: {"sequence":0}\n\n',
      'event: completed\ndata: {"sequence":1,"usage":{}}\n\n',
      'event: done\ndata: {"sequence":2}\n\n',
    ]));
    vi.stubGlobal('fetch', fetchMock);

    await streamAIMessage({
      message: 'Menu nha hang nay',
      pageContext: {
        route: '/restaurants/507f1f77bcf86cd799439011',
        restaurantId: '507f1f77bcf86cd799439011',
      },
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      message: 'Menu nha hang nay',
      history: [],
      pageContext: {
        route: '/restaurants/507f1f77bcf86cd799439011',
        restaurantId: '507f1f77bcf86cd799439011',
      },
    });
  });

  it('includes owner context when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createStreamResponse([
      'event: start\ndata: {"sequence":0}\n\n',
      'event: completed\ndata: {"sequence":1,"usage":{}}\n\n',
      'event: done\ndata: {"sequence":2}\n\n',
    ]));
    vi.stubGlobal('fetch', fetchMock);

    await streamAIMessage({
      message: 'Hom nay co bao nhieu booking?',
      ownerContext: {
        selectedRestaurantId: '507f1f77bcf86cd799439011',
      },
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      message: 'Hom nay co bao nhieu booking?',
      history: [],
      ownerContext: {
        selectedRestaurantId: '507f1f77bcf86cd799439011',
      },
    });
  });

  it('includes admin context when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createStreamResponse([
      'event: start\ndata: {"sequence":0}\n\n',
      'event: completed\ndata: {"sequence":1,"usage":{}}\n\n',
      'event: done\ndata: {"sequence":2}\n\n',
    ]));
    vi.stubGlobal('fetch', fetchMock);

    await streamAIMessage({
      message: 'Show pending restaurants',
      adminContext: {
        mode: 'admin_assistant',
      },
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      message: 'Show pending restaurants',
      history: [],
      adminContext: {
        mode: 'admin_assistant',
      },
    });
  });

  it('throws a retryable error when the stream sends an error event', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createStreamResponse([
      'event: start\ndata: {"sequence":0}\n\n',
      'event: error\ndata: {"sequence":1,"code":"AI_UNAVAILABLE","message":"Tạm gián đoạn","retryable":true}\n\n',
      'event: done\ndata: {"sequence":2}\n\n',
    ])));

    await expect(streamAIMessage({ message: 'Hello' })).rejects.toMatchObject({
      code: 'AI_UNAVAILABLE',
      message: 'Tạm gián đoạn',
      retryable: true,
    });
  });

  it('maps HTTP errors before SSE opens', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      code: 'AI_DISABLED',
      message: 'Trợ lý chưa sẵn sàng',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })));

    await expect(streamAIMessage({ message: 'Hello' })).rejects.toMatchObject({
      code: 'AI_DISABLED',
      status: 503,
      message: 'Trợ lý chưa sẵn sàng',
    });
  });

  it('detects a stream that ends without done', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createStreamResponse([
      'event: start\ndata: {"sequence":0}\n\n',
      'event: delta\ndata: {"sequence":1,"text":"Dở dang"}\n\n',
    ])));

    await expect(streamAIMessage({ message: 'Hello' })).rejects.toMatchObject({
      code: 'AI_STREAM_INTERRUPTED',
    });
  });
});
