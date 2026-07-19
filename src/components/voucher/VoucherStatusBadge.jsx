const STATUS_CONFIGS = {
  active: {
    label: 'Hoạt động',
    classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
  inactive: {
    label: 'Chờ kích hoạt',
    classes: 'bg-secondary/40 border-border/80 text-muted-foreground',
  },
  scheduled: {
    label: 'Chờ chạy',
    classes: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  expired: {
    label: 'Hết hạn',
    classes: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  },
  disabled: {
    label: 'Đã hủy',
    classes: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  },
  paused: {
    label: 'Tạm dừng',
    classes: 'bg-primary/10 border-primary/20 text-primary',
  },
};

const VoucherStatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    classes: 'bg-secondary border-border text-muted-foreground',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium select-none shadow-sm backdrop-blur-[2px] transition-colors duration-200 ${config.classes}`}>
      <span>{config.label}</span>
    </span>
  );
};

export default VoucherStatusBadge;


