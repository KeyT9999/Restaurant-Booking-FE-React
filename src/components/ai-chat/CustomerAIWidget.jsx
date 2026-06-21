import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, RefreshCw, Send, Sparkles, Square, X } from 'lucide-react';
import { matchPath, useLocation } from 'react-router-dom';
import { streamAIMessage } from '../../api/aiApi';
import { getAIWidgetErrorMessage, isNonRetryableAIError } from './aiErrorCopy';
import AIResultRenderer from './results/AIResultRenderer';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 8;

const DEFAULT_PROMPTS = [
  'Tìm nhà hàng phở',
  'Quán hải sản ngon có trên BookEat không?',
  'Chính sách đặt bàn là gì?',
];

const RESTAURANT_DETAIL_PROMPTS = [
  'T\u1ed1i nay 19h c\u00f2n b\u00e0n cho 4 ng\u01b0\u1eddi kh\u00f4ng?',
  'Cho tôi xem menu nhà hàng này',
  'Tóm tắt chi tiết nhà hàng này',
  'Chính sách đặt bàn của nhà hàng này',
];

const createMessage = (role, text, status = 'completed', extra = {}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  text,
  status,
  results: [],
  toolStatus: null,
  toolError: null,
  ...extra,
});

const buildRecentHistory = (messages) => messages
  .filter((message) => (
    ['user', 'assistant'].includes(message.role)
    && message.status === 'completed'
    && message.text.trim()
  ))
  .slice(-MAX_HISTORY_MESSAGES)
  .map((message) => ({ role: message.role, content: message.text }));

const getFallbackText = (status) => (
  status === 'cancelled' ? 'Phản hồi đã được dừng.' : 'Phản hồi bị gián đoạn.'
);

const getPageContext = (pathname) => {
  if (pathname === '/restaurants') return { route: '/restaurants' };

  const match = matchPath({ path: '/restaurants/:id', end: true }, pathname);
  const restaurantId = match?.params?.id;
  if (restaurantId && /^[a-fA-F0-9]{24}$/.test(restaurantId)) {
    return {
      route: `/restaurants/${restaurantId}`,
      restaurantId,
    };
  }

  return null;
};

const getToolErrorMessage = (data) => (
  data?.message || 'Không thể tải dữ liệu public cho yêu cầu này.'
);

