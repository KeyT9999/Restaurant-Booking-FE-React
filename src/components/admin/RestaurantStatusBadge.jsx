const STATUS_CONFIGS = {
  approved: {
    label: 'Hoạt động',
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  rejected: {
    label: 'Từ chối',
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  suspended: {
    label: 'Tạm ngưng',
    classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  deleted: {
    label: 'Đã xóa',
    classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
  pending: {
    label: 'Chờ duyệt',
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
};

const RestaurantStatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    classes: 'bg-secondary/40 text-muted-foreground border-border',
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
      ? 'px-3 py-1.5 text-sm' 
      : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border shadow-sm backdrop-blur-[2px] transition-colors duration-200 select-none ${config.classes} ${sizeClasses}`}>
      <span>{config.label}</span>
    </span>
  );
};

export default RestaurantStatusBadge;



