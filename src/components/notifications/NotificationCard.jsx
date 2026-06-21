import { Check, Trash2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatNotificationTime, getNotificationMeta } from './notificationMeta';

export default function NotificationCard({
  notification,
  onOpen,
  onDelete,
}) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  const unread = notification.status === 'unread';

  return (
    <div
      className={cn(
        'group relative flex gap-3 border-b border-border px-3 py-3 transition-colors last:border-b-0',
        unread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/30'
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex min-w-0 flex-1 gap-3 text-left focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
          <Icon className="h-4.5 w-4.5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-white">
                  {notification.title}
                </span>
                {unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Chưa đọc" />}
              </span>
              <span className="mt-0.5 inline-flex text-[11px] font-medium text-muted-foreground">
                {meta.label}
              </span>
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </span>

          <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">
            {notification.message}
          </span>
        </span>
      </button>

      <div className="absolute bottom-2 right-2 hidden items-center gap-1 rounded-lg bg-card/95 p-0.5 shadow-lg group-hover:flex group-focus-within:flex">
        {unread && (
          <span className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-300" title="Đánh dấu đã đọc">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(notification.id).catch(() => {});
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Xóa thông báo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
