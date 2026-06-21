import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../context/useNotifications';
import { notificationApi } from '../../api/notificationApi';
import { Bell, CheckCheck, Inbox, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import NotificationCard from '../../components/notifications/NotificationCard';

export default function NotificationsPage() {
  const { refreshNotifications, openNotification } = useNotifications();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(async (currentPage, currentFilter) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 20 };
      if (currentFilter === 'unread') params.status = 'unread';
      if (currentFilter === 'read') params.status = 'read';

      const res = await notificationApi.getNotifications(params);
      const data = res.data;
      setItems(data.notifications || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Lỗi khi tải thông báo', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(page, filter);
  }, [fetchNotifications, page, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      refreshNotifications();
      fetchNotifications(page, filter);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      refreshNotifications();
      fetchNotifications(page, filter);
    } catch (error) {
      console.error('Lỗi khi xóa thông báo', error);
    }
  };

  const handleOpen = async (notification) => {
    // openNotification from context also marks as read and navigates
    openNotification(notification);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Quản lý thông báo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Có tổng cộng {total} thông báo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-10 rounded-md border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">Tất cả thông báo</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>

          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
            onClick={handleMarkAllRead}
            disabled={loading || total === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-white"
            onClick={() => fetchNotifications(page, filter)}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Đang tải thông báo...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/60 mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </span>
            <p className="text-base font-semibold text-white">Không có thông báo nào</p>
            <p className="mt-1 text-sm">Thử thay đổi bộ lọc hoặc quay lại sau.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
