import { cn } from '../ui/utils';

const STATUS_META = {
  pending: { label: 'Chờ bàn', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Đã hủy', className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  expired: { label: 'Hết hạn', className: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
};

export default function WaitlistStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status || 'Không rõ', className: 'bg-secondary text-muted-foreground border-border' };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold select-none",
        meta.className
      )}
    >
      <span className="w-1 h-1 rounded-full bg-current mr-1.5" />
      {meta.label}
    </span>
  );
}
