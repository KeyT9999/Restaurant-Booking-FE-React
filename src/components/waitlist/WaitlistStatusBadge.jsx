import './WaitlistStatusBadge.css';

const STATUS_META = {
  pending: { label: 'Cho ban', className: 'pending' },
  confirmed: { label: 'Da xac nhan', className: 'confirmed' },
  cancelled: { label: 'Da huy', className: 'cancelled' },
  expired: { label: 'Het han', className: 'expired' },
};

export default function WaitlistStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status || 'Khong ro', className: 'neutral' };
  return (
    <span className={`waitlist-status-badge ${meta.className}`}>
      {meta.label}
    </span>
  );
}
