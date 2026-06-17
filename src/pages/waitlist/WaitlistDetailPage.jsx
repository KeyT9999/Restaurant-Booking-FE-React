import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarDays, Clock, ConciergeBell, Users, Utensils, ShieldAlert, Info, ArrowUpRight } from 'lucide-react';
import { cancelWaitlist, getWaitlistById } from '../../api/waitlistApi';
import WaitlistStatusBadge from '../../components/waitlist/WaitlistStatusBadge';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

const currency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}) : '--';

export default function WaitlistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [waitlist, setWaitlist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWaitlistById(id);
      if (res.success) setWaitlist(res.data.waitlist);
      else toast.error(res.message || 'Không thể tải chi tiết hàng chờ');
    } catch (error) {
      toast.error(error.message || 'Không thể tải chi tiết hàng chờ');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    const handler = (event) => {
      const eventId = event.detail?.payload?.waitlistId;
      if (!eventId || eventId === id) fetchDetail();
    };
    window.addEventListener('bookeat:waitlist-event', handler);
    return () => window.removeEventListener('bookeat:waitlist-event', handler);
  }, [fetchDetail, id]);

  const handleCancel = async () => {
    const reason = window.prompt('Lý do hủy danh sách chờ?', 'Khách hàng chủ động hủy');
    if (reason === null) return;

    try {
      const res = await cancelWaitlist(id, reason);
      if (res.success) {
        toast.success('Đã hủy yêu cầu danh sách chờ');
        fetchDetail();
      }
    } catch (error) {
      toast.error(error.message || 'Không thể hủy yêu cầu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Đang tải thông tin chi tiết hàng chờ...</p>
        </div>
      </div>
    );
  }

  if (!waitlist) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <ShieldAlert className="h-12 w-12 text-rose-500" />
          <p className="text-muted-foreground text-sm">Không tìm thấy yêu cầu danh sách chờ này.</p>
          <Button onClick={() => navigate('/my-waitlists')} className="bg-primary hover:bg-primary/95 text-background font-semibold">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách chờ
          </Button>
        </div>
      </div>
    );
  }

  const total = [...(waitlist.dishes || []), ...(waitlist.services || [])]
    .reduce((sum, item) => sum + Number(item.price || item.priceSnapshot || 0) * Number(item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Header with Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Chi tiết yêu cầu hàng chờ
            </h2>
            <span className="text-xs text-muted-foreground mt-1 block">
              Mã yêu cầu: <strong className="font-mono text-white">#{String(waitlist.id).slice(-6).toUpperCase()}</strong>
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/my-waitlists')} className="border-border hover:bg-secondary text-xs font-semibold self-start sm:self-auto gap-1.5 h-9">
            <ArrowLeft size={14} /> Hàng chờ của tôi
          </Button>
        </div>

        {/* Detail Card Block */}
        <Card className="p-6 bg-card border-border flex flex-col gap-6 text-left">
          {/* Top header details */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Nhà hàng đã đăng ký</p>
              <h1 className="text-xl font-extrabold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {waitlist.restaurant?.name || 'Nhà hàng'}
              </h1>
            </div>
            <WaitlistStatusBadge status={waitlist.status} />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground bg-secondary/20 p-4 rounded-xl border border-border/60">
            <div className="flex items-center gap-2 min-w-0">
              <CalendarDays size={16} className="text-primary flex-shrink-0" />
              <span className="truncate">{formatDate(waitlist.preferredDate)}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={16} className="text-primary flex-shrink-0" />
              <span className="font-bold text-white">{waitlist.preferredTime || '--:--'}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Users size={16} className="text-primary flex-shrink-0" />
              <span>{waitlist.numberOfGuests} khách đi cùng</span>
            </div>
          </div>

          {/* Queue positions stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-secondary/40 border border-border p-3.5 rounded-lg flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Vị trí hàng chờ</span>
              <strong className="text-base text-primary font-bold">{waitlist.queuePositionSnapshot || 'Đang tính'}</strong>
            </div>
            <div className="bg-secondary/40 border border-border p-3.5 rounded-lg flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Ước tính chờ</span>
              <strong className="text-base text-white font-bold">{waitlist.estimatedWaitMinutes || 0} phút</strong>
            </div>
            <div className="bg-secondary/40 border border-border p-3.5 rounded-lg flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Giới hạn thời gian</span>
              <strong className="text-base text-white font-bold">
                {waitlist.maxWaitUntil ? new Date(waitlist.maxWaitUntil).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </strong>
            </div>
            <div className="bg-secondary/40 border border-border p-3.5 rounded-lg flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Tạm tính đơn trước</span>
              <strong className="text-base text-primary font-bold">{currency(total)}</strong>
            </div>
          </div>

          {/* Details columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {/* Preferred tables */}
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide border-l-2 border-primary pl-2">Bàn ăn ưu tiên đã chọn</h4>
              {(waitlist.tables || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic mt-1.5">Để nhà hàng tự động sắp xếp bàn trống thích hợp.</p>
              ) : (
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 mt-2">
                  {waitlist.tables.map((table) => (
                    <li key={table.id}>
                      Bàn <strong className="text-white">{table.tableNumber}</strong> ({table.capacity} chỗ) ·{' '}
                      <span className="capitalize">{table.selectionType === 'manual' ? 'tự chọn' : 'đề xuất'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dishes */}
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide border-l-2 border-primary pl-2 flex items-center gap-1.5">
                <Utensils size={14} className="text-primary" /> Món ăn đặt trước
              </h4>
              {(waitlist.dishes || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic mt-1.5">Không đăng ký đặt trước món ăn nào.</p>
              ) : (
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 mt-2">
                  {waitlist.dishes.map((item) => (
                    <li key={item.id}>
                      <strong className="text-white">{item.name}</strong> x{item.quantity} ·{' '}
                      <span className="text-primary font-medium">{currency(item.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Services */}
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide border-l-2 border-primary pl-2 flex items-center gap-1.5">
                <ConciergeBell size={14} className="text-primary" /> Dịch vụ phụ trợ
              </h4>
              {(waitlist.services || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic mt-1.5">Không đăng ký dịch vụ đặc biệt.</p>
              ) : (
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 mt-2">
                  {waitlist.services.map((item) => (
                    <li key={item.id}>
                      <strong className="text-white">{item.name}</strong> x{item.quantity} ·{' '}
                      <span className="text-primary font-medium">{currency(item.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide border-l-2 border-primary pl-2">Ghi chú gửi kèm</h4>
              <p className="text-xs text-muted-foreground italic mt-1.5 leading-relaxed bg-secondary/20 p-2.5 rounded border border-border/40">
                {waitlist.note ? `"${waitlist.note}"` : 'Không có ghi chú nào được để lại.'}
              </p>
            </div>
          </div>

          {/* Converted Booking link warning */}
          {waitlist.convertedBookingId && (
            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mt-4">
              <div className="flex gap-2.5 items-start text-xs text-emerald-400">
                <Info size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  Đăng ký hàng chờ đã được duyệt và chuyển đổi thành đơn đặt bàn thành công!
                </span>
              </div>
              <Link
                to={`/bookings/${waitlist.convertedBookingId}`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                Xem đơn đặt bàn <ArrowUpRight size={14} />
              </Link>
            </div>
          )}

          {/* Cancel waitlist action */}
          {waitlist.status === 'pending' && (
            <div className="mt-4 pt-4 border-t border-border/60 flex justify-end">
              <Button
                variant="destructive"
                onClick={handleCancel}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold uppercase tracking-wider h-10 px-6 cursor-pointer"
              >
                Hủy đăng ký hàng chờ
              </Button>
            </div>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-[#090B0E] py-8 text-center text-xs text-muted-foreground mt-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm font-bold text-white tracking-wider">BookEat</span>
          <span>© 2026 BookEat. Mọi quyền được bảo lưu.</span>
        </div>
      </footer>
    </div>
  );
}
