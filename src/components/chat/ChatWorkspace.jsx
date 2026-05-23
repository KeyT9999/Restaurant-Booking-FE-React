import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Paperclip, Search, Send, Smile, X } from 'lucide-react';
import { chatApi } from '../../api/chatApi';
import { useAuth } from '../../context/useAuth';
import { useChatSocket } from '../../hooks/useChatSocket';
import {
  formatFileSize,
  getImageAttachments,
  getMessageType,
  validateChatImageFile,
} from '../chat-widget/chatImage.utils';
import {
  ALLOWED_REACTION_EMOJIS,
  getMyReaction,
  getReactionSummary,
  mergeReactionUpdate,
} from '../chat-widget/chatReaction.utils';
import './ChatWorkspace.css';

const TYPE_LABEL = {
  ADMIN_RESTAURANT: 'Quản trị',
  CUSTOMER_RESTAURANT: 'Khách hàng',
};

const getConversationTitle = (conversation, mode) => {
  if (!conversation) return '';
  if (mode === 'admin') {
    return conversation.restaurant?.name || 'Nhà hàng';
  }
  if (conversation.type === 'ADMIN_RESTAURANT') {
    return 'BookEat Admin';
  }
  return conversation.customer?.fullName || conversation.customer?.email || 'Khách hàng';
};

const sortConversations = (items) => [...items].sort((a, b) => {
  const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
  const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime();
  return timeB - timeA;
});

