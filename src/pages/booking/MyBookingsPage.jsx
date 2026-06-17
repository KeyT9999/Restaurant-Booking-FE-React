import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../api/bookingApi';
import BookingCard from '../../components/booking/BookingCard';
import { AlertTriangle, X, Compass, RefreshCw } from 'lucide-react';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Cancel dialog state
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyBookings({
        filter,
        page,
        limit: 5,
      });

      if (res.success) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.total || 0);
      } else {
        toast.error(res.message || 'Lỗi khi tải lịch sử đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch sử đặt bàn');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchBookings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBookings]);

  useEffect(() => {
    const handleBookingEvent = () => {
      fetchBookings();
    };

    window.addEventListener('bookeat:booking-event', handleBookingEvent);
    return () => window.removeEventListener('bookeat:booking-event', handleBookingEvent);
  }, [fetchBookings]);

  // Reset page when filter changes
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [filter]);

  const handleCancelClick = (id) => {
    setCancellingId(id);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelBooking(cancellingId, cancelReason);
      if (res.success) {
        toast.success('Đã hủy đặt bàn thành công');
        setCancellingId(null);
        fetchBookings(); // refresh
      } else {
        toast.error(res.message || 'Không thể hủy đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi hủy đặt bàn');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/bookings/${id}`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-8 flex justify-center items-center gap-1.5">
        <Button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          variant="outline"
          size="sm"
          className="border-border text-xs text-white"
        >
          Trước
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            className={`h-8 w-8 text-xs ${
              p === page ? 'bg-primary text-background font-bold' : 'border-border text-white'
            }`}
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          variant="outline"
          size="sm"
          className="border-border text-xs text-white"
        >
          Sau
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title */}
        <div className="mb-8 text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            📋 Đặt bàn của tôi
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Xem, theo dõi trạng thái, chi tiết các đơn đặt bàn hoặc hủy đặt bàn trực tuyến của bạn.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1 bg-[#20242D] border border-border p-1 rounded-lg w-fit mb-8 justify-start text-xs font-semibold">
          {[
            { value: 'all', label: 'Tất cả đơn đặt' },
            { value: 'upcoming', label: 'Đang chờ / Sắp tới' },
            { value: 'past', label: 'Đã hoàn tất' },
            { value: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.value}
              role="tab"
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
                filter === tab.value
                  ? 'bg-primary text-background font-bold'
                  : 'text-muted-foreground hover:text-white hover:bg-secondary/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic content listing */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((n) => (
              <Card key={n} className="h-32 bg-card border-border animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border bg-card/20 rounded-xl flex flex-col items-center justify-center gap-4">
            <Compass size={48} className="text-muted-foreground animate-bounce" />
            <h3 className="text-lg font-bold text-white">Không tìm thấy đặt bàn nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Bạn chưa thực hiện đơn đặt bàn nào tương ứng với bộ lọc này.
            </p>
            <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/95 text-background text-xs font-bold gap-1.5 h-10 px-5">
              🔍 Khám phá nhà hàng & đặt bàn ngay
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-left">
            <p className="text-xs text-muted-foreground">
              Tìm thấy <strong className="text-white font-bold">{totalElements}</strong> kết quả đặt bàn
            </p>
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetail={handleViewDetail}
                onCancel={handleCancelClick}
              />
            ))}
            {renderPagination()}
          </div>
        )}
      </main>

      {/* Cancel Confirmation Dialog */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0 z-0" onClick={() => setCancellingId(null)} />
          
          <Card className="relative z-10 w-full max-w-md p-6 bg-card border-border shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h4 className="font-bold text-rose-400 flex items-center gap-2 text-sm">
                <AlertTriangle size={18} /> Xác nhận hủy đặt bàn
              </h4>
              <button
                onClick={() => setCancellingId(null)}
                className="p-1 rounded text-muted-foreground hover:text-white hover:bg-secondary transition focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-xs text-left">
              <p className="text-muted-foreground leading-relaxed">
                Bạn có chắc chắn muốn hủy đặt bàn này không? Hành động này sẽ gửi yêu cầu hủy tới nhà hàng và không thể tự hoàn tác.
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Lý do hủy đặt bàn (tùy chọn):</label>
                <textarea
                  rows="3"
                  maxLength="200"
                  placeholder="Nhập lý do hủy đặt bàn tại đây..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40 text-xs">
              <Button variant="outline" onClick={() => setCancellingId(null)} disabled={isCancelling} className="border-border text-white hover:bg-secondary h-9 text-xs font-semibold">
                Quay lại
              </Button>
              <Button onClick={handleConfirmCancel} disabled={isCancelling} className="bg-rose-500 hover:bg-rose-600 text-white h-9 text-xs font-bold px-4">
                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy đặt bàn'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
