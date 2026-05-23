import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Minus,
  Paperclip,
  Search,
  Send,
  Smile,
  Store,
  User,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useChatWidget } from '../../context/useChatWidget';
import {
  TYPE_LABEL,
  formatChatTime,
  getConversationSubtitle,
  getConversationTitle,
} from './chatWidget.utils';
import { chatApi } from '../../api/chatApi';
import {
  formatFileSize,
  getImageAttachments,
  validateChatImageFile,
} from './chatImage.utils';
import {
  ALLOWED_REACTION_EMOJIS,
  getMyReaction,
  getReactionSummary,
} from './chatReaction.utils';
import './MiniChatWidget.css';

function FloatingChatButton({ unreadCount, isMinimized, onClick }) {
  return (
    <button
      type="button"
      className={`mini-chat-floating ${isMinimized ? 'minimized' : ''}`}
      onClick={onClick}
      aria-label="Mo tin nhan"
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="mini-chat-floating-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

function SocketStatus({ status }) {
  const connected = status === 'connected';
  return (
    <span className="mini-chat-status" title={connected ? 'Connected' : 'Disconnected'}>
      {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
      <span>{connected ? 'Online' : 'Offline'}</span>
    </span>
  );
}

function WidgetHeader({ title, count, canBack, onBack, onMinimize, onClose, onSearch, searchActive, socketStatus }) {
  return (
    <header className="mini-chat-header">
      <div className="mini-chat-title">
        {canBack && (
          <button type="button" className="mini-chat-icon-btn" onClick={onBack} aria-label="Quay lai">
            <ArrowLeft size={18} />
          </button>
        )}
        <strong>{title}{typeof count === 'number' ? ` (${count})` : ''}</strong>
      </div>
      <div className="mini-chat-header-actions">
        <SocketStatus status={socketStatus} />
        <button
          type="button"
          className={`mini-chat-icon-btn ${searchActive ? 'active' : ''}`}
          onClick={onSearch}
          aria-label="Tim kiem"
        >
          <Search size={18} />
        </button>
        <button type="button" className="mini-chat-icon-btn" onClick={onMinimize} aria-label="Thu nho">
          <Minus size={18} />
        </button>
        <button type="button" className="mini-chat-icon-btn" onClick={onClose} aria-label="Dong">
          <X size={18} />
        </button>
      </div>
    </header>
  );
}

function OwnerRestaurantSwitcher({
  restaurants,
  selectedRestaurantId,
  unreadByRestaurant,
  onChange,
  loading,
}) {
  const selected = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId);
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="mini-chat-switcher muted">Dang tai nha hang...</div>;
  }

  if (restaurants.length === 0) {
    return <div className="mini-chat-switcher muted">Chua co nha hang</div>;
  }

  return (
    <div className="mini-chat-switcher">
      <button
        type="button"
        className="mini-chat-switcher-trigger"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="mini-chat-avatar small">
          {selected?.logo ? <img src={selected.logo} alt={selected.name} /> : <Store size={16} />}
        </span>
        <span className="mini-chat-switcher-copy">
          <small>Dang quan ly</small>
          <strong>{selected?.name || 'Chon nha hang'}</strong>
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="mini-chat-switcher-menu">
          {restaurants.map((restaurant) => (
            <button
              type="button"
              key={restaurant.id}
              className={`mini-chat-switcher-item ${restaurant.id === selectedRestaurantId ? 'active' : ''}`}
              onClick={() => {
                onChange(restaurant.id);
                setOpen(false);
              }}
            >
              <span className="mini-chat-avatar small">
                {restaurant.logo ? <img src={restaurant.logo} alt={restaurant.name} /> : <Store size={15} />}
              </span>
              <span>
                <strong>{restaurant.name}</strong>
                <small>{restaurant.approvalStatus || 'pending'}</small>
              </span>
              {unreadByRestaurant[restaurant.id] > 0 && (
                <span className="mini-chat-unread">{unreadByRestaurant[restaurant.id]}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminRestaurantStarter({ restaurants, loading, onOpen }) {
  const [restaurantId, setRestaurantId] = useState('');

  return (
    <div className="mini-chat-admin-start">
      <select
        value={restaurantId}
        onChange={(event) => setRestaurantId(event.target.value)}
        disabled={loading}
        aria-label="Chon nha hang de chat"
      >
        <option value="">{loading ? 'Dang tai nha hang...' : 'Mo chat voi nha hang'}</option>
        {restaurants.map((restaurant) => (
          <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={!restaurantId}
        onClick={() => onOpen(restaurantId).catch(() => {})}
      >
        Mo
      </button>
    </div>
  );
}

function ConversationListView() {
  const chat = useChatWidget();
  const canOwnerStartAdminChat = chat.role === 'restaurant_owner' && chat.selectedRestaurantId;
  const conversations = chat.filteredConversations;

  return (
    <>
      <WidgetHeader
        title="Tin nhắn"
        count={chat.unreadCount}
        socketStatus={chat.socketStatus}
        onMinimize={chat.minimizeWidget}
        onClose={chat.closeWidget}
      />
      <div className="mini-chat-list-body">
        {chat.role === 'restaurant_owner' && (
          <OwnerRestaurantSwitcher
            restaurants={chat.ownerRestaurants}
            selectedRestaurantId={chat.selectedRestaurantId}
            unreadByRestaurant={chat.unreadByRestaurant}
            onChange={chat.setSelectedRestaurantId}
            loading={chat.loadingRestaurants}
          />
        )}

        {chat.role === 'admin' && (
          <AdminRestaurantStarter
            restaurants={chat.adminRestaurants}
            loading={chat.loadingRestaurants}
            onOpen={chat.openAdminRestaurantChat}
          />
        )}

        {canOwnerStartAdminChat && (
          <button type="button" className="mini-chat-start-admin" onClick={() => chat.openOwnerAdminChat().catch(() => {})}>
            Chat Admin
          </button>
        )}

        <div className="mini-chat-search">
          <Search size={17} />
          <input
            value={chat.searchKeyword}
            onChange={(event) => chat.setSearchKeyword(event.target.value)}
            placeholder={chat.role === 'customer' ? 'Tim nha hang...' : 'Tim khach hang...'}
          />
        </div>

        {chat.error && <div className="mini-chat-error">{chat.error}</div>}
        {chat.loadingConversations && <div className="mini-chat-empty">Dang tai hoi thoai...</div>}

        {!chat.loadingConversations && conversations.length === 0 && (
          <div className="mini-chat-empty">
            <MessageCircle size={26} />
            <span>Chua co hoi thoai</span>
          </div>
        )}

        <div className="mini-chat-conversation-list">
          {conversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              className="mini-chat-conversation"
              onClick={() => chat.selectConversation(conversation.id)}
            >
              <span className="mini-chat-avatar">
                {conversation.restaurant?.logo ? (
                  <img src={conversation.restaurant.logo} alt={conversation.restaurant.name} />
                ) : conversation.type === 'ADMIN_RESTAURANT' ? (
                  <Store size={18} />
                ) : (
                  <User size={18} />
                )}
              </span>
              <span className="mini-chat-conversation-copy">
                <strong>{getConversationTitle(conversation, chat.role)}</strong>
                <small>{conversation.lastMessagePreview || '...'}</small>
              </span>
              <span className="mini-chat-conversation-meta">
                <small>{formatChatTime(conversation.lastMessageAt || conversation.updatedAt)}</small>
                {conversation.unreadCount > 0 && (
                  <span className="mini-chat-unread">{conversation.unreadCount}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ReactionSummary({ message, userId, onReact }) {
  const summary = message.reactionSummary || getReactionSummary(message.reactions || []);
  const entries = Object.entries(summary).filter(([, count]) => count > 0);
  const myReaction = getMyReaction(message.reactions || [], userId);
  if (entries.length === 0) return null;

  return (
    <div className="mini-chat-reaction-summary">
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
  );
}

function ReactionPicker({ message, userId, onReact }) {
  const [open, setOpen] = useState(false);
  const myReaction = getMyReaction(message.reactions || [], userId);

  return (
    <div className="mini-chat-reaction-picker-wrap">
      <button
        type="button"
        className="mini-chat-reaction-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-label="React tin nhan"
      >
        <Smile size={14} />
      </button>
      {open && (
        <div className="mini-chat-reaction-picker">
          {ALLOWED_REACTION_EMOJIS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              className={myReaction === emoji ? 'active' : ''}
              onClick={() => {
                onReact(message.id, emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, userId, onReact, highlighted }) {
  const mine = message.sender?.id === userId || message.sender === userId || message.senderId === userId;
  const imageAttachments = getImageAttachments(message);

  return (
    <div
      id={`mini-chat-message-${message.id}`}
      className={`mini-chat-message-row ${mine ? 'mine' : ''} ${highlighted ? 'highlighted' : ''}`}
    >
      <div className="mini-chat-message-bubble">
        <ReactionPicker message={message} userId={userId} onReact={onReact} />
        {imageAttachments.length > 0 && (
          <div className="mini-chat-message-images">
            {imageAttachments.map((attachment) => (
              <a
                key={attachment.publicId || attachment.secureUrl}
                href={attachment.secureUrl || attachment.url}
                target="_blank"
                rel="noreferrer"
                className="mini-chat-message-image-link"
              >
                <img
                  src={attachment.secureUrl || attachment.url}
                  alt={attachment.originalName || 'Chat image'}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}
        {message.content && <p>{message.content}</p>}
        <ReactionSummary message={message} userId={userId} onReact={onReact} />
        <small>{formatChatTime(message.sentAt || message.createdAt)}</small>
      </div>
    </div>
  );
}

function AttachmentPreview({ file, previewUrl, uploading, onRemove }) {
  if (!file || !previewUrl) return null;

  return (
    <div className="mini-chat-attachment-preview">
      <img src={previewUrl} alt={file.name || 'Selected image'} />
      <span>
        <strong>{file.name || 'image'}</strong>
        <small>{formatFileSize(file.size || 0)}</small>
      </span>
      <button type="button" onClick={onRemove} disabled={uploading} aria-label="Xoa anh da chon">
        <X size={15} />
      </button>
    </div>
  );
}

function ChatWindowView() {
  const chat = useChatWidget();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const title = getConversationTitle(chat.selectedConversation, chat.role);
  const subtitle = getConversationSubtitle(chat.selectedConversation, chat.role);
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
  const highlightedMessageId = searchResults[searchIndex]?.messageId || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.messages.length, chat.activeTyping]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const scrollToSearchResult = useCallback((messageId) => {
    if (!messageId) return;
    const element = document.getElementById(`mini-chat-message-${messageId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    if (!highlightedMessageId) return undefined;
    const timeoutId = window.setTimeout(() => scrollToSearchResult(highlightedMessageId), 0);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedMessageId, scrollToSearchResult]);

  useEffect(() => {
    if (!searchOpen || !chat.selectedConversationId || !searchQuery.trim()) {
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
        const response = await chatApi.searchMessages(chat.selectedConversationId, {
          q: searchQuery.trim(),
          page: 1,
          limit: 20,
        });
        if (!ignore) {
          setSearchResults(response.data?.results || []);
          setSearchIndex(0);
        }
      } catch (error) {
        if (!ignore) setSearchError(error.message || 'Khong the tim tin nhan');
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 300);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [chat.selectedConversationId, searchOpen, searchQuery]);

  const clearPendingFile = () => {
    setPendingFile(null);
    setAttachmentError('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectFile = (file) => {
    const error = validateChatImageFile(file);
    if (error) {
      setAttachmentError(error);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = chat.inputDraft.trim();
    if ((!content && !pendingFile) || chat.sending || uploading) return;

    try {
      setAttachmentError('');
      setUploading(true);
      const attachments = pendingFile
        ? [await chatApi.uploadChatImage(pendingFile).then((response) => response.data)]
        : [];
      await chat.sendMessage(content, attachments);
      clearPendingFile();
    } catch (error) {
      setAttachmentError(error.message || 'Gui anh that bai');
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
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

  return (
    <>
      <WidgetHeader
        title={title || 'Hoi thoai'}
        canBack
        socketStatus={chat.socketStatus}
        onBack={chat.showConversationList}
        onMinimize={chat.minimizeWidget}
        onClose={chat.closeWidget}
        onSearch={() => setSearchOpen((current) => !current)}
        searchActive={searchOpen}
      />
      <div className="mini-chat-window-subtitle">
        <span>{subtitle}</span>
        <span>{TYPE_LABEL[chat.selectedConversation?.type] || 'Chat'}</span>
      </div>
      {searchOpen && (
        <div className="mini-chat-message-search">
          <Search size={15} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tim trong hoi thoai..."
          />
          <span>{searching ? '...' : `${searchResults.length ? searchIndex + 1 : 0}/${searchResults.length}`}</span>
          <button type="button" onClick={() => moveSearch('prev')} disabled={searchResults.length === 0} aria-label="Ket qua truoc">
            <ChevronUp size={15} />
          </button>
          <button type="button" onClick={() => moveSearch('next')} disabled={searchResults.length === 0} aria-label="Ket qua tiep theo">
            <ChevronDown size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }}
            aria-label="Dong tim kiem"
          >
            <X size={15} />
          </button>
        </div>
      )}
      {searchOpen && searchQuery.trim() && (
        <div className="mini-chat-search-results">
          {searchError && <span className="mini-chat-attachment-error">{searchError}</span>}
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
      <div className="mini-chat-messages">
        {chat.loadingMessages && <div className="mini-chat-empty">Dang tai tin nhan...</div>}
        {!chat.loadingMessages && chat.messages.length === 0 && (
          <div className="mini-chat-empty fill">
            <MessageCircle size={30} />
            <span>Chua co tin nhan</span>
          </div>
        )}
        {chat.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            userId={chat.user?.id}
            onReact={chat.toggleMessageReaction}
            highlighted={message.id === highlightedMessageId}
          />
        ))}
        {chat.activeTyping && <div className="mini-chat-typing">Dang go...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="mini-chat-input-area" onSubmit={handleSubmit}>
        {attachmentError && <div className="mini-chat-attachment-error">{attachmentError}</div>}
        <AttachmentPreview
          file={pendingFile}
          previewUrl={previewUrl}
          uploading={uploading}
          onRemove={clearPendingFile}
        />
        <div className="mini-chat-input-row">
          <input
            ref={fileInputRef}
            type="file"
            className="mini-chat-file-input"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="mini-chat-attach"
            aria-label="Dinh kem anh"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip size={19} />
          </button>
          <textarea
            value={chat.inputDraft}
            onChange={(event) => setInputAndTyping(chat, event.target.value)}
            onBlur={chat.typingStop}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Tra loi..."
            rows={1}
            maxLength={2000}
          />
          <button
            type="submit"
            className="mini-chat-send"
            disabled={(!chat.inputDraft.trim() && !pendingFile) || chat.sending || uploading}
            aria-label="Gui tin nhan"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </>
  );
}

function setInputAndTyping(chat, value) {
  chat.setInputDraft(value);
  if (value.trim()) chat.typingStart();
  else chat.typingStop();
}

export default function MiniChatWidget() {
  const chat = useChatWidget();

  const shouldRender = useMemo(() => chat.isAuthenticated && chat.user, [chat.isAuthenticated, chat.user]);
  if (!shouldRender) return null;

  return (
    <div className="mini-chat-root">
      {!chat.isOpen && (
        <FloatingChatButton
          unreadCount={chat.unreadCount}
          isMinimized={chat.isMinimized}
          onClick={chat.openWidget}
        />
      )}

      {chat.isOpen && (
        <section className="mini-chat-panel" aria-label="Mini realtime chat">
          {chat.activeView === 'chatWindow' && chat.selectedConversation
            ? <ChatWindowView />
            : <ConversationListView />}
        </section>
      )}
    </div>
  );
}
