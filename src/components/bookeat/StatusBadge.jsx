import { cn } from '../ui/utils';

const STATUS_MAP = {
  Confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Seated: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Completed: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  'No-show': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Refunded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Suspended: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Draft: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Expired: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  // Waitlist
  waiting: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  expired: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  seated: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  // Payment
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  failed: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  refunded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

/**
 * StatusBadge — Hiển thị status với dot indicator + text
 * Dùng cho booking, waitlist, restaurant, payment, user statuses.
 * @param {string} status — Tên trạng thái (case-sensitive, match key trong STATUS_MAP)
 * @param {string} className — Override classes
 */
export function StatusBadge({ status, className }) {
  const colorClass = STATUS_MAP[status] || 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30';
  const displayText = status?.charAt(0).toUpperCase() + status?.slice(1);

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs', colorClass, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {displayText}
    </span>
  );
}
