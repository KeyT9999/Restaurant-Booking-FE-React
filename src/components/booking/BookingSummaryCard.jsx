import { Store, Calendar, Clock, Users, Tag, MessageSquare, Landmark } from 'lucide-react';
import { Card } from '../ui/card';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const occasionMap = {
  birthday: '🎂 Sinh nhật',
  anniversary: '💍 Kỷ niệm',
  business: '💼 Công việc',
  date: '💑 Hẹn hò',
  family: '👨‍👩‍👧‍👦 Gia đình',
  other: '🎯 Khác',
};

export default function BookingSummaryCard({ bookingData, restaurant, selectedTables = [] }) {
  const {
    bookingDate,
    bookingTime,
    numberOfGuests,
    customerName,
    customerPhone,
    customerEmail,
    specialRequests,
    occasion,
    voucherCode,
    discountAmount = 0,
  } = bookingData;

  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const totalDeposit = selectedTables.reduce((sum, t) => sum + (t.depositAmount || 0), 0);

  return (
    <Card className="p-5 bg-card border-border flex flex-col gap-5">
      <div className="pb-3 border-b border-border/60">
        <h4 className="font-bold text-white text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          📋 Tóm tắt chi tiết đặt bàn
        </h4>
      </div>

      <div className="flex flex-col gap-4 text-xs">
        {/* Restaurant Section */}
        <div className="flex gap-3">
          <Store size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Nhà hàng</span>
            <span className="font-bold text-white mt-0.5 block">{restaurant?.name || 'Nhà hàng'}</span>
            <span className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 block truncate">
              {restaurant?.address}
            </span>
          </div>
        </div>

        {/* Date Section */}
        <div className="flex gap-3">
          <Calendar size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Ngày đặt bàn</span>
            <span className="font-semibold text-white mt-0.5 block">{formattedDate}</span>
          </div>
        </div>

        {/* Time Section */}
        <div className="flex gap-3">
          <Clock size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Giờ đặt bàn</span>
            <span className="font-bold text-primary mt-0.5 block">{bookingTime}</span>
          </div>
        </div>

        {/* Guests Section */}
        <div className="flex gap-3">
          <Users size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Số lượng khách</span>
            <span className="font-semibold text-white mt-0.5 block">{numberOfGuests} người</span>
          </div>
        </div>

        {/* Tables Section */}
        {selectedTables.length > 0 && (
          <div className="flex gap-3">
            <span className="h-[18px] w-[18px] text-center text-sm flex-shrink-0">🪑</span>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Bàn đã chọn</span>
              <span className="font-bold text-primary mt-0.5 block">
                {selectedTables.map(t => `Bàn ${t.tableNumber} (${t.capacity} chỗ)`).join(', ')}
              </span>
            </div>
          </div>
        )}

        <div className="h-px bg-border/60 my-1" />

        {/* Customer Contact */}
        <div className="flex flex-col gap-2.5 bg-secondary/30 border border-border p-3.5 rounded-lg">
          <h5 className="font-bold text-white text-[11px] uppercase tracking-wide">👤 Thông tin liên hệ</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
            <div>Họ tên: <strong className="text-white block sm:inline">{customerName}</strong></div>
            <div>Số ĐT: <strong className="text-white block sm:inline">{customerPhone}</strong></div>
            <div className="truncate">Email: <strong className="text-white block sm:inline truncate" title={customerEmail}>{customerEmail}</strong></div>
          </div>
        </div>

        {(occasion || specialRequests || voucherCode || totalDeposit > 0) && (
          <div className="h-px bg-border/60 my-1" />
        )}

        {/* Additional details list */}
        {occasion && (
          <div className="flex items-center justify-between text-xs py-0.5">
            <span className="text-muted-foreground">Dịp đặc biệt:</span>
            <span className="font-medium text-white">{occasionMap[occasion] || occasion}</span>
          </div>
        )}

        {specialRequests && (
          <div className="flex flex-col gap-1 text-xs py-0.5">
            <span className="text-muted-foreground">Yêu cầu đặc biệt:</span>
            <span className="text-white italic bg-secondary/30 p-2.5 border border-border rounded leading-relaxed">"{specialRequests}"</span>
          </div>
        )}

        {voucherCode && (
          <div className="flex items-center justify-between text-xs py-0.5 text-emerald-400">
            <span>Mã giảm giá ({voucherCode}):</span>
            <span className="font-bold">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-muted-foreground">Yêu cầu đặt cọc:</span>
          <span className="font-bold text-primary">
            {totalDeposit > 0 ? formatCurrency(totalDeposit) : '0đ (Đặt chỗ miễn phí)'}
          </span>
        </div>
      </div>
    </Card>
  );
}
