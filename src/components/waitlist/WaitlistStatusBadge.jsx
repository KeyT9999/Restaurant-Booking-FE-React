import { cn } from '../ui/utils';

const STATUS_META = {
  pending: { 
    label: 'Chờ bàn', 
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  confirmed: { 
    label: 'Đã xác nhận', 
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  cancelled: { 
    label: 'Đã hủy', 
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  expired: { 
    label: 'Hết hạn', 
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
};

export default function WaitlistStatusBadge({ status }) {
  const meta = STATUS_META[status] || { 
    label: status || 'Không rõ', 
    className: 'bg-secondary/40 text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium select-none shadow-sm backdrop-blur-[2px] transition-colors duration-200",
        meta.className
      )}
    >
      <span>{meta.label}</span>
    </span>
  );
}


