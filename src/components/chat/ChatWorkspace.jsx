import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, MessageCircle, Paperclip, Search, Send, Smile, X } from 'lucide-react';
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
    <div className="grid grid-cols-1 gap-2 mb-2 w-full">
      {attachments.map((attachment) => (
        <a
          key={attachment.publicId || attachment.secureUrl}
          href={attachment.secureUrl || attachment.url}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl bg-card border border-border hover:opacity-90 transition-opacity"
        >
          <img
            src={attachment.secureUrl || attachment.url}
            alt={attachment.originalName || 'Chat image'}
            loading="lazy"
            className="w-full max-h-[220px] object-cover"
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
    <div className="mt-2 flex flex-wrap gap-2 items-center relative min-h-[16px]">
      <div className="relative group">
        <button
          type="button"
          className="w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
          onClick={() => setPickerOpen((current) => !current)}
          aria-label="React tin nhan"
        >
          <Smile size={13} />
        </button>
        {pickerOpen && (
          <div className="absolute bottom-8 left-0 flex gap-1 p-1.5 border border-border rounded-xl bg-card shadow-xl z-30 w-max animate-in fade-in zoom-in duration-150">
            {ALLOWED_REACTION_EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer hover:bg-primary/10 ${
                  myReaction === emoji ? 'bg-primary/20 text-primary' : 'bg-transparent'
                }`}
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
        <div className="flex flex-wrap gap-1">
          {entries.map(([emoji, count]) => (
            <button
              type="button"
              key={emoji}
              className={`h-6 px-2 rounded-full text-[10px] flex items-center gap-1 bg-[#2C313C] text-white transition-all cursor-pointer ${
                myReaction === emoji ? 'ring-1 ring-primary border border-primary/20' : 'border border-transparent'
              }`}
              onClick={() => onReact(message.id, emoji)}
            >
              <span>{emoji}</span>
              <span className="font-semibold text-muted-foreground">{count}</span>
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
        if (!ignore) setSearchError(err.message || 'Không thể tìm tin nhắn');
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
      setAttachmentError(err.message || 'Gửi tin nhắn thất bại');
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
      setError(err.message || 'React tin nhắn thất bại');
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
    <section className="grid grid-cols-1 lg:grid-cols-[340px_1fr] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-220px)] min-h-[500px] max-h-[720px]">
      
      {/* Sidebar / Conversation pane */}
      <aside className="border-r border-border/60 bg-[#14171D] flex flex-col min-w-0 h-full lg:max-h-full max-h-[320px]">
        {/* Status toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ${
                socket.status === 'connected'
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : socket.status === 'connecting'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-destructive'
              }`}
              data-status={socket.status}
            />
            <span className="capitalize">{socket.status}</span>
          </div>
          {canStartAdminChat && (
            <button
              type="button"
              onClick={openAdminConversation}
              className="px-3 py-1.5 rounded-xl border border-border hover:bg-white/5 transition-all text-xs font-semibold text-white cursor-pointer"
            >
              Chat Admin
            </button>
          )}
        </div>

        {/* Admin restaurant switcher */}
        {canAdminStartRestaurantChat && (
          <div className="grid grid-cols-[1fr_auto] gap-2 p-3 border-b border-border/60 shrink-0">
            <select
              value={adminRestaurantId}
              onChange={(event) => setAdminRestaurantId(event.target.value)}
              disabled={adminRestaurantsLoading}
              className="w-full h-10 rounded-xl border border-border bg-[#20242D] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="h-10 px-4 rounded-xl border border-border bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Mở chat
            </button>
          </div>
        )}

        {/* Tab filters */}
        <div className="flex gap-1.5 p-3 border-b border-border/60 overflow-x-auto shrink-0 scrollbar-none">
          {['ALL', 'ADMIN_RESTAURANT', 'CUSTOMER_RESTAURANT'].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setFilter(item)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap outline-none ${
                filter === item
                  ? 'bg-primary/10 border-primary text-primary hover:bg-primary/15'
                  : 'border-border/80 text-muted-foreground hover:text-white hover:border-white'
              }`}
            >
              {item === 'ALL' ? 'Tất cả' : TYPE_LABEL[item]}
            </button>
          ))}
        </div>

        {/* Conversations loading/error/empty */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-4 text-xs text-muted-foreground">
            Đang tải hội thoại...
          </div>
        )}
        {error && (
          <div className="p-3 mx-3 my-2 rounded-xl border border-destructive/25 bg-destructive/5 text-destructive text-xs leading-relaxed shrink-0">
            {error}
          </div>
        )}

        {!loading && filteredConversations.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground gap-2">
            <MessageCircle size={24} className="opacity-40" />
            <span className="text-xs">Chưa có cuộc hội thoại nào</span>
          </div>
        )}

        {/* Scrollable Conversation list */}
        <div className="overflow-y-auto flex-1 flex flex-col divide-y divide-border/40">
          {filteredConversations.map((conversation) => {
            const isSelected = conversation.id === selectedConversationId;
            return (
              <button
                type="button"
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`flex flex-col gap-1 w-full text-left p-4 transition-all relative cursor-pointer outline-none ${
                  isSelected
                    ? 'bg-primary/[0.04] border-l-2 border-primary'
                    : 'bg-transparent border-l-2 border-transparent hover:bg-primary/[0.02]'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-sm text-white truncate max-w-[80%]">
                    {getConversationTitle(conversation, mode)}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-primary uppercase shrink-0">
                    {TYPE_LABEL[conversation.type]}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground truncate mt-0.5 max-w-[90%]">
                  {conversation.lastMessagePreview || 'Chưa có tin nhắn'}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="absolute right-4 bottom-4 min-w-[18px] h-[18px] rounded-full bg-primary text-[#0F1115] flex items-center justify-center text-[10px] font-bold">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main message pane */}
      <main className="flex flex-col min-w-0 h-full bg-[#181B22] relative">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground gap-3">
            <MessageCircle size={36} className="opacity-30 text-primary" />
            <span className="font-serif text-lg">Chọn một hội thoại để bắt đầu</span>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Vui lòng nhấp vào danh sách bên trái để mở phòng chat.
            </p>
          </div>
        ) : (
          <>
            {/* Header info */}
            <header className="p-4 border-b border-border/60 flex items-center justify-between gap-3 bg-card/65 backdrop-blur-md shrink-0">
              <div className="min-w-0">
                <h2 className="font-serif text-base md:text-lg text-white font-bold tracking-tight truncate">
                  {getConversationTitle(selectedConversation, mode)}
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {selectedConversation.restaurant?.name || 'BookEat'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchOpen((current) => !current)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer outline-none ${
                    searchOpen
                      ? 'border-primary/50 text-primary bg-primary/5'
                      : 'border-border text-muted-foreground hover:text-white hover:border-white'
                  }`}
                  aria-label="Tìm tin nhắn"
                >
                  <Search size={16} />
                </button>
                <span className="text-[9px] font-bold tracking-widest text-muted-foreground border border-border/80 rounded-lg px-2.5 py-1.5 uppercase">
                  {TYPE_LABEL[selectedConversation.type]}
                </span>
              </div>
            </header>

            {/* Search inputs */}
            {searchOpen && (
              <div className="flex items-center gap-2.5 p-3 border-b border-border bg-[#14171D] shrink-0 text-muted-foreground text-xs animate-in slide-in-from-top duration-200">
                <Search size={14} className="shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm từ khóa trong hội thoại..."
                  className="flex-1 h-9 rounded-xl border border-border bg-[#20242D] px-3 text-xs text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
                <span className="text-[10px] tabular-nums shrink-0">
                  {searching ? '...' : `${searchResults.length ? searchIndex + 1 : 0}/${searchResults.length}`}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveSearch('prev')}
                    disabled={searchResults.length === 0}
                    className="w-8 h-8 rounded-xl bg-[#20242D] border border-border/80 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all cursor-pointer"
                    aria-label="Kết quả trước"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSearch('next')}
                    disabled={searchResults.length === 0}
                    className="w-8 h-8 rounded-xl bg-[#20242D] border border-border/80 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all cursor-pointer"
                    aria-label="Kết quả tiếp theo"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-8 h-8 rounded-xl bg-transparent border border-transparent flex items-center justify-center text-muted-foreground hover:text-white transition-all cursor-pointer"
                    aria-label="Đóng tìm kiếm"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Search results pane */}
            {searchOpen && searchQuery.trim() && (
              <div className="max-h-[120px] overflow-y-auto border-b border-border bg-card divide-y divide-border/30 shrink-0">
                {searchError && (
                  <div className="p-3 text-xs text-destructive">{searchError}</div>
                )}
                {!searching && searchResults.length === 0 && !searchError && (
                  <div className="p-3 text-xs text-muted-foreground">Không tìm thấy kết quả nào</div>
                )}
                {searchResults.map((result, index) => (
                  <button
                    type="button"
                    key={result.messageId}
                    onClick={() => {
                      setSearchIndex(index);
                      scrollToSearchResult(result.messageId);
                    }}
                    className={`w-full text-left p-3 text-xs flex flex-col gap-0.5 cursor-pointer transition-colors ${
                      index === searchIndex ? 'bg-primary/10' : 'bg-transparent hover:bg-white/5'
                    }`}
                  >
                    <strong className="text-white font-semibold">{result.sender?.fullName || result.senderRole}</strong>
                    <span className="text-muted-foreground truncate">{result.snippet || result.content}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages body list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
              {messagesLoading && (
                <div className="text-center text-xs text-muted-foreground py-10 flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-primary h-5 w-5" />
                  <span>Đang tải tin nhắn...</span>
                </div>
              )}
              
              {messages.map((message) => {
                const mine = message.sender?.id === user?.id || message.sender === user?.id;
                const isHighlighted = message.id === highlightedMessageId;
                return (
                  <div
                    key={message.id}
                    id={`chat-message-${message.id}`}
                    className={`flex w-full mb-1 group ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-[70%] rounded-2xl p-3 px-4 border text-sm flex flex-col gap-1 leading-relaxed shadow-md transition-all duration-200 ${
                        mine 
                          ? 'bg-primary/10 border-primary/20 text-white rounded-tr-none' 
                          : 'bg-[#20242D] border-border text-white rounded-tl-none'
                      } ${isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                    >
                      <MessageImages message={message} />
                      {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                      <MessageReactions message={message} userId={user?.id} onReact={toggleMessageReaction} />
                      <small className="text-[10px] text-muted-foreground/60 mt-1 block self-end uppercase tracking-wider font-semibold">
                        {new Date(message.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  </div>
                );
              })}
              {activeTyping && (
                <div className="text-xs text-muted-foreground/85 italic py-1 px-2 animate-pulse flex items-center gap-1.5">
                  <Loader2 className="animate-spin h-3.5 w-3.5 text-muted-foreground" />
                  <span>Đang gõ...</span>
                </div>
              )}
            </div>

            {/* Chat inputs footer */}
            <form className="border-t border-border bg-card shrink-0 flex flex-col" onSubmit={sendMessage}>
              {attachmentError && (
                <div className="mx-3 mt-3 p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
                  {attachmentError}
                </div>
              )}
              {pendingFile && previewUrl && (
                <div className="m-3 p-3 rounded-xl border border-border bg-[#20242D]/60 flex items-center gap-3 relative animate-in slide-in-from-bottom duration-150">
                  <img src={previewUrl} alt={pendingFile.name || 'Selected file'} className="w-12 h-12 rounded-lg object-cover border border-border" />
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5 text-left text-xs">
                    <strong className="text-white font-semibold truncate block">{pendingFile.name || 'image'}</strong>
                    <span className="text-[10px] text-muted-foreground block">{formatFileSize(pendingFile.size || 0)}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={clearPendingFile} 
                    disabled={uploading} 
                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer outline-none"
                    aria-label="Xóa ảnh đã chọn"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-xl border border-border bg-transparent text-muted-foreground hover:text-white hover:border-white transition-all flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Đính kèm ảnh"
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
                  className="flex-1 h-11 rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
                <button 
                  type="submit" 
                  disabled={(!input.trim() && !pendingFile) || uploading}
                  className="w-11 h-11 rounded-xl bg-primary text-[#0F1115] font-bold hover:bg-primary/95 transition-all flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                >
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
