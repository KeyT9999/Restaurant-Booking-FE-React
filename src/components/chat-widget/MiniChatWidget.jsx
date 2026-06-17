import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
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
  Loader2,
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

function FloatingChatButton({ unreadCount, isMinimized, onClick }) {
  return (
    <button
      type="button"
      className={`fixed right-6 bottom-6 z-[1200] w-14 h-14 rounded-full border border-primary/30 bg-[#1A1D24] text-primary flex items-center justify-center cursor-pointer shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none ${
        isMinimized ? 'opacity-90' : ''
      }`}
      onClick={onClick}
      aria-label="Mở tin nhắn"
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-destructive text-white flex items-center justify-center text-[10px] font-bold px-1.5">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

function SocketStatus({ status }) {
  const connected = status === 'connected';
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mr-1.5" title={connected ? 'Connected' : 'Disconnected'}>
      {connected ? (
        <>
          <Wifi size={12} className="text-emerald-500" />
          <span className="text-emerald-500 uppercase tracking-wider">Online</span>
        </>
      ) : (
        <>
          <WifiOff size={12} className="text-muted-foreground" />
          <span className="uppercase tracking-wider">Offline</span>
        </>
      )}
    </span>
  );
}

function WidgetHeader({ title, count, canBack, onBack, onMinimize, onClose, onSearch, searchActive, socketStatus }) {
  return (
    <header className="h-14 px-4 bg-[#14171D] border-b border-border/60 text-white flex items-center justify-between gap-3 shrink-0">
      <div className="min-w-0 flex items-center gap-2">
        {canBack && (
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
            onClick={onBack}
            aria-label="Quay lại"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <strong className="font-serif text-sm font-bold tracking-wide truncate">
          {title}
          {typeof count === 'number' ? ` (${count})` : ''}
        </strong>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
        <SocketStatus status={socketStatus} />
        {onSearch && (
          <button
            type="button"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer outline-none ${
              searchActive ? 'text-primary bg-primary/10' : 'hover:bg-white/5 hover:text-white'
            }`}
            onClick={onSearch}
            aria-label="Tìm kiếm"
          >
            <Search size={15} />
          </button>
        )}
        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer outline-none"
          onClick={onMinimize}
          aria-label="Thu nhỏ"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 hover:text-white transition-colors cursor-pointer outline-none"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={15} />
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
    return <div className="text-xs text-muted-foreground px-4 py-2">Đang tải nhà hàng...</div>;
  }

  if (restaurants.length === 0) {
    return <div className="text-xs text-muted-foreground px-4 py-2">Chưa có nhà hàng</div>;
  }

  return (
    <div className="relative mx-3.5 mt-3 shrink-0">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-2 bg-[#20242D]/40 border border-border rounded-xl cursor-pointer hover:bg-[#20242D] transition-colors outline-none"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A1D24] border border-border shrink-0 overflow-hidden">
          {selected?.logo ? <img src={selected.logo} alt={selected.name} className="w-full h-full object-cover" /> : <Store size={15} className="text-muted-foreground" />}
        </span>
        <span className="flex-1 min-w-0 flex flex-col text-left">
          <small className="text-[10px] text-muted-foreground">Đang quản lý</small>
          <strong className="text-xs font-bold text-white truncate">{selected?.name || 'Chọn nhà hàng'}</strong>
        </span>
        <ChevronDown size={14} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute top-12 left-0 right-0 max-h-[160px] overflow-y-auto bg-[#1A1D24] border border-border rounded-xl p-1.5 flex flex-col gap-1 shadow-2xl z-35 animate-in fade-in duration-150">
          {restaurants.map((restaurant) => (
            <button
              type="button"
              key={restaurant.id}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-white/5 transition-colors cursor-pointer outline-none relative ${
                restaurant.id === selectedRestaurantId ? 'bg-primary/5 text-primary border border-primary/20' : 'border border-transparent text-white'
              }`}
              onClick={() => {
                onChange(restaurant.id);
                setOpen(false);
              }}
            >
              <span className="w-7 h-7 rounded-md flex items-center justify-center bg-[#20242D] border border-border shrink-0 overflow-hidden">
                {restaurant.logo ? <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover" /> : <Store size={13} className="text-muted-foreground" />}
              </span>
              <span className="flex-1 min-w-0 flex flex-col leading-tight">
                <strong className="text-xs font-semibold truncate block">{restaurant.name}</strong>
                <small className="text-[9px] text-muted-foreground uppercase tracking-wider">{restaurant.approvalStatus || 'pending'}</small>
              </span>
              {unreadByRestaurant[restaurant.id] > 0 && (
                <span className="min-w-[16px] h-[16px] rounded-full bg-destructive text-white flex items-center justify-center text-[9px] font-bold px-1 shrink-0">
                  {unreadByRestaurant[restaurant.id]}
                </span>
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
    <div className="flex gap-2 p-2.5 bg-[#20242D]/40 border border-border rounded-xl mx-3.5 mt-3 shrink-0">
      <select
        value={restaurantId}
        onChange={(event) => setRestaurantId(event.target.value)}
        disabled={loading}
        aria-label="Chọn nhà hàng để chat"
        className="flex-1 h-9 rounded-lg border border-border bg-[#1A1D24] px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
      >
        <option value="">{loading ? 'Đang tải nhà hàng...' : 'Mở chat với nhà hàng'}</option>
        {restaurants.map((restaurant) => (
          <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={!restaurantId}
        onClick={() => onOpen(restaurantId).catch(() => {})}
        className="h-9 px-4 rounded-lg bg-primary text-[#0F1115] font-bold text-xs hover:bg-primary/95 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Mở
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
      <div className="flex-1 min-h-0 flex flex-col bg-card">
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
          <button
            type="button"
            onClick={() => chat.openOwnerAdminChat().catch(() => {})}
            className="mx-3.5 mt-3 h-10 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 transition-all text-xs font-bold cursor-pointer shrink-0"
          >
            Chat Admin
          </button>
        )}

        {/* Local Search inside conversations list */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 text-muted-foreground bg-card/60 mx-3.5 mt-3 border rounded-xl">
          <Search size={14} className="shrink-0" />
          <input
            value={chat.searchKeyword}
            onChange={(event) => chat.setSearchKeyword(event.target.value)}
            placeholder={chat.role === 'customer' ? 'Tìm kiếm nhà hàng...' : 'Tìm kiếm khách hàng...'}
            className="flex-1 h-6 bg-transparent text-xs text-white placeholder-muted-foreground/60 outline-none"
          />
        </div>

        {chat.error && (
          <div className="mx-3.5 mt-3 p-2.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs shrink-0">
            {chat.error}
          </div>
        )}
        {chat.loadingConversations && (
          <div className="flex-1 flex items-center justify-center p-6 text-xs text-muted-foreground gap-2">
            <Loader2 className="animate-spin h-4 w-4 text-primary" />
            <span>Đang tải hội thoại...</span>
          </div>
        )}

        {!chat.loadingConversations && conversations.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground gap-2">
            <MessageCircle size={24} className="opacity-40" />
            <span className="text-xs">Chưa có cuộc hội thoại nào</span>
          </div>
        )}

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto mt-3 border-t border-border/40 divide-y divide-border/20">
          {conversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              className="w-full p-4 bg-transparent hover:bg-primary/[0.01] transition-all flex items-center gap-3 text-left cursor-pointer outline-none relative"
              onClick={() => chat.selectConversation(conversation.id)}
            >
              <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#20242D] border border-border shrink-0 overflow-hidden">
                {conversation.restaurant?.logo ? (
                  <img src={conversation.restaurant.logo} alt={conversation.restaurant.name} className="w-full h-full object-cover" />
                ) : conversation.type === 'ADMIN_RESTAURANT' ? (
                  <Store size={18} className="text-muted-foreground" />
                ) : (
                  <User size={18} className="text-muted-foreground" />
                )}
              </span>
              <span className="flex-1 min-w-0 flex flex-col leading-tight gap-1">
                <strong className="text-xs font-bold text-white truncate block">{getConversationTitle(conversation, chat.role)}</strong>
                <small className="text-[11px] text-muted-foreground truncate block">{conversation.lastMessagePreview || '...'}</small>
              </span>
              <span className="flex flex-col items-end gap-1.5 shrink-0">
                <small className="text-[9px] text-muted-foreground font-semibold uppercase">{formatChatTime(conversation.lastMessageAt || conversation.updatedAt)}</small>
                {conversation.unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-[#0F1115] flex items-center justify-center text-[10px] font-bold px-1">
                    {conversation.unreadCount}
                  </span>
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
    <div className="flex flex-wrap gap-1 mt-1.5">
      {entries.map(([emoji, count]) => (
        <button
          type="button"
          key={emoji}
          className={`h-5 px-1.5 rounded-full text-[9px] flex items-center gap-1 bg-white/10 text-white transition-all cursor-pointer ${
            myReaction === emoji ? 'ring-1 ring-primary border border-primary/20' : 'border border-transparent'
          }`}
          onClick={() => onReact(message.id, emoji)}
        >
          <span>{emoji}</span>
          <span className="font-semibold opacity-70">{count}</span>
        </button>
      ))}
    </div>
  );
}

function ReactionPicker({ message, userId, onReact }) {
  const [open, setOpen] = useState(false);
  const myReaction = getMyReaction(message.reactions || [], userId);

  return (
    <div className="absolute top-[-11px] right-2 z-4 group">
      <button
        type="button"
        className="w-5.5 h-5.5 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-white hover:border-white transition-all cursor-pointer shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100"
        onClick={() => setOpen((current) => !current)}
        aria-label="React tin nhắn"
      >
        <Smile size={12} />
      </button>
      {open && (
        <div className="absolute bottom-6 left-0 flex gap-1 p-1 border border-border rounded-xl bg-card shadow-xl z-20 w-max animate-in fade-in duration-100">
          {ALLOWED_REACTION_EMOJIS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer hover:bg-primary/10 ${
                myReaction === emoji ? 'bg-primary/20 text-primary' : 'bg-transparent'
              }`}
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
      className={`flex w-full mb-1 group ${mine ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[75%] rounded-xl p-2.5 px-3 border text-xs flex flex-col gap-1 leading-relaxed shadow-sm transition-all duration-200 ${
          mine
            ? 'bg-primary/10 border-primary/20 text-white rounded-tr-none'
            : 'bg-[#20242D] border-border text-white rounded-tl-none'
        } ${highlighted ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
      >
        {!mine && <ReactionPicker message={message} userId={userId} onReact={onReact} />}
        {imageAttachments.length > 0 && (
          <div className="grid grid-cols-1 gap-1.5 mb-1.5 w-full">
            {imageAttachments.map((attachment) => (
              <a
                key={attachment.publicId || attachment.secureUrl}
                href={attachment.secureUrl || attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg bg-card border border-border hover:opacity-90 transition-opacity"
              >
                <img
                  src={attachment.secureUrl || attachment.url}
                  alt={attachment.originalName || 'Chat image'}
                  loading="lazy"
                  className="w-full max-h-[160px] object-cover"
                />
              </a>
            ))}
          </div>
        )}
        {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
        <ReactionSummary message={message} userId={userId} onReact={onReact} />
        <small className="text-[9px] text-muted-foreground/60 mt-1 block self-end uppercase tracking-wider font-semibold">
          {formatChatTime(message.sentAt || message.createdAt)}
        </small>
      </div>
    </div>
  );
}

function AttachmentPreview({ file, previewUrl, uploading, onRemove }) {
  if (!file || !previewUrl) return null;

  return (
    <div className="mx-3 mt-3 p-2.5 rounded-xl border border-border bg-[#20242D]/60 flex items-center gap-3 relative animate-in slide-in-from-bottom duration-150">
      <img src={previewUrl} alt={file.name || 'Selected file'} className="w-10 h-10 rounded-lg object-cover border border-border" />
      <div className="flex-1 min-w-0 flex flex-col text-left text-xs gap-0.5">
        <strong className="text-white font-semibold truncate block">{file.name || 'image'}</strong>
        <span className="text-[10px] text-muted-foreground block">{formatFileSize(file.size || 0)}</span>
      </div>
      <button 
        type="button" 
        onClick={onRemove} 
        disabled={uploading} 
        className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer outline-none shrink-0"
        aria-label="Xóa ảnh đã chọn"
      >
        <X size={13} />
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
        if (!ignore) setSearchError(error.message || 'Không thể tìm tin nhắn');
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
      setAttachmentError(error.message || 'Gửi ảnh thất bại');
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
        title={title || 'Hội thoại'}
        canBack
        socketStatus={chat.socketStatus}
        onBack={chat.showConversationList}
        onMinimize={chat.minimizeWidget}
        onClose={chat.closeWidget}
        onSearch={() => setSearchOpen((current) => !current)}
        searchActive={searchOpen}
      />
      
      {/* Subtitle info */}
      <div className="h-9 px-4 border-b border-border/60 bg-[#14171D]/40 text-[10px] font-bold text-muted-foreground tracking-wider flex items-center justify-between shrink-0 uppercase">
        <span className="truncate max-w-[70%]">{subtitle}</span>
        <span className="shrink-0">{TYPE_LABEL[chat.selectedConversation?.type] || 'Chat'}</span>
      </div>

      {/* Message search input */}
      {searchOpen && (
        <div className="flex items-center gap-2 p-2 border-b border-border bg-[#14171D]/80 shrink-0 text-muted-foreground text-xs animate-in duration-200">
          <Search size={13} className="shrink-0" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm từ khóa tin nhắn..."
            className="flex-1 h-8 rounded-lg border border-border bg-[#20242D] px-2.5 text-xs text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          <span className="text-[10px] tabular-nums shrink-0">
            {searching ? '...' : `${searchResults.length ? searchIndex + 1 : 0}/${searchResults.length}`}
          </span>
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => moveSearch('prev')}
              disabled={searchResults.length === 0}
              className="w-7 h-7 rounded-lg bg-[#20242D] border border-border flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Kết quả trước"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => moveSearch('next')}
              disabled={searchResults.length === 0}
              className="w-7 h-7 rounded-lg bg-[#20242D] border border-border flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Kết quả tiếp theo"
            >
              <ChevronDown size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="w-7 h-7 rounded-lg bg-transparent flex items-center justify-center text-muted-foreground hover:text-white transition-all cursor-pointer outline-none"
              aria-label="Đóng tìm kiếm"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Message search results list */}
      {searchOpen && searchQuery.trim() && (
        <div className="max-h-[110px] overflow-y-auto border-b border-border bg-[#1A1D24] divide-y divide-border/20 shrink-0">
          {searchError && <span className="p-3 text-[11px] text-destructive block">{searchError}</span>}
          {!searching && searchResults.length === 0 && !searchError && <span className="p-3 text-[11px] text-muted-foreground block text-center">Không tìm thấy kết quả</span>}
          {searchResults.map((result, index) => (
            <button
              type="button"
              key={result.messageId}
              onClick={() => {
                setSearchIndex(index);
                scrollToSearchResult(result.messageId);
              }}
              className={`w-full text-left p-2 px-3 text-[11px] flex flex-col gap-0.5 cursor-pointer transition-colors ${
                index === searchIndex ? 'bg-primary/10' : 'bg-transparent hover:bg-white/5'
              }`}
            >
              <strong className="text-white font-semibold">{result.sender?.fullName || result.senderRole}</strong>
              <small className="text-muted-foreground truncate block">{result.snippet || result.content}</small>
            </button>
          ))}
        </div>
      )}

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-[#181B22]">
        {chat.loadingMessages && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-xs text-muted-foreground gap-2">
            <Loader2 className="animate-spin h-5 w-5 text-primary" />
            <span>Đang tải tin nhắn...</span>
          </div>
        )}
        {!chat.loadingMessages && chat.messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <MessageCircle size={28} className="opacity-30 text-primary" />
            <span className="text-xs">Chưa có tin nhắn nào</span>
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
        {chat.activeTyping && (
          <div className="text-[11px] text-muted-foreground/85 italic py-1 px-1.5 animate-pulse flex items-center gap-1">
            <Loader2 className="animate-spin h-3 w-3 text-muted-foreground" />
            <span>Đang gõ...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input footer forms */}
      <form className="border-t border-border bg-card shrink-0 flex flex-col" onSubmit={handleSubmit}>
        {attachmentError && (
          <div className="mx-3 mt-3 p-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-[11px]">
            {attachmentError}
          </div>
        )}
        <AttachmentPreview
          file={pendingFile}
          previewUrl={previewUrl}
          uploading={uploading}
          onRemove={clearPendingFile}
        />
        <div className="flex items-center gap-2 p-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-9 h-9 rounded-lg border border-border bg-transparent text-muted-foreground hover:text-white hover:border-white transition-all flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Đính kèm ảnh"
          >
            <Paperclip size={16} />
          </button>
          <textarea
            value={chat.inputDraft}
            onChange={(event) => setInputAndTyping(chat, event.target.value)}
            onBlur={chat.typingStop}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Nhập tin nhắn..."
            rows={1}
            maxLength={2000}
            className="flex-1 h-9 rounded-lg border border-border bg-[#20242D] px-3 py-1.5 text-xs text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all resize-none scrollbar-none"
          />
          <button
            type="submit"
            disabled={(!chat.inputDraft.trim() && !pendingFile) || chat.sending || uploading}
            className="w-9 h-9 rounded-lg bg-primary text-[#0F1115] hover:bg-primary/95 flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Gửi tin nhắn"
          >
            <Send size={15} />
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
    <div className="fixed right-6 bottom-6 z-[1200] font-sans">
      {!chat.isOpen && (
        <FloatingChatButton
          unreadCount={chat.unreadCount}
          isMinimized={chat.isMinimized}
          onClick={chat.openWidget}
        />
      )}

      {chat.isOpen && (
        <section className="w-[calc(100vw-32px)] sm:w-[380px] h-[520px] bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200 z-50" aria-label="Realtime chat popup">
          {chat.activeView === 'chatWindow' && chat.selectedConversation
            ? <ChatWindowView />
            : <ConversationListView />}
        </section>
      )}
    </div>
  );
}
