
const RestaurantStatusBadge = ({ status, size = 'md' }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Hoạt động';
      case 'rejected':
        return 'Từ chối';
      case 'suspended':
        return 'Tạm ngưng';
      case 'deleted':
        return 'Đã xóa';
      default:
        return status;
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'suspended':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'deleted':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'pending':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${getStatusClasses(status)} ${sizeClasses}`}>
      {getStatusText(status)}
    </span>
  );
};

export default RestaurantStatusBadge;

