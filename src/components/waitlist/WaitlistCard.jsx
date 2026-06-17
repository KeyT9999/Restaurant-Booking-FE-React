import { CalendarDays, Clock, Users, Utensils, ConciergeBell } from 'lucide-react';
import WaitlistStatusBadge from './WaitlistStatusBadge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

const formatDate = (dateValue) => {
  if (!dateValue) return 'Chưa chọn ngày';
  return new Date(dateValue).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function WaitlistCard({ waitlist, onView, onCancel }) {
  const restaurantName = waitlist.restaurant?.name || waitlist.restaurantId?.name || 'Nhà hàng';
  const dishesCount = waitlist.dishes?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0;
  const servicesCount = waitlist.services?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0;

  return (
    <Card className="p-5 bg-card border-border hover:border-primary/20 transition duration-300 flex flex-col gap-4 text-left">
      <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-border/50">
        <div>
          <h3 className="text-base font-bold text-white truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {restaurantName}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Mã yêu cầu: #{String(waitlist.id || '').slice(-6).toUpperCase()}</p>
        </div>
        <WaitlistStatusBadge status={waitlist.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarDays size={14} className="text-primary flex-shrink-0" />
          <span className="truncate">{formatDate(waitlist.preferredDate)}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock size={14} className="text-primary flex-shrink-0" />
          <span className="font-bold text-white">{waitlist.preferredTime || '--:--'}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Users size={14} className="text-primary flex-shrink-0" />
          <span className="truncate">{waitlist.numberOfGuests} khách</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground bg-secondary/25 p-2.5 rounded-lg border border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <Utensils size={13} className="text-primary flex-shrink-0" />
          <span className="truncate font-medium">{dishesCount} món chọn trước</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <ConciergeBell size={13} className="text-primary flex-shrink-0" />
          <span className="truncate font-medium">{servicesCount} dịch vụ</span>
        </div>
      </div>

      {waitlist.status === 'pending' && (
        <div className="text-[11px] text-primary/95 bg-primary/5 border border-primary/10 px-3 py-2 rounded-lg font-medium">
          Vị trí hàng chờ dự kiến: <strong className="text-white font-bold">{waitlist.queuePositionSnapshot || 'đang tính'}</strong> · Thời gian chờ ước tính khoảng <strong className="text-white font-bold">{waitlist.estimatedWaitMinutes || 0} phút</strong>
        </div>
      )}

      <div className="mt-2.5 pt-3 border-t border-border/40 flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => onView?.(waitlist)}
          className="border-border text-white hover:bg-secondary text-xs font-semibold h-8.5 px-3.5"
        >
          Xem chi tiết
        </Button>
        {waitlist.status === 'pending' && (
          <Button
            variant="destructive"
            onClick={() => onCancel?.(waitlist)}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold h-8.5 px-3.5"
          >
            Hủy yêu cầu
          </Button>
        )}
      </div>
    </Card>
  );
}
