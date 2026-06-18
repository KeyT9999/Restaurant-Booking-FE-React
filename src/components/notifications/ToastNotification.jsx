import { X } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatNotificationTime, getNotificationMeta } from './notificationMeta';

export default function ToastNotification({ toastInstance, notification, onOpen, onDismiss }) {
  const meta = getNotificationMeta(notification?.type);
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-[calc(100vw-2rem)] max-w-[380px] gap-3 rounded-xl border border-border bg-card p-3 text-white shadow-2xl transition-all duration-200',
        toastInstance?.visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
        <Icon className="h-4.5 w-4.5" />
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{notification?.title || 'Thông báo mới'}</p>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {notification?.message}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatNotificationTime(notification?.createdAt)}
        </p>
      </button>

      <button
        type="button"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-white focus:outline-none focus:ring-1 focus:ring-primary"
        onClick={onDismiss}
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
