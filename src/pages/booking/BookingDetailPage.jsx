import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../../api/bookingApi';
import StatusBadge from '../../components/booking/StatusBadge';
import StatusTimeline from '../../components/booking/StatusTimeline';
import ReviewForm from '../../components/review/ReviewForm';
import { ArrowLeft, Store, Calendar, Clock, Users, Tag, MessageSquare, AlertTriangle, X, Star } from 'lucide-react';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import toast from 'react-hot-toast';

const occasionLabels = {
  birthday: '🎂 Sinh nhật',
  anniversary: '💍 Kỷ niệm',
  business: '💼 Công việc',
  date: '💑 Hẹn hò',
  family: '👨‍👩‍👧‍👦 Gia đình',
  other: '🎯 Khác',
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setBooking(res.data);
      } else {
        toast.error(res.message || 'Lỗi khi tải thông tin chi tiết đặt bàn');
        navigate('/my-bookings');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải thông tin đặt bàn');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchBooking();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBooking]);

  const handleCancelClick = () => {
    setShowCancelDialog(true);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelBooking(id, cancelReason);
      if (res.success) {
        toast.success('Hủy đặt bàn thành công');
        setShowCancelDialog(false);
        fetchBooking();
      } else {
        toast.error(res.message || 'Lỗi khi hủy đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra khi hủy đặt bàn');
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = () => {
    if (!booking) return false;
    const now = new Date();
    const bDate = new Date(booking.bookingDate);
    const [h, m] = booking.bookingTime.split(':').map(Number);
    bDate.setHours(h, m, 0, 0);
    return ['pending', 'confirmed'].includes(booking.status) && bDate > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Đang tải thông tin chi tiết đặt bàn...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const formattedDate = new Date(booking.bookingDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Header Title with Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Chi tiết đơn đặt bàn
            </h2>
            <span className="text-xs text-muted-foreground mt-1 block">
              Mã đặt bàn: <strong className="font-mono text-white">#{booking.id.substring(18).toUpperCase()}</strong>
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/my-bookings')} className="border-border hover:bg-secondary text-xs font-semibold self-start sm:self-auto gap-1">
            <ArrowLeft size={14} /> Quay lại danh sách
          </Button>
        </div>

        {/* Page Grid: Left details, Right Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Booking details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Status Panel Card */}
            <Card className="p-5 bg-card border-border flex flex-col gap-3 text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Trạng thái đặt bàn hiện tại</span>
              <div className="mt-1">
                <StatusBadge status={booking.status} />
              </div>
              {booking.status === 'cancelled' && (
                <div className="mt-3 p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/15 text-xs text-rose-400 leading-relaxed flex flex-col gap-1">
                  <span className="font-bold">Lý do hủy đặt bàn:</span>
                  <p className="text-white italic">&quot;{booking.cancellationReason || 'Không có lý do chi tiết'}&quot;</p>
                  <span className="text-[10px] text-muted-foreground mt-1 capitalize">
                    Yêu cầu hủy thực hiện bởi: {booking.cancelledBy === 'customer' ? 'Khách hàng' : booking.cancelledBy === 'restaurant' ? 'Nhà hàng' : 'Quản trị viên'}
                  </span>
                </div>
              )}
            </Card>

            {/* Restaurant Detail Card */}
            <Card className="p-5 bg-card border-border flex flex-col gap-3 text-left">
              <h4 className="font-bold text-white text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Store size={16} className="text-primary" /> Thông tin nhà hàng
              </h4>
              <div className="text-xs text-muted-foreground flex flex-col gap-1.5 mt-1">
                <span className="text-sm font-bold text-white block">{booking.restaurant?.name}</span>
                <span>{booking.restaurant?.address}</span>
                {booking.restaurant?.phoneNumber && (
                  <span className="mt-1 block">Điện thoại liên hệ: <strong className="text-white font-semibold">{booking.restaurant.phoneNumber}</strong></span>
                )}
              </div>
            </Card>

            {/* Booking Specifics */}
            <Card className="p-5 bg-card border-border flex flex-col gap-4 text-left">
              <h4 className="font-bold text-white text-sm border-b border-border/40 pb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                📅 Chi tiết cuộc hẹn đặt bàn
              </h4>
              
              <div className="flex flex-col gap-3.5 text-xs">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> Ngày dùng bữa:</span>
                  <span className="font-semibold text-white">{formattedDate}</span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={14} className="text-primary" /> Giờ dùng bữa:</span>
                  <span className="font-bold text-primary">{booking.bookingTime}</span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Users size={14} className="text-primary" /> Số lượng khách:</span>
                  <span className="font-semibold text-white">{booking.numberOfGuests} người</span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">🪑 Bàn được chọn:</span>
                  <span className="font-bold text-primary">
                    {booking.tableNumbers && booking.tableNumbers.length > 0
                      ? booking.tableNumbers.join(', ')
                      : 'Nhà hàng tự động xếp chỗ'}
                  </span>
                </div>

                {booking.occasion && (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Tag size={14} className="text-primary" /> Dịp đặc biệt:</span>
                    <span className="font-semibold text-white">{occasionLabels[booking.occasion] || booking.occasion}</span>
                  </div>
                )}

                {booking.specialRequests && (
                  <div className="flex flex-col gap-1 py-1 text-left">
                    <span className="text-muted-foreground flex items-center gap-1.5"><MessageSquare size={14} className="text-primary" /> Yêu cầu đặc biệt:</span>
                    <span className="text-white italic bg-secondary/30 p-2.5 border border-border rounded mt-1 leading-relaxed">&quot;{booking.specialRequests}&quot;</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Tiền đặt cọc bàn:</span>
                  <span className="font-bold text-white">
                    {booking.depositAmount > 0
                      ? `${new Intl.NumberFormat('vi-VN').format(booking.depositAmount)}đ`
                      : '0đ (Đặt chỗ miễn phí)'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Cancel Actions Button */}
            {canCancel() && (
              <Button
                variant="destructive"
                onClick={handleCancelClick}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white h-11 w-full text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Hủy đơn đặt bàn này
              </Button>
            )}

            {/* Review Section */}
            {booking.status === 'completed' && !booking.reviewed && (
              <div className="flex flex-col gap-3">
                {showReviewForm ? (
                  <ReviewForm
                    bookingId={booking.id}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      fetchBooking();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                ) : (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white h-11 w-full text-xs font-bold uppercase tracking-wider gap-2"
                  >
                    <Star size={14} />
                    Viết đánh giá cho nhà hàng
                  </Button>
                )}
              </div>
            )}

            {booking.status === 'completed' && booking.reviewed && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-xs text-emerald-400">
                <Star size={14} className="fill-emerald-400" />
                <span className="font-semibold">Bạn đã đánh giá đơn đặt bàn này</span>
              </div>
            )}
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-1">
            <StatusTimeline
              statusHistory={booking.statusHistory}
              currentStatus={booking.status}
            />
          </div>
        </div>
      </main>

      {/* Cancel Dialog Modal */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0 z-0" onClick={() => setShowCancelDialog(false)} />
          
          <Card className="relative z-10 w-full max-w-md p-6 bg-card border-border shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h4 className="font-bold text-rose-400 flex items-center gap-2 text-sm">
                <AlertTriangle size={18} /> Xác nhận hủy đặt bàn
              </h4>
              <button
                onClick={() => setShowCancelDialog(false)}
                className="p-1 rounded text-muted-foreground hover:text-white hover:bg-secondary transition focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-xs text-left">
              <p className="text-muted-foreground leading-relaxed">
                Bạn có chắc chắn muốn hủy đặt bàn này không? Hành động này sẽ gửi yêu cầu hủy và không thể tự hoàn tác.
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground font-semibold">Lý do hủy đặt bàn (tùy chọn):</label>
                <textarea
                  rows="3"
                  maxLength="200"
                  placeholder="Nhập lý do hủy đặt bàn..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40 text-xs">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isCancelling} className="border-border text-white hover:bg-secondary h-9 text-xs font-semibold">
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