export default function CustomerAIWidget() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeAbortControllerRef = useRef(null);
  const stopRequestedRef = useRef(false);

  const isCustomerSurface = !pathname.startsWith('/owner') && !pathname.startsWith('/admin');
  const pageContext = useMemo(() => getPageContext(pathname), [pathname]);
  const suggestedPrompts = pageContext?.restaurantId ? RESTAURANT_DETAIL_PROMPTS : DEFAULT_PROMPTS;

  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [messages, sending, error]);

  useEffect(() => {
    if (!isCustomerSurface) activeAbortControllerRef.current?.abort();
  }, [isCustomerSurface]);

  useEffect(() => () => activeAbortControllerRef.current?.abort(), []);

  if (!isCustomerSurface) return null;

  const runStream = async ({
    message,
    assistantMessageId,
    userMessageId,
    history,
    context,
  }) => {
    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;
    stopRequestedRef.current = false;
    let lastSequence = -1;
    let receivedText = false;
    let receivedResult = false;

    setSending(true);
    setError(null);

    try {
      await streamAIMessage({
        message,
        history,
        pageContext: context,
        signal: abortController.signal,
        onEvent: ({ event, data }) => {
          if (typeof data?.sequence === 'number') {
            if (data.sequence <= lastSequence) return;
            lastSequence = data.sequence;
          }

          if (event === 'delta' && typeof data.text === 'string') {
            receivedText = receivedText || Boolean(data.text);
            setMessages((current) => current.map((item) => (
              item.id === assistantMessageId
                ? { ...item, text: `${item.text}${data.text}`, status: 'streaming' }
                : item
            )));
          }

          if (event === 'tool_started') {
            setMessages((current) => current.map((item) => (
              item.id === assistantMessageId
                ? {
                  ...item,
                  status: 'streaming',
                  toolStatus: {
                    tool: data.tool,
                    label: data.label || 'Đang tải dữ liệu...',
                    status: 'running',
                  },
                  toolError: null,
                }
                : item
            )));
          }

          if (event === 'tool_completed') {
            const failed = data.status && data.status !== 'success';
            const authRequired = data.errorCode === 'AUTH_REQUIRED';
            setMessages((current) => current.map((item) => (
              item.id === assistantMessageId
                ? {
                  ...item,
                  toolStatus: failed ? null : {
                    tool: data.tool,
                    label: 'Đã tải dữ liệu public',
                    status: 'completed',
                  },
                  toolError: null,
                }
                : item
            )));

            if (failed && !authRequired) {
              setError({
                message: getToolErrorMessage(data),
                retry: {
                  message,
                  assistantMessageId,
                  userMessageId,
                  history,
                  context,
                },
              });
            }
          }

          if (event === 'result' && data.result) {
            receivedResult = true;
            setMessages((current) => current.map((item) => (
              item.id === assistantMessageId
                ? {
                  ...item,
                  results: [...(item.results || []), data.result],
                  toolStatus: null,
                  toolError: null,
                }
                : item
            )));
          }

          if (event === 'completed') {
            setMessages((current) => current.map((item) => (
              item.id === assistantMessageId
                ? { ...item, status: 'completed', toolStatus: null }
                : item
            )));
          }
        },
      });

      if (!receivedText && !receivedResult) {
        throw new Error('Trợ lý không trả về nội dung. Vui lòng thử lại.');
      }

      setMessages((current) => current.map((item) => (
        item.id === assistantMessageId ? { ...item, status: 'completed', toolStatus: null } : item
      )));
    } catch (requestError) {
      const cancelled = stopRequestedRef.current || requestError?.code === 'AI_CANCELLED';
      const status = cancelled ? 'cancelled' : 'failed';

      setMessages((current) => current.map((item) => (
        item.id === assistantMessageId
          ? { ...item, status, toolStatus: null }
          : item
      )));

      if (!cancelled) {
        setError({
          message: getAIWidgetErrorMessage(requestError, 'customer'),
          retry: isNonRetryableAIError(requestError) ? null : {
            message,
            assistantMessageId,
            userMessageId,
            history,
            context,
          },
        });
      }
    } finally {
      if (activeAbortControllerRef.current === abortController) {
        activeAbortControllerRef.current = null;
      }
      setSending(false);
    }
  };

  const requestAssistant = (rawMessage) => {
    const message = rawMessage.trim();
    if (!message || sending) return;

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError({
        message: `Tin nhắn không được vượt quá ${MAX_MESSAGE_LENGTH} ký tự.`,
        retry: null,
      });
      return;
    }

    const history = buildRecentHistory(messages);
    const userMessage = createMessage('user', message);
    const assistantMessage = createMessage('assistant', '', 'streaming');
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft('');

    runStream({
      message,
      assistantMessageId: assistantMessage.id,
      userMessageId: userMessage.id,
      history,
      context: pageContext,
    });
  };

  const retryStream = () => {
    if (!error?.retry || sending) return;
    const retry = error.retry;
    setMessages((current) => current.map((item) => (
      item.id === retry.assistantMessageId
        ? {
          ...item,
          text: '',
          status: 'streaming',
          results: [],
          toolStatus: null,
          toolError: null,
        }
        : item
    )));
    runStream(retry);
  };

  const stopStream = () => {
    stopRequestedRef.current = true;
    activeAbortControllerRef.current?.abort();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    requestAssistant(draft);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const fillPrompt = (prompt) => {
    setDraft(prompt);
    setError(null);
    textareaRef.current?.focus();
  };

  const editBookingPreview = (preview) => {
    const restaurantName = preview?.restaurant?.name || 'nhà hàng này';
    setDraft(`Tôi muốn chỉnh sửa bản xem trước đặt bàn tại ${restaurantName}: `);
    setError(null);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const persistConfirmedBooking = ({ pendingActionId, booking }) => {
    if (!pendingActionId || !booking?.id) return;
    setMessages((current) => current.map((message) => ({
      ...message,
      results: (message.results || []).map((result) => (
        result.type === 'booking_preview'
        && result.payload?.pendingActionId === pendingActionId
          ? {
            ...result,
            payload: {
              ...result.payload,
              status: 'confirmed',
              confirmEnabled: false,
              confirmedBooking: booking,
            },
          }
          : result
      )),
    })));
  };

  const renderAssistantMessage = (message) => {
    const hasTextBubble = Boolean(message.text)
      || (message.status === 'streaming' && !message.results?.length && !message.toolStatus)
      || (['failed', 'cancelled'].includes(message.status) && !message.text);

    return (
      <div key={message.id} className="mr-auto flex w-[95%] max-w-[340px] flex-col gap-2">
        {hasTextBubble && (
          <div className="rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
            {message.status === 'streaming' && !message.text ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
                Đang phản hồi...
              </span>
            ) : ['failed', 'cancelled'].includes(message.status) && !message.text ? (
              <span className="text-muted-foreground">{getFallbackText(message.status)}</span>
            ) : (
              <span className="whitespace-pre-wrap break-words">{message.text}</span>
            )}
            {message.status === 'streaming' && message.text && (
              <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle" aria-hidden="true" />
            )}
            {message.text && ['failed', 'cancelled'].includes(message.status) && (
              <span className={`mt-1.5 block text-[10px] font-semibold uppercase ${
                message.status === 'failed' ? 'text-destructive' : 'text-muted-foreground'
              }`}
              >
                {message.status === 'failed' ? 'Phản hồi bị gián đoạn' : 'Đã dừng'}
              </span>
            )}
          </div>
        )}

        {message.toolStatus && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin text-primary" aria-hidden="true" />
            <span>{message.toolStatus.label}</span>
          </div>
        )}

        {message.toolError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {message.toolError.message}
          </div>
        )}

        {message.results?.map((result, index) => (
          <AIResultRenderer
            key={`${result.type}-${result.version}-${index}`}
            result={result}
            onEditBookingPreview={editBookingPreview}
            onBookingConfirmed={persistConfirmedBooking}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-[1190] flex justify-end font-sans pointer-events-none sm:left-auto sm:right-6">
      {!isOpen && (
        <button
          type="button"
          className="pointer-events-auto flex h-12 items-center gap-2 rounded-full border border-primary/40 bg-card px-4 text-sm font-semibold text-primary shadow-2xl transition-all duration-200 hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          onClick={() => setIsOpen(true)}
          aria-label="Mở Trợ lý BookEat"
          aria-expanded="false"
          aria-controls="customer-ai-panel"
        >
          <Sparkles size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Trợ lý BookEat</span>
        </button>
      )}

      {isOpen && (
        <section
          id="customer-ai-panel"
          className="pointer-events-auto flex h-[560px] max-h-[calc(100vh-8rem)] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl sm:w-[390px]"
          aria-label="Trợ lý BookEat"
        >
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-[#14171D] px-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Bot size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-sans text-sm font-semibold text-foreground">Trợ lý BookEat</h2>
                <p className="text-xs text-muted-foreground">Tìm nhà hàng và hỗ trợ đặt bàn</p>
              </div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng Trợ lý BookEat"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-background/40 p-4"
            role="log"
            aria-live="polite"
            aria-busy={sending}
          >
            {messages.length === 0 && (
              <div className="my-auto text-center">
                <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Sparkles size={20} aria-hidden="true" />
                </span>
                <h3 className="font-sans text-base font-semibold text-foreground">Bạn muốn hỏi gì?</h3>
                <p className="mx-auto mt-1 max-w-[34ch] text-sm text-muted-foreground">
                  Trợ lý có thể tìm nhà hàng, xem menu, kiểm tra bàn trống và chuẩn bị đặt bàn từ nguồn BookEat.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => fillPrompt(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              message.role === 'user' ? (
                <div
                  key={message.id}
                  className="ml-auto max-w-[85%] rounded-xl bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground"
                >
                  <span className="whitespace-pre-wrap break-words">{message.text}</span>
                </div>
              ) : renderAssistantMessage(message)
            ))}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm" role="alert">
                <p className="text-destructive">{error.message}</p>
                {error.retry && (
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md font-semibold text-foreground underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    onClick={retryStream}
                    disabled={sending}
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    Thử lại
                  </button>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="shrink-0 border-t border-border bg-card p-3" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="customer-ai-message">Tin nhắn cho Trợ lý BookEat</label>
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                id="customer-ai-message"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (!error?.retry) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi..."
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                className="min-h-10 max-h-28 flex-1 resize-none rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                disabled={sending}
              />
              {sending ? (
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                  onClick={stopStream}
                  aria-label="Dừng phản hồi"
                >
                  <Square size={15} fill="currentColor" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!draft.trim()}
                  aria-label="Gửi tin nhắn"
                >
                  <Send size={17} aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
