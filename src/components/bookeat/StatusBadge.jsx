import { cn } from '../ui/utils';

const STATUS_MAP = {
  Confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Seated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Completed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'No-show': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Refunded: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Expired: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  // Waitlist
  waiting: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  expired: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  seated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  // Payment
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  refunded: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

/**
 * StatusBadge — Hiển thị status với dot indicator + text
 * Dùng cho booking, waitlist, restaurant, payment, user statuses.
 * @param {string} status — Tên trạng thái (case-sensitive, match key trong STATUS_MAP)
 * @param {string} className — Override classes
 */
export function StatusBadge({ status, className }) {
  const colorClass = STATUS_MAP[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  const displayText = status?.charAt(0).toUpperCase() + status?.slice(1);

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium select-none shadow-sm backdrop-blur-[2px] transition-colors duration-200', colorClass, className)}>
      <span>{displayText}</span>
    </span>
  );
}


