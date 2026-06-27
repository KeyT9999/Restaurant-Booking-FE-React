import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../../api/bookingApi';
import { createPayment } from '../../api/paymentApi';
import StatusBadge from '../../components/booking/StatusBadge';
import StatusTimeline from '../../components/booking/StatusTimeline';
import ReviewForm from '../../components/review/ReviewForm';
import RescheduleModal from '../../components/booking/RescheduleModal';
import {
  ArrowLeft,
  Store,
  Clock,
  Users,
  Tag,
  MessageSquare,
  AlertTriangle,
  X,
  Star,
  RefreshCw,
  QrCode,
  ChevronRight,
  MapPin,
  Phone,
  TicketPercent,
  Loader2,
} from 'lucide-react';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import SafeImage from '../../components/common/SafeImage';
import { getRestaurantCoverImage, getRestaurantLogoImage } from '../../utils/restaurantImages';
import toast from 'react-hot-toast';

const occasionLabels = {
  birthday: '🎂 Sinh nhật',
  anniversary: '💍 Kỷ niệm',
  business: '💼 Công việc',
  date: '💑 Hẹn hò',
  family: '👨‍👩‍👧‍👦 Gia đình',
  other: '🎯 Khác',
};

const formatAddress = (address) => {
  if (!address) return 'Chưa cập nhật';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    if (address.fullAddress && typeof address.fullAddress === 'string') {
      return address.fullAddress;
    }
    return [
      address.street,
      address.ward,
      address.district,
      address.city,
    ].filter(Boolean).join(', ') || 'Chưa cập nhật';
  }
  return String(address);
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const handlePayDeposit = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const res = await createPayment({
        targetType: 'booking',
        targetId: booking.id || booking._id,
      });

      if (res.success && res.data?.checkoutUrl) {
        toast.success('Đang chuyển hướng sang cổng thanh toán PayOS...');
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error(res.message || 'Không thể tạo link thanh toán.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tạo link thanh toán.');
    } finally {
      setPaying(false);
    }
  };

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

  let dayName;
  let dayNum;
  let monthName;
  let yearNum;
  let heroImage;
  let logoImage;
  let bookingCode;
  let occasionLabel;
  let preOrderTotal;
  let finalAmount;
  let checkedInTime;
  let depositPaidTime;
  let restaurantAddress;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  try {
    const bDateObj = new Date(booking.bookingDate);
    dayName = bDateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
    dayNum = bDateObj.getDate();
    monthName = bDateObj.toLocaleDateString('vi-VN', { month: 'long' });
    yearNum = bDateObj.getFullYear();

    heroImage = getRestaurantCoverImage(booking.restaurant);
    logoImage = getRestaurantLogoImage(booking.restaurant);
    restaurantAddress = formatAddress(booking.restaurant?.address);

    bookingCode = (booking.id || booking._id || '').substring(18).toUpperCase();
    occasionLabel = booking.occasion ? (occasionLabels[booking.occasion] || booking.occasion) : null;
    preOrderTotal = booking.preOrderItems ? booking.preOrderItems.reduce((sum, item) => sum + (item.priceSnapshot || 0) * (item.quantity || 1), 0) : 0;
    finalAmount = Math.max(0, preOrderTotal - (booking.discountAmount || 0) - (booking.depositPaid ? (booking.depositAmount || 0) : 0));
    checkedInTime = booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : null;
    depositPaidTime = booking.depositPaidAt ? new Date(booking.depositPaidAt).toLocaleString('vi-VN') : null;
  } catch (err) {
    console.error('Computation error:', err);
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <AlertTriangle className="h-12 w-12 text-rose-500 animate-bounce" />
          <h2 className="text-xl font-bold text-white">Đã xảy ra lỗi hiển thị</h2>
          <p className="text-xs text-muted-foreground max-w-lg bg-secondary/50 p-4 rounded-lg border border-border font-mono whitespace-pre-wrap text-left">
            {err.stack || err.message}
          </p>
          <Button onClick={() => window.location.reload()} className="bg-primary text-background font-bold text-xs h-10 px-5">
            Tải lại trang
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      {/* Cover Image Banner */}
      <section className="relative h-64 sm:h-80 bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/35 z-10" />
        <SafeImage
          className="w-full h-full object-cover"
          src={heroImage}
          alt={booking.restaurant?.name || 'Restaurant cover'}
          fallback={(
            <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(212,150,83,0.15),transparent_30%),linear-gradient(135deg,#20242D,#0F1115)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Store className="h-8 w-8" />
              </div>
            </div>
          )}
        />

        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-6 flex flex-col justify-end h-full">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 justify-start">
            <span className="cursor-pointer hover:text-white transition" onClick={() => navigate('/')}>Trang chủ</span>
            <ChevronRight size={12} />
            <span className="cursor-pointer hover:text-white transition" onClick={() => navigate('/my-bookings')}>Đặt bàn của tôi</span>
            <ChevronRight size={12} />
            <span className="text-white truncate max-w-[200px]">Chi tiết đơn #{bookingCode}</span>
          </div>

          {/* Title and details block */}
          <div className="flex items-end gap-4 text-left">
            <SafeImage
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover bg-card border border-border/80 shadow-2xl flex-shrink-0"
              src={logoImage}
              alt={`${booking.restaurant?.name || ''} logo`}
              fallback={(
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-card border border-border/80 shadow-2xl flex-shrink-0 flex items-center justify-center text-primary">
                  <Store className="h-6 w-6" />
                </div>
              )}
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs text-primary font-bold uppercase tracking-wider">Chi tiết đơn đặt bàn</span>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {booking.restaurant?.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                <StatusBadge status={booking.status} />
                <span className="text-xs text-muted-foreground">
                  Mã đặt bàn: <strong className="font-mono text-white">#{bookingCode}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col gap-6">
        {/* Back and Title Row */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/my-bookings')}
            className="border-border hover:bg-secondary text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} /> Quay lại danh sách đặt bàn
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Details, pre-orders, and notes */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Premium Booking Ticket */}
            <Card className="bg-card border-border rounded-xl relative overflow-hidden flex flex-col md:flex-row text-left">
              {/* Ticket left/top calendar part */}
              <div className="flex md:flex-col items-center justify-center p-6 bg-secondary/35 border-b md:border-b-0 md:border-r border-border md:w-44 flex-shrink-0 gap-3 md:gap-1 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{monthName}</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight my-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {dayNum}
                </span>
                <span className="text-xs text-muted-foreground capitalize font-medium">{dayName}, {yearNum}</span>
              </div>

              {/* Ticket right/main details part */}
              <div className="p-6 flex-1 flex flex-col gap-4">
                <h3 className="text-base font-bold text-white tracking-wide border-b border-border/40 pb-2 flex items-center gap-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                  🎫 Thông tin buổi hẹn
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={13} className="text-primary" /> Giờ đặt bàn</span>
                    <span className="font-bold text-primary text-sm">{booking.bookingTime}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Users size={13} className="text-primary" /> Số lượng khách</span>
                    <span className="font-semibold text-white text-sm">{booking.numberOfGuests} khách</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">🪑 Bàn được chọn</span>
                    <span className="font-semibold text-white text-sm">
                      {booking.tableNumbers && booking.tableNumbers.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {booking.tableNumbers.map((num, i) => (
                            <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                              Bàn {num}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs block mt-0.5">Nhà hàng xếp bàn khi đến</span>
                      )}
                    </span>
                  </div>

                  {occasionLabel && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Tag size={13} className="text-primary" /> Dịp đặc biệt</span>
                      <span className="font-semibold text-white text-sm mt-0.5">{occasionLabel}</span>
                    </div>
                  )}
                </div>

                {booking.specialRequests && (
                  <div className="border-t border-border/40 pt-3 mt-1 text-left">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1"><MessageSquare size={12} className="text-primary" /> Yêu cầu đặc biệt:</span>
                    <p className="text-xs text-white italic mt-1.5 bg-secondary/20 p-3 rounded-lg border border-border/40 relative leading-relaxed pl-6">
                      <span className="absolute left-2.5 top-2 text-primary text-xl font-serif">“</span>
                      {booking.specialRequests}
                      <span className="text-primary text-xl font-serif">”</span>
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Pre-order menu items */}
            {booking.preOrderItems && booking.preOrderItems.length > 0 && (
              <Card className="p-6 bg-card border-border flex flex-col gap-4 text-left">
                <h3 className="text-base font-bold text-white tracking-wide border-b border-border/40 pb-3 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  🍽️ Thực đơn món ăn đã đặt trước
                </h3>
                
                <div className="flex flex-col gap-3 mt-1">
                  {booking.preOrderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-border/30 last:border-0 last:pb-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-white text-sm">{item.nameSnapshot}</span>
                        {item.note && <span className="text-[10px] text-muted-foreground italic">Ghi chú: {item.note}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground text-[11px]">x{item.quantity}</span>
                        <span className="font-bold text-white w-20 text-right">{formatPrice(item.priceSnapshot * item.quantity)}</span>
                      </div>
                    </div>
                  ))}

                  {/* Receipt pricing summary */}
                  <div className="border-t border-border/60 pt-4 mt-2 flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Tạm tính món ăn:</span>
                      <span className="font-medium text-white">
                        {formatPrice(preOrderTotal)}
                      </span>
                    </div>

                    {booking.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span className="flex items-center gap-1"><TicketPercent size={13} /> Giảm giá ({booking.voucherCode}):</span>
                        <span className="font-bold">-{formatPrice(booking.discountAmount)}</span>
                      </div>
                    )}

                    {booking.depositAmount > 0 && (
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Đã trả cọc bàn:</span>
                        <span className="font-medium text-white">-{formatPrice(booking.depositAmount)}</span>
                      </div>
                    )}

                    <div className="border-t border-border/40 pt-3 flex justify-between items-center font-bold text-sm">
                      <span className="text-white">Tổng thanh toán tại nhà hàng:</span>
                      <strong className="text-primary text-base">
                        {formatPrice(finalAmount)}
                      </strong>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Restaurant Detail Card */}
            <Card className="p-6 bg-card border-border flex flex-col gap-4 text-left">
              <h3 className="text-base font-bold text-white tracking-wide border-b border-border/40 pb-3 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Store size={16} className="text-primary" /> Thông tin nhà hàng
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-start mt-1">
                <SafeImage
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover bg-card border border-border flex-shrink-0"
                  src={logoImage}
                  alt={booking.restaurant?.name}
                  fallback={<div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-primary"><Store size={24} /></div>}
                />
                <div className="text-xs text-muted-foreground flex-1 flex flex-col gap-2">
                  <span className="text-base font-bold text-white block leading-tight">{booking.restaurant?.name}</span>
                  <span className="flex items-start gap-1.5"><MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" /> {restaurantAddress}</span>
                  {booking.restaurant?.phoneNumber && (
                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary flex-shrink-0" /> Số điện thoại: <strong className="text-white font-semibold">{booking.restaurant.phoneNumber}</strong></span>
                  )}
                  {booking.restaurant?.operatingHours && (
                    <span className="flex items-center gap-1.5">⏰ Giờ hoạt động: <strong className="text-white font-semibold">{booking.restaurant.operatingHours.monday?.open || '06:00'} - {booking.restaurant.operatingHours.monday?.close || '22:00'}</strong></span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Actions, Status, Timeline & QR check-in */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Direct QR check-in */}
            {booking.status === 'confirmed' && !booking.checkedInAt && (
              <Card className="p-5 bg-card border-border flex flex-col gap-4 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Mã QR Check-in nhanh</span>
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-2 rounded-xl border border-border/85 shadow-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`bookeat://checkin?bookingId=${booking.id || booking._id}`)}`}
                      alt="QR Check-in"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed px-2">
                    Đưa mã QR này cho nhân viên nhà hàng khi bạn đến để hoàn tất check-in bàn.
                  </p>
                </div>
              </Card>
            )}

            {/* Check-in status badge if checked-in */}
            {checkedInTime && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-emerald-400 text-sm font-bold flex items-center justify-center gap-1.5 animate-pulse">
                <span>✅ Đã check-in lúc {checkedInTime}</span>
              </div>
            )}

            {/* Deposit Payment Card */}
            <Card className="p-5 bg-card border-border flex flex-col gap-3 text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Thông tin đặt cọc</span>
              {booking.depositAmount > 0 ? (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Tiền cọc giữ chỗ:</span>
                    <span className="font-bold text-white">{formatPrice(booking.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2.5 mt-1">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    {booking.depositPaid ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 font-bold text-[10px] uppercase">Đã thanh toán</Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 font-bold text-[10px] uppercase">Chưa thanh toán</Badge>
                    )}
                  </div>
                  {depositPaidTime && (
                    <span className="text-[10px] text-muted-foreground block text-right mt-1">
                      Thanh toán lúc: {depositPaidTime}
                    </span>
                  )}
                  {!booking.depositPaid && booking.status === 'pending' && (
                    <Button
                      onClick={handlePayDeposit}
                      disabled={paying}
                      className="w-full mt-3 bg-primary hover:bg-primary/95 text-background font-bold text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {paying ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Đang xử lý...
                        </>
                      ) : (
                        'Thanh toán đặt cọc qua PayOS'
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400 font-semibold">
                  <span>🍽️ Miễn phí đặt cọc giữ chỗ</span>
                </div>
              )}
            </Card>

            {/* Cancel detailed info */}
            {booking.status === 'cancelled' && (
              <Card className="p-5 bg-rose-500/5 border border-rose-500/15 rounded-xl text-left flex flex-col gap-2">
                <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Thông tin hủy đặt bàn</span>
                <div className="text-xs text-muted-foreground flex flex-col gap-1.5 mt-1 leading-relaxed">
                  <p className="text-white italic">&quot;{booking.cancellationReason || 'Không có lý do chi tiết'}&quot;</p>
                  <span className="text-[10px] text-muted-foreground/80 mt-1 capitalize border-t border-border/40 pt-1.5">
                    Hủy bởi: {booking.cancelledBy === 'customer' ? 'Khách hàng' : booking.cancelledBy === 'restaurant' ? 'Nhà hàng' : 'Quản trị viên'}
                  </span>
                </div>
              </Card>
            )}

            {/* Status Timeline */}
            <StatusTimeline
              statusHistory={booking.statusHistory}
              currentStatus={booking.status}
            />

            {/* Quick Actions Panel */}
            <Card className="p-5 bg-card border-border flex flex-col gap-3 text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Thao tác hỗ trợ</span>
              <div className="flex flex-col gap-2 mt-1">
                {/* Chat with restaurant is always nice to have */}
                <Button
                  variant="outline"
                  className="w-full text-xs border-border text-white hover:bg-secondary h-10 gap-1.5 justify-center font-semibold cursor-pointer"
                  onClick={() => navigate('/chat', { state: { restaurantId: booking.restaurantId, bookingId: booking.id || booking._id } })}
                >
                  <MessageSquare size={14} className="text-primary" /> Chat với nhà hàng
                </Button>
                
                {/* Reschedule option */}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <Button
                    variant="outline"
                    className="w-full text-xs border-border text-white hover:bg-secondary h-10 gap-1.5 justify-center font-semibold cursor-pointer"
                    onClick={() => setShowRescheduleModal(true)}
                  >
                    <RefreshCw size={14} className="text-primary" /> Đổi lịch dùng bữa
                  </Button>
                )}

                {/* Cancel option */}
                {canCancel() && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelClick}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white h-10 w-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Hủy đơn đặt bàn
                  </Button>
                )}

                {/* Review action */}
                {booking.status === 'completed' && !booking.reviewed && (
                  <div className="flex flex-col gap-2 mt-1">
                    {showReviewForm ? (
                      <ReviewForm
                        bookingId={booking.id || booking._id}
                        onSuccess={() => {
                          setShowReviewForm(false);
                          fetchBooking();
                        }}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    ) : (
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-primary hover:bg-primary/95 text-background h-10 w-full text-xs font-bold uppercase tracking-wider gap-1.5 cursor-pointer font-semibold"
                      >
                        <Star size={14} className="fill-background" /> Viết đánh giá
                      </Button>
                    )}
                  </div>
                )}

                {booking.status === 'completed' && booking.reviewed && (
                  <div className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-xs text-emerald-400 font-semibold mt-1">
                    <Star size={13} className="fill-emerald-400" />
                    <span>Đã viết đánh giá</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0 z-0" onClick={() => setShowQR(false)} />
          <Card className="relative z-10 w-full max-w-sm p-6 bg-card border-border shadow-2xl flex flex-col gap-4 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                <QrCode size={18} className="text-primary" /> Mã QR Check-in
              </h4>
              <button
                onClick={() => setShowQR(false)}
                className="p-1 rounded text-muted-foreground hover:text-white hover:bg-secondary transition focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`bookeat://checkin?bookingId=${booking._id}`)}`}
                alt="QR Check-in"
                className="rounded-lg border border-border bg-white p-2"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đưa mã QR này cho nhân viên nhà hàng khi bạn đến để thực hiện check-in nhanh chóng.
              </p>
            </div>
            <Button onClick={() => setShowQR(false)} className="bg-primary text-background font-bold text-xs h-10 w-full">
              Đóng
            </Button>
          </Card>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <RescheduleModal
          booking={booking}
          onClose={() => setShowRescheduleModal(false)}
          onSuccess={(updated) => {
            setBooking((prev) => ({ ...prev, ...updated }));
            fetchBooking();
          }}
        />
      )}

      {/* Cancel Confirmation Dialog */}
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
