import { cn } from '../ui/utils';

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: '⏳',
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: '✅',
  },
  completed: {
    label: 'Đã dùng bữa',
    className: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    icon: '🍽️',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: '❌',
  },
  no_show: {
    label: 'Vắng mặt',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: '👤',
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-secondary text-muted-foreground border-border',
    icon: 'ℹ️',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold select-none",
        config.className
      )}
      role="status"
      aria-label={`Trạng thái: ${config.label}`}
    >
      <span className="text-xs" aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
