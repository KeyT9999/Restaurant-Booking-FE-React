import './StatusBadge.css';

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    className: 'badge-pending',
    icon: '⏳',
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'badge-confirmed',
    icon: '✅',
  },
  completed: {
    label: 'Đã dùng bữa',
    className: 'badge-completed',
    icon: '🍽️',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'badge-cancelled',
    icon: '❌',
  },
  no_show: {
    label: 'Vắng mặt',
    className: 'badge-noshow',
    icon: '👤',
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'badge-default',
    icon: 'ℹ️',
  };

  return (
    <span
      className={`booking-status-badge ${config.className}`}
      role="status"
      aria-label={`Trạng thái: ${config.label}`}
    >
      <span className="badge-icon" aria-hidden="true">{config.icon}</span>
      <span className="badge-label">{config.label}</span>
    </span>
  );
}
