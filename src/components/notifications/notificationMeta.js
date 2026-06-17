import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  RefreshCcw,
  Ticket,
  Utensils,
  Wallet,
} from 'lucide-react';

const TYPE_META = {
  booking_created: { icon: CalendarCheck, label: 'Booking', tone: 'text-amber-300 bg-primary/10' },
  booking_confirmed: { icon: CalendarCheck, label: 'Booking', tone: 'text-emerald-300 bg-emerald-500/10' },
  booking_cancelled: { icon: CalendarCheck, label: 'Booking', tone: 'text-rose-300 bg-rose-500/10' },
  booking_completed: { icon: CalendarCheck, label: 'Booking', tone: 'text-zinc-200 bg-zinc-500/10' },
  booking_no_show: { icon: CalendarCheck, label: 'Booking', tone: 'text-rose-300 bg-rose-500/10' },
  payment_success: { icon: CreditCard, label: 'Payment', tone: 'text-emerald-300 bg-emerald-500/10' },
  payment_failed: { icon: CreditCard, label: 'Payment', tone: 'text-rose-300 bg-rose-500/10' },
  refund_requested: { icon: RefreshCcw, label: 'Refund', tone: 'text-amber-300 bg-primary/10' },
  refund_approved: { icon: RefreshCcw, label: 'Refund', tone: 'text-emerald-300 bg-emerald-500/10' },
  refund_rejected: { icon: RefreshCcw, label: 'Refund', tone: 'text-rose-300 bg-rose-500/10' },
  refund_processed: { icon: Wallet, label: 'Refund', tone: 'text-emerald-300 bg-emerald-500/10' },
  voucher_new: { icon: Ticket, label: 'Voucher', tone: 'text-primary bg-primary/10' },
  voucher_expiring: { icon: Ticket, label: 'Voucher', tone: 'text-amber-300 bg-primary/10' },
  chat_new_message: { icon: MessageSquare, label: 'Chat', tone: 'text-sky-300 bg-sky-500/10' },
  admin_action: { icon: Utensils, label: 'Admin', tone: 'text-primary bg-primary/10' },
  system_alert: { icon: AlertTriangle, label: 'System', tone: 'text-amber-300 bg-primary/10' },
  waitlist_created: { icon: Bell, label: 'Waitlist', tone: 'text-primary bg-primary/10' },
  waitlist_updated: { icon: Bell, label: 'Waitlist', tone: 'text-emerald-300 bg-emerald-500/10' },
  withdrawal_created: { icon: Wallet, label: 'Billing', tone: 'text-primary bg-primary/10' },
  withdrawal_updated: { icon: Wallet, label: 'Billing', tone: 'text-emerald-300 bg-emerald-500/10' },
};

export const getNotificationMeta = (type) => (
  TYPE_META[type] || { icon: Bell, label: 'BookEat', tone: 'text-primary bg-primary/10' }
);

export const formatNotificationTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const units = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
  ];

  const formatter = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
  const match = units.find(([, ms]) => absMs >= ms);
  if (!match) return 'vừa xong';

  const [unit, ms] = match;
  return formatter.format(Math.round(diffMs / ms), unit);
};
