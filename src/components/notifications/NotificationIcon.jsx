import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { useNotifications } from '../../context/useNotifications';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationIcon({
  className,
  buttonClassName,
  badgeClassName,
}) {
  const panelId = useId();
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    status,
    refreshNotifications,
    markAllAsRead,
    deleteNotification,
    openNotification,
  } = useNotifications();

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((current) => {
      const next = !current;
      if (next) refreshNotifications();
      return next;
    });
  };

  const handleOpenNotification = async (notification) => {
    setOpen(false);
    await openNotification(notification);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/notifications');
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('relative h-9 w-9 text-muted-foreground hover:text-white', buttonClassName)}
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `Mở thông báo, ${unreadCount} chưa đọc` : 'Mở thông báo'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-background shadow-md',
              badgeClassName
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <NotificationDropdown
          id={panelId}
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          socketStatus={status}
          onOpenNotification={handleOpenNotification}
          onDeleteNotification={deleteNotification}
          onMarkAllRead={() => markAllAsRead().catch(() => {})}
          onRefresh={() => refreshNotifications().catch(() => {})}
          onViewAll={handleViewAll}
        />
      )}
    </div>
  );
}
