import { Bell, CheckCheck, Inbox, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import NotificationCard from './NotificationCard';

export default function NotificationDropdown({
  id,
  notifications,
  unreadCount,
  isLoading,
  socketStatus,
  onOpenNotification,
  onDeleteNotification,
  onMarkAllRead,
  onRefresh,
}) {
  const hasNotifications = notifications.length > 0;

  return (
    <div
      id={id}
      className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-xl border border-border bg-card text-white shadow-2xl sm:w-[390px]"
      role="dialog"
      aria-label="Danh sách thông báo"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Thông báo</p>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
            <span className={cn(
              'ml-2 inline-flex h-1.5 w-1.5 rounded-full',
              socketStatus === 'connected' ? 'bg-emerald-400' : 'bg-muted-foreground'
            )} />
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white"
            onClick={onRefresh}
            aria-label="Tải lại thông báo"
            disabled={isLoading}
          >
            <RefreshCcw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white disabled:opacity-40"
            onClick={onMarkAllRead}
            aria-label="Đánh dấu tất cả đã đọc"
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-[min(68vh,520px)] overflow-y-auto">
        {isLoading && !hasNotifications && (
          <div className="space-y-3 px-4 py-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex gap-3">
                <div className="h-9 w-9 rounded-lg bg-secondary/70" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-secondary/70" />
                  <div className="h-3 w-full rounded bg-secondary/50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !hasNotifications && (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/60 text-muted-foreground">
              <Inbox className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold">Chưa có thông báo</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Các cập nhật booking, payment, voucher và chat sẽ xuất hiện tại đây.
            </p>
          </div>
        )}

        {hasNotifications && notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onOpen={onOpenNotification}
            onDelete={onDeleteNotification}
          />
        ))}
      </div>
    </div>
  );
}