function MessageImages({ message }) {
  const attachments = getImageAttachments(message);
  if (attachments.length === 0) return null;

  return (
    <div className="message-images">
      {attachments.map((attachment) => (
        <a
          key={attachment.publicId || attachment.secureUrl}
          href={attachment.secureUrl || attachment.url}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={attachment.secureUrl || attachment.url}
            alt={attachment.originalName || 'Chat image'}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

function MessageReactions({ message, userId, onReact }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const summary = message.reactionSummary || getReactionSummary(message.reactions || []);
  const entries = Object.entries(summary).filter(([, count]) => count > 0);
  const myReaction = getMyReaction(message.reactions || [], userId);

  return (
    <div className="message-reaction-area">
      <div className="message-reaction-picker-wrap">
        <button
          type="button"
          className="message-reaction-trigger"
          onClick={() => setPickerOpen((current) => !current)}
          aria-label="React tin nhan"
        >
          <Smile size={15} />
        </button>
        {pickerOpen && (
          <div className="message-reaction-picker">
            {ALLOWED_REACTION_EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                className={myReaction === emoji ? 'active' : ''}
                onClick={() => {
                  onReact(message.id, emoji);
                  setPickerOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      {entries.length > 0 && (
        <div className="message-reaction-summary">
          {entries.map(([emoji, count]) => (
            <button
              type="button"
              key={emoji}
              className={myReaction === emoji ? 'active' : ''}
              onClick={() => onReact(message.id, emoji)}
            >
              <span>{emoji}</span>
              <small>{count}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatWorkspace({
  mode,
  restaurantId,
  autoRestaurantId,
  adminRestaurants = [],
  adminRestaurantsLoading = false,
}) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [adminRestaurantId, setAdminRestaurantId] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const fileInputRef = useRef(null);
  const highlightedMessageId = searchResults[searchIndex]?.messageId || null;

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const upsertConversation = useCallback((conversation) => {
    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);
      const next = exists
        ? current.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
        : [conversation, ...current];
      return sortConversations(next);
    });
  }, []);

  const handleSocketMessage = useCallback((message) => {
    if (message.conversationId === selectedConversationId) {
      setMessages((current) => (
        current.some((item) => item.id === message.id) ? current : [...current, message]
      ));
    }
  }, [selectedConversationId]);

  const handleTyping = useCallback((event, payload) => {
    if (payload.conversationId !== selectedConversationId) return;
    setTypingUsers((current) => ({
      ...current,
      [payload.userId]: event === 'start',
    }));
  }, [selectedConversationId]);

  const handleReactionUpdated = useCallback((payload) => {
    setMessages((current) => mergeReactionUpdate(current, payload));
  }, []);

  const socket = useChatSocket({
    enabled: Boolean(user),
    onMessage: handleSocketMessage,
    onConversationUpdated: upsertConversation,
    onTyping: handleTyping,
    onReactionUpdated: handleReactionUpdated,
  });

  const loadConversations = useCallback(async () => {
    if (mode === 'owner' && !restaurantId) {
      setConversations([]);
      setSelectedConversationId(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (restaurantId) params.restaurantId = restaurantId;
      if (filter !== 'ALL') params.type = filter;

      const response = restaurantId && mode === 'owner'
        ? await chatApi.getRestaurantConversations(restaurantId, params)
        : await chatApi.getConversations(params);

      const list = response.data?.conversations || [];
      setConversations(list);
      setSelectedConversationId((current) => (
        list.some((conversation) => conversation.id === current) ? current : list[0]?.id || null
      ));
    } catch (err) {
      setError(err.message || 'Không thể tải hội thoại');
    } finally {
      setLoading(false);
    }
  }, [filter, mode, restaurantId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadConversations();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  useEffect(() => {
    if (!autoRestaurantId || mode !== 'customer') return;

    const openCustomerConversation = async () => {
      try {
        const conversation = await chatApi.createConversation({
          type: 'CUSTOMER_RESTAURANT',
          restaurantId: autoRestaurantId,
        });
        upsertConversation(conversation.data);
        setSelectedConversationId(conversation.data.id);
      } catch (err) {
        setError(err.message || 'Không thể mở chat với nhà hàng');
      }
    };

    const timeoutId = window.setTimeout(() => {
      openCustomerConversation();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [autoRestaurantId, mode, upsertConversation]);

  useEffect(() => {
    if (!restaurantId || !socket.isConnected) return;
    socket.joinRestaurant(restaurantId).catch(() => {});
  }, [restaurantId, socket]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMessages([]);
      setTypingUsers({});
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedConversationId) {
      const timeoutId = window.setTimeout(() => {
        setMessages([]);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    let ignore = false;
    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        const response = await chatApi.getMessages(selectedConversationId);
        if (!ignore) {
          setMessages(response.data?.messages || []);
          chatApi.markConversationRead(selectedConversationId).catch(() => {});
          if (socket.isConnected) {
            socket.joinConversation(selectedConversationId, selectedConversation?.restaurant?.id || restaurantId).catch(() => {});
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Không thể tải tin nhắn');
      } finally {
        if (!ignore) setMessagesLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      loadMessages();
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
      socket.leaveConversation(selectedConversationId).catch(() => {});
    };
  }, [restaurantId, selectedConversation?.restaurant?.id, selectedConversationId, socket]);

  const openAdminConversation = async () => {
    if (!restaurantId) return;
    try {
      const response = await chatApi.createConversation({
        type: 'ADMIN_RESTAURANT',
        restaurantId,
      });
      upsertConversation(response.data);
      setSelectedConversationId(response.data.id);
    } catch (err) {
      setError(err.message || 'Không thể mở chat với Admin');
    }
  };

  const openAdminRestaurantConversation = async () => {
    if (!adminRestaurantId) return;
    try {
      const response = await chatApi.createConversation({
        type: 'ADMIN_RESTAURANT',
        restaurantId: adminRestaurantId,
      });
      upsertConversation(response.data);
      setSelectedConversationId(response.data.id);
    } catch (err) {
      setError(err.message || 'Không thể mở chat với nhà hàng');
    }
  };

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const scrollToSearchResult = useCallback((messageId) => {
    if (!messageId) return;
    const element = document.getElementById(`chat-message-${messageId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    if (!highlightedMessageId) return undefined;
    const timeoutId = window.setTimeout(() => scrollToSearchResult(highlightedMessageId), 0);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedMessageId, scrollToSearchResult]);

  useEffect(() => {
    if (!searchOpen || !selectedConversationId || !searchQuery.trim()) {
      const timeoutId = window.setTimeout(() => {
        setSearchResults([]);
        setSearchIndex(0);
        setSearchError('');
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError('');
        const response = await chatApi.searchMessages(selectedConversationId, {
          q: searchQuery.trim(),
          page: 1,
          limit: 20,
        });
        if (!ignore) {
          setSearchResults(response.data?.results || []);
          setSearchIndex(0);
        }
      } catch (err) {
        if (!ignore) setSearchError(err.message || 'Khong the tim tin nhan');
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 300);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchOpen, searchQuery, selectedConversationId]);

  const clearPendingFile = () => {
    setPendingFile(null);
    setAttachmentError('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectFile = (file) => {
    const validationError = validateChatImageFile(file);
    if (validationError) {
      setAttachmentError(validationError);
      setPendingFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachmentError('');
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handlePaste = (event) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.kind === 'file' && item.type.startsWith('image/'));
    const file = imageItem?.getAsFile?.();
    if (!file) return;

    event.preventDefault();
    selectFile(file);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if ((!content && !pendingFile) || !selectedConversationId || uploading) return;

    try {
      setAttachmentError('');
      setUploading(true);
      const attachments = pendingFile
        ? [await chatApi.uploadChatImage(pendingFile).then((response) => response.data)]
        : [];
      const payload = {
        conversationId: selectedConversationId,
        content,
        messageType: getMessageType(content, attachments),
        attachments,
      };

      const result = socket.isConnected
        ? await socket.sendMessage(payload)
        : await chatApi.sendMessage(payload).then((response) => response.data);

      if (result?.message) {
        setMessages((current) => (
          current.some((item) => item.id === result.message.id) ? current : [...current, result.message]
        ));
      }
      if (result?.conversation) upsertConversation(result.conversation);
      setInput('');
      clearPendingFile();
      setUploading(false);
    } catch (err) {
      setInput(content);
      setAttachmentError(err.message || 'Gui tin nhan that bai');
      setUploading(false);
      setError(err.message || 'Gửi tin nhắn thất bại');
    }
  };

  const toggleMessageReaction = async (messageId, emoji) => {
    if (!messageId || !selectedConversationId) return;

    try {
      const payload = { messageId, conversationId: selectedConversationId, emoji };
      const result = socket.isConnected
        ? await socket.toggleMessageReaction(payload)
        : await chatApi.toggleMessageReaction(messageId, emoji).then((response) => response.data);
      setMessages((current) => mergeReactionUpdate(current, result));
    } catch (err) {
      setError(err.message || 'React tin nhan that bai');
    }
  };

  const moveSearch = (direction) => {
    if (searchResults.length === 0) return;
    setSearchIndex((current) => (
      direction === 'next'
        ? (current + 1) % searchResults.length
        : (current - 1 + searchResults.length) % searchResults.length
    ));
  };

  const filteredConversations = filter === 'ALL'
    ? conversations
    : conversations.filter((conversation) => conversation.type === filter);

  const canStartAdminChat = mode === 'owner' && restaurantId;
  const canAdminStartRestaurantChat = mode === 'admin';
  const activeTyping = Object.values(typingUsers).some(Boolean);

  return (
    <section className="chat-workspace">
      <aside className="conversation-pane">
        <div className="chat-toolbar">
          <div>
            <span className="socket-dot" data-status={socket.status} />
            <span>{socket.status}</span>
          </div>
          {canStartAdminChat && (
            <button type="button" onClick={openAdminConversation}>Chat Admin</button>
          )}
        </div>

        {canAdminStartRestaurantChat && (
          <div className="admin-restaurant-picker">
            <select
              value={adminRestaurantId}
              onChange={(event) => setAdminRestaurantId(event.target.value)}
              disabled={adminRestaurantsLoading}
            >
              <option value="">
                {adminRestaurantsLoading ? 'Đang tải nhà hàng...' : 'Chọn nhà hàng'}
              </option>
              {adminRestaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!adminRestaurantId}
              onClick={openAdminRestaurantConversation}
            >
              Mở chat
            </button>
          </div>
        )}

        <div className="chat-filters">
          {['ALL', 'ADMIN_RESTAURANT', 'CUSTOMER_RESTAURANT'].map((item) => (
            <button
              type="button"
              key={item}
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
            >
              {item === 'ALL' ? 'Tất cả' : TYPE_LABEL[item]}
            </button>
          ))}
        </div>

        {loading && <div className="chat-empty">Đang tải hội thoại...</div>}
        {error && <div className="chat-error">{error}</div>}

        {!loading && filteredConversations.length === 0 && (
          <div className="chat-empty">
            <MessageCircle size={26} />
            <span>Chưa có hội thoại</span>
          </div>
        )}

        <div className="conversation-list">
          {filteredConversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              className={`conversation-item ${conversation.id === selectedConversationId ? 'active' : ''}`}
              onClick={() => setSelectedConversationId(conversation.id)}
            >
              <span className="conversation-title">{getConversationTitle(conversation, mode)}</span>
              <span className="conversation-meta">{TYPE_LABEL[conversation.type]}</span>
              <span className="conversation-preview">{conversation.lastMessagePreview || 'Chưa có tin nhắn'}</span>
              {conversation.unreadCount > 0 && <span className="unread-badge">{conversation.unreadCount}</span>}
            </button>
          ))}
        </div>
      </aside>

      <main className="message-pane">
        {!selectedConversation ? (
          <div className="message-empty">
            <MessageCircle size={34} />
            <span>Chọn một hội thoại để bắt đầu</span>
          </div>
        ) : (
          <>
            <header className="message-header">
              <div className="message-header-info">
                <h2>{getConversationTitle(selectedConversation, mode)}</h2>
                <p>{selectedConversation.restaurant?.name || 'BookEat'}</p>
              </div>
              <div className="message-header-actions">
                <button
                  type="button"
                  className={searchOpen ? 'active' : ''}
                  onClick={() => setSearchOpen((current) => !current)}
                  aria-label="Tim tin nhan"
                >
                  <Search size={17} />
                </button>
                <span className="message-header-badge">{TYPE_LABEL[selectedConversation.type]}</span>
              </div>
            </header>

            {searchOpen && (
              <div className="message-search-bar">
                <Search size={16} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tim trong hoi thoai..."
                />
                <span>{searching ? '...' : `${searchResults.length ? searchIndex + 1 : 0}/${searchResults.length}`}</span>
                <button type="button" onClick={() => moveSearch('prev')} disabled={searchResults.length === 0} aria-label="Ket qua truoc">
                  <ChevronUp size={16} />
                </button>
                <button type="button" onClick={() => moveSearch('next')} disabled={searchResults.length === 0} aria-label="Ket qua tiep theo">
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  aria-label="Dong tim kiem"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {searchOpen && searchQuery.trim() && (
              <div className="message-search-results">
                {searchError && <span className="chat-attachment-error">{searchError}</span>}
                {!searching && searchResults.length === 0 && !searchError && <span>Khong co ket qua</span>}
                {searchResults.map((result, index) => (
                  <button
                    type="button"
                    key={result.messageId}
                    className={index === searchIndex ? 'active' : ''}
                    onClick={() => {
                      setSearchIndex(index);
                      scrollToSearchResult(result.messageId);
                    }}
                  >
                    <strong>{result.sender?.fullName || result.senderRole}</strong>
                    <small>{result.snippet || result.content}</small>
                  </button>
                ))}
              </div>
            )}

            <div className="message-list">
              {messagesLoading && <div className="chat-empty">Đang tải tin nhắn...</div>}
              {messages.map((message) => {
                const mine = message.sender?.id === user?.id || message.sender === user?.id;
                return (
                  <div
                    key={message.id}
                    id={`chat-message-${message.id}`}
                    className={`message-row ${mine ? 'mine' : ''} ${message.id === highlightedMessageId ? 'highlighted' : ''}`}
                  >
                    <div className="message-bubble">
                      <MessageImages message={message} />
                      {message.content && <p>{message.content}</p>}
                      <MessageReactions message={message} userId={user?.id} onReact={toggleMessageReaction} />
                      <small>{new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  </div>
                );
              })}
              {activeTyping && <div className="typing-indicator">Đang gõ...</div>}
            </div>

            <form className="chat-input-form" onSubmit={sendMessage}>
              {attachmentError && <div className="chat-attachment-error">{attachmentError}</div>}
              {pendingFile && previewUrl && (
                <div className="chat-attachment-preview">
                  <img src={previewUrl} alt={pendingFile.name || 'Selected image'} />
                  <span>
                    <strong>{pendingFile.name || 'image'}</strong>
                    <small>{formatFileSize(pendingFile.size || 0)}</small>
                  </span>
                  <button type="button" onClick={clearPendingFile} disabled={uploading} aria-label="Xoa anh da chon">
                    <X size={15} />
                  </button>
                </div>
              )}
              <div className="chat-input-row">
              <input
                ref={fileInputRef}
                type="file"
                className="chat-file-input"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="chat-attach-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Dinh kem anh"
              >
                <Paperclip size={18} />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onFocus={() => socket.typingStart(selectedConversationId)}
                onBlur={() => socket.typingStop(selectedConversationId)}
                onPaste={handlePaste}
                placeholder="Nhập tin nhắn..."
                maxLength={2000}
              />
              <button type="submit" disabled={(!input.trim() && !pendingFile) || uploading}>
                <Send size={18} />
              </button>
              </div>
            </form>
          </>
        )}
      </main>
    </section>
  );
}
