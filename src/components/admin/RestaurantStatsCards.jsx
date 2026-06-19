import { Store, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RestaurantStatsCards({ stats }) {
  const {
    totalRestaurants = 0,
    pendingRestaurants = 0,
    approvedRestaurants = 0,
    suspendedRestaurants = 0,
  } = stats || {};

  const cardData = [
    {
      title: 'Tổng nhà hàng',
      value: totalRestaurants,
      icon: <Store size={16} />,
      iconClass: 'text-sky-400 bg-sky-500/10',
      borderHover: 'hover:border-sky-500/35',
    },
    {
      title: 'Chờ duyệt',
      value: pendingRestaurants,
      icon: <Clock size={16} />,
      iconClass: 'text-amber-550 bg-amber-500/10',
      borderHover: 'hover:border-amber-500/35',
    },
    {
      title: 'Đang hoạt động',
      value: approvedRestaurants,
      icon: <CheckCircle2 size={16} />,
      iconClass: 'text-emerald-500 bg-emerald-500/10',
      borderHover: 'hover:border-emerald-500/35',
    },
    {
      title: 'Bị tạm ngưng',
      value: suspendedRestaurants,
      icon: <AlertTriangle size={16} />,
      iconClass: 'text-rose-500 bg-rose-500/10',
      borderHover: 'hover:border-rose-500/35',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cardData.map((card, idx) => (
        <div key={idx} className={`bg-card border border-border rounded-xl p-4 flex flex-col justify-between transition-all ${card.borderHover}`}>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.title}</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white">{card.value}</span>
            <span className={`p-1.5 rounded-lg ${card.iconClass}`}>{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
