import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Armchair,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Store,
  Ticket,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { checkAvailability, createBooking } from '../../api/bookingApi';
import { getPublicRestaurantDetail } from '../../api/restaurantApi';
import { createPayment } from '../../api/paymentApi';
import ApplyVoucher from '../../components/booking/ApplyVoucher';
import PreOrderSelector from '../../components/booking/PreOrderSelector';
import Header from '../../components/Header';
import TableSelectionModal from '../../components/tables/TableSelectionModal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { cn } from '../../components/ui/utils';
import { useAuth } from '../../context/useAuth';

const FALLBACK_RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80';

const SLOT_INTERVAL_MINUTES = 30;
const MIN_BOOKING_ADVANCE_MINUTES = 30;
const MAX_BOOKING_ADVANCE_DAYS = 30;
const DEFAULT_OPERATING_HOURS = { open: '10:00', close: '22:00', closed: false };

const steps = [
  { num: 1, label: 'Thời gian', description: 'Ngày, giờ, số khách' },
  { num: 2, label: 'Chọn bàn', description: 'Gợi ý hoặc tự chọn' },
  { num: 3, label: 'Liên hệ', description: 'Thông tin người đặt' },
  { num: 4, label: 'Xác nhận', description: 'Kiểm tra lần cuối' },
];

const occasionOptions = [
  { value: 'birthday', label: 'Sinh nhật' },
  { value: 'anniversary', label: 'Kỷ niệm' },
  { value: 'business', label: 'Công việc' },
  { value: 'date', label: 'Hẹn hò' },
  { value: 'family', label: 'Gia đình' },
  { value: 'other', label: 'Khác' },
];

const occasionLabels = occasionOptions.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

function formatAddress(address) {
  if (!address) return 'Địa chỉ đang cập nhật';
  if (typeof address === 'string') return address;

  const direct =
    address.fullAddress ||
    address.formattedAddress ||
    address.displayAddress ||
    address.addressLine;

  if (direct) return direct;

  const parts = [
    address.street,
    address.ward,
    address.district,
    address.city,
    address.province,
    address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Địa chỉ đang cập nhật';
}

function formatCurrency(amount) {
  const value = Number(amount || 0);
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
}

function toDateInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
}

function getTodayString() {
  return toDateInputValue(new Date());
}

// Fixed 30 days maximum booking advance limit
function getMaxDateString() {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_BOOKING_ADVANCE_DAYS);
  return toDateInputValue(maxDate);
}

function toMinutes(value) {
  const [hour = 0, minute = 0] = String(value || '').split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  return hour * 60 + minute;
}

function getDateAtMinutes(dateValue, minutes) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

function getTableId(table) {
  return table?.id || table?._id || table?.tableNumber;
}

function getTableCapacity(table) {
  return Number(table?.capacity || 0);
}

function getSelectedCapacity(tables) {
  return tables.reduce((sum, table) => sum + getTableCapacity(table), 0);
}

function getDepositAmount(tables) {
  return tables.reduce((sum, table) => sum + Number(table?.depositAmount || 0), 0);
}

function formatBookingCode(id) {
  if (!id) return '#BOOKEAT';
  return `#${String(id).slice(-6).toUpperCase()}`;
}

export default function BookingFormPage() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [bookingDate, setBookingDate] = useState(() => getTodayString());
  const [bookingTime, setBookingTime] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [minBookableTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() + MIN_BOOKING_ADVANCE_MINUTES * 60 * 1000);
  });

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [suggestedTables, setSuggestedTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [checkingTables, setCheckingTables] = useState(false);
  const [tablesUnavailable, setTablesUnavailable] = useState(false);

  const [customerName, setCustomerName] = useState(user?.fullName || user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [occasion, setOccasion] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const [createdBooking, setCreatedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [preOrderItems, setPreOrderItems] = useState([]);

  const restaurantAddress = useMemo(() => formatAddress(restaurant?.address), [restaurant?.address]);
  const selectedCapacity = useMemo(() => getSelectedCapacity(selectedTables), [selectedTables]);
  const depositAmount = useMemo(() => getDepositAmount(selectedTables), [selectedTables]);
  const restaurantImage = restaurant?.coverImage || restaurant?.image || restaurant?.logo || FALLBACK_RESTAURANT_IMAGE;
  const cuisineText = Array.isArray(restaurant?.cuisineTypes)
    ? restaurant.cuisineTypes.join(', ')
    : restaurant?.cuisineType || restaurant?.cuisine || 'Ẩm thực chọn lọc';

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) {
      setLoadError('Không tìm thấy mã nhà hàng.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');

    try {
      const res = await getPublicRestaurantDetail(restaurantId);
      if (!res?.success) {
        throw new Error(res?.message || 'Không thể tải thông tin nhà hàng.');
      }

      setRestaurant(res.data?.restaurant || res.data);
    } catch (err) {
      console.error(err);
      setLoadError(err.message || 'Có lỗi xảy ra khi tải thông tin đặt bàn.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  useEffect(() => {
    if (!user) return;

    setCustomerName((current) => current || user.fullName || user.name || '');
    setCustomerPhone((current) => current || user.phoneNumber || user.phone || '');
    setCustomerEmail((current) => current || user.email || '');
  }, [user]);

  const getOperatingHoursForDate = useCallback((dateValue) => {
    const hoursConfig = restaurant?.operatingHours || restaurant?.openingHours;
    if (!dateValue || !hoursConfig) return DEFAULT_OPERATING_HOURS;

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysOfWeek[new Date(`${dateValue}T00:00:00`).getDay()];
    const dayHours = hoursConfig[dayName] || DEFAULT_OPERATING_HOURS;

    return {
      open: dayHours.open || dayHours.openTime || DEFAULT_OPERATING_HOURS.open,
      close: dayHours.close || dayHours.closeTime || DEFAULT_OPERATING_HOURS.close,
      closed: Boolean(dayHours.closed || dayHours.isClosed || dayHours.isOpen === false),
    };
  }, [restaurant]);

  const selectedDateHours = useMemo(
    () => getOperatingHoursForDate(bookingDate),
    [bookingDate, getOperatingHoursForDate]
  );

  const timeSlots = useMemo(() => {
    if (!bookingDate || selectedDateHours.closed) return [];

    let start = toMinutes(selectedDateHours.open);
    let end = toMinutes(selectedDateHours.close);
    if (end <= start) end += 24 * 60;

    const slots = [];
    for (let cursor = start; cursor <= end; cursor += SLOT_INTERVAL_MINUTES) {
      if (getDateAtMinutes(bookingDate, cursor) < minBookableTime) continue;

      const hour = Math.floor((cursor % (24 * 60)) / 60);
      const minute = cursor % 60;
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
    return slots;
  }, [bookingDate, minBookableTime, selectedDateHours]);

  useEffect(() => {
    if (bookingTime && timeSlots.length > 0 && !timeSlots.includes(bookingTime)) {
      setBookingTime('');
    }
  }, [bookingTime, timeSlots]);

  const validateStepOne = () => {
    const nextErrors = {};
    if (!bookingDate) nextErrors.bookingDate = 'Vui lòng chọn ngày dùng bữa.';
    if (!bookingTime) nextErrors.bookingTime = 'Vui lòng chọn giờ dùng bữa.';
    if (bookingDate && timeSlots.length === 0) nextErrors.bookingTime = 'Nhà hàng không phục vụ vào ngày đã chọn.';
    if (!numberOfGuests || numberOfGuests < 1) nextErrors.numberOfGuests = 'Số khách phải lớn hơn 0.';

    setFieldErrors((current) => ({
      ...current,
      bookingDate: nextErrors.bookingDate || null,
      bookingTime: nextErrors.bookingTime || null,
      numberOfGuests: nextErrors.numberOfGuests || null,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const isValidPhone = (value) => /^[0-9+\-\s()]{8,15}$/.test(value.trim());

  const validateContactInfo = () => {
    const nextErrors = {};
    if (!customerName.trim()) nextErrors.customerName = 'Vui lòng nhập họ tên.';
    if (!isValidPhone(customerPhone)) nextErrors.customerPhone = 'Số điện thoại không hợp lệ.';
    if (!isValidEmail(customerEmail)) nextErrors.customerEmail = 'Email không hợp lệ.';

    setFieldErrors((current) => ({
      ...current,
      customerName: nextErrors.customerName || null,
      customerPhone: nextErrors.customerPhone || null,
      customerEmail: nextErrors.customerEmail || null,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleCheckTables = async () => {
    if (!validateStepOne()) {
      toast.error('Vui lòng chọn ngày, giờ và số khách trước.');
      return;
    }

    setFieldErrors({});
    setCheckingTables(true);
    setTablesUnavailable(false);

    try {
      const res = await checkAvailability({
        restaurantId,
        bookingDate,
        bookingTime,
        numberOfGuests,
      });

      if (!res?.success) {
        throw new Error(res?.message || 'Không thể kiểm tra bàn trống.');
      }

      const availability = res.data || {};
      const nextAvailableTables = availability.availableTables || [];
      const nextSuggestedTables = availability.suggestedTables || [];

      setAvailableTables(nextAvailableTables);
      setSuggestedTables(nextSuggestedTables);
      setSelectedTables(nextSuggestedTables);
      setTablesUnavailable(!availability.available);
      setCurrentStep(2);

      if (!availability.available) {
        toast('Khung giờ này đã hết bàn phù hợp. Bạn có thể tham gia danh sách chờ.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể kiểm tra bàn trống tại thời điểm này.');
    } finally {
      setCheckingTables(false);
    }
  };

  const handleApplySuccess = ({ voucherCode, discountAmount }) => {
    setAppliedVoucher(voucherCode);
    setDiscountAmount(discountAmount || 0);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
  };

  const handleContactContinue = () => {
    if (!validateContactInfo()) {
      toast.error('Vui lòng kiểm tra lại thông tin liên hệ.');
      return;
    }

    setFieldErrors({});
    setCurrentStep(4);
  };

  const goToWaitlist = () => {
    navigate(`/restaurants/${restaurantId}/waitlist`, {
      state: {
        bookingDate,
        bookingTime,
        numberOfGuests,
        customerName,
        customerPhone,
        customerEmail,
        specialRequests,
      },
    });
  };

  const handleSubmitBooking = async () => {
    if (!validateStepOne() || !validateContactInfo()) {
      toast.error('Vui lòng kiểm tra lại thông tin đặt bàn.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        restaurantId,
        bookingDate,
        bookingTime,
        numberOfGuests,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        specialRequests: specialRequests.trim() || null,
        occasion: occasion || null,
        tableNumbers: selectedTables.map((table) => table.tableNumber).filter(Boolean),
        voucherCode: appliedVoucher,
        preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
      };

      const res = await createBooking(payload);
      if (!res?.success) {
        throw new Error(res?.message || 'Đặt bàn thất bại.');
      }

      const booking = res.data;
      setCreatedBooking(booking);

      // If deposit is required, initiate payment via PayOS
      if (booking.depositAmount > 0 && !booking.depositPaid) {
        setRedirectingToPayment(true);
        try {
          const paymentRes = await createPayment({
            targetType: 'booking',
            targetId: booking.id,
          });

          if (paymentRes.success && paymentRes.data?.checkoutUrl) {
            sessionStorage.setItem('lastBooking', JSON.stringify(booking));
            window.location.href = paymentRes.data.checkoutUrl;
            return;
          }
        } catch (paymentErr) {
          console.error('Payment initiation failed:', paymentErr);
        }
        // Fallback: payment failed, still show success card
        setRedirectingToPayment(false);
        toast.success('Đặt bàn thành công! Vui lòng thanh toán đặt cọc sau.');
      } else {
        toast.success('Đặt bàn thành công.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra khi tạo đặt bàn.');
      setRedirectingToPayment(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <BookingLoadingState />;
  }

  if (loadError || !restaurant) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-2xl mx-auto bg-card border-border p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold text-white">Không thể mở trang đặt bàn</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {loadError || 'Nhà hàng này chưa sẵn sàng nhận đặt bàn. Vui lòng thử lại sau.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" className="border-border text-white hover:bg-secondary" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Quay lại
              </Button>
              <Button className="bg-primary text-background hover:bg-primary/95" onClick={() => navigate('/restaurants')}>
                Xem nhà hàng khác
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Render PayOS redirect overlay
  if (redirectingToPayment) {
    return (
      <div className="min-h-screen w-full bg-[#0F1115] flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] p-8 bg-card border border-border rounded-2xl flex flex-col items-center gap-5 text-center shadow-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="font-serif text-2xl text-white font-bold tracking-tight">Đang chuyển hướng thanh toán...</h2>
          <p className="text-sm text-muted-foreground">Vui lòng không đóng hoặc tải lại trang này.</p>
          <p className="text-xs text-muted-foreground bg-secondary/35 p-3 rounded-lg border border-border/40">
            Bạn sẽ được chuyển đến cổng thanh toán PayOS để thanh toán tiền cọc.
          </p>
        </div>
      </div>
    );
  }

  if (createdBooking) {
    return (
      <BookingSuccessState
        booking={createdBooking}
        restaurant={restaurant}
        restaurantAddress={restaurantAddress}
        onHome={() => navigate('/')}
        onBookings={() => navigate('/my-bookings')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <button
          type="button"
          onClick={() => navigate(`/restaurants/${restaurantId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Quay về chi tiết nhà hàng
        </button>

        {/* No-show warning / block banner */}
        {user?.bookingBlockedUntil && new Date(user.bookingBlockedUntil) > new Date() ? (
          <div className="mb-6">
            <InfoPanel
              tone="danger"
              icon={AlertTriangle}
              title="Tài khoản đã bị tạm khóa đặt bàn"
              description={`Tài khoản của bạn đã bị tạm khóa do quá nhiều lần vắng mặt (no-show). Đặt bàn sẽ được mở lại sau ${new Date(user.bookingBlockedUntil).toLocaleDateString('vi-VN')}.`}
            />
          </div>
        ) : user?.noShowCounter >= 2 ? (
          <div className="mb-6">
            <InfoPanel
              tone="warning"
              icon={AlertTriangle}
              title="Cảnh báo: Bạn sắp bị cấm đặt bàn"
              description={`Bạn đã có ${user.noShowCounter} lần vắng mặt (no-show). Nếu thêm 1 lần nữa, tài khoản sẽ bị tạm khóa đặt bàn trong 30 ngày.`}
            />
          </div>
        ) : user?.noShowCounter >= 1 ? (
          <div className="mb-6">
            <InfoPanel
              tone="default"
              icon={Info}
              title="Thông tin về số lần vắng mặt (no-show)"
              description={`Bạn đã có ${user.noShowCounter} lần vắng mặt (no-show). Sau 3 lần vắng mặt, tài khoản sẽ bị tạm khóa đặt bàn.`}
            />
          </div>
        ) : null}

        <section className="relative overflow-hidden rounded-xl border border-border bg-card">
          <div className="absolute inset-0">
            <img src={restaurantImage} alt="" className="h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/55" />
          </div>

          <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="max-w-3xl space-y-5 flex flex-col items-start">
              <Badge className="bg-primary/10 text-primary border-primary/25 rounded-md px-3 py-1 uppercase tracking-[0.18em] text-[10px]">
                Đặt bàn BookEat
              </Badge>
              <div className="space-y-3 text-left">
                <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight text-white">
                  Giữ chỗ tại {restaurant.name}
                </h1>
                <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Chọn thời gian, bàn phù hợp và gửi yêu cầu xác nhận. Nhà hàng sẽ phản hồi trạng thái đặt bàn trong hệ thống BookEat.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card/70 px-3 py-2">
                  <Store size={15} className="text-primary" /> {cuisineText}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card/70 px-3 py-2">
                  <MapPin size={15} className="text-primary" /> {restaurantAddress}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/85 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-sm font-bold text-white">Xác nhận qua nhà hàng</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Booking mới sẽ ở trạng thái chờ duyệt, giúp nhà hàng kiểm tra bàn và liên hệ khi cần.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6">
            <StepProgress currentStep={currentStep} />

            {currentStep === 1 && (
              <Card className="bg-card border-border p-5 sm:p-6">
                <StepHeader
                  icon={CalendarIcon}
                  eyebrow="Bước 1"
                  title="Chọn ngày, giờ và số khách"
                  description="Các khung giờ được tạo từ lịch hoạt động hiện tại của nhà hàng."
                />

                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="space-y-2 text-left">
                      <label htmlFor="booking-date" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <CalendarIcon size={14} className="text-primary" /> Ngày dùng bữa
                      </label>
                      <Input
                        id="booking-date"
                        type="date"
                        min={getTodayString()}
                        max={getMaxDateString()}
                        value={bookingDate}
                        onChange={(event) => {
                          setBookingDate(event.target.value);
                          setFieldErrors((current) => ({ ...current, bookingDate: null, bookingTime: null }));
                          setBookingTime('');
                        }}
                        className={cn(
                          'h-11 bg-secondary/40 border-border text-white focus-visible:ring-primary/40',
                          fieldErrors.bookingDate && 'border-rose-500/60'
                        )}
                      />
                      <FieldError message={fieldErrors.bookingDate} />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Clock size={14} className="text-primary" /> Khung giờ ăn
                      </label>

                      {!bookingDate ? (
                        <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-5 text-sm text-muted-foreground">
                          Chọn ngày dùng bữa để xem các khung giờ đang nhận đặt bàn.
                        </div>
                      ) : timeSlots.length === 0 ? (
                        <InfoPanel
                          tone="danger"
                          icon={AlertTriangle}
                          title={selectedDateHours.closed ? 'Nhà hàng không phục vụ ngày này' : 'Không còn khung giờ phù hợp'}
                          description={
                            selectedDateHours.closed
                              ? 'Bạn có thể chọn một ngày khác trong vòng 30 ngày tới.'
                              : 'Các khung giờ còn lại hôm nay đã qua hoặc quá sát giờ dùng bữa. Vui lòng chọn ngày khác.'
                          }
                        />
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              aria-pressed={bookingTime === slot}
                              onClick={() => {
                                setBookingTime(slot);
                                setFieldErrors((current) => ({ ...current, bookingTime: null }));
                              }}
                              className={cn(
                                'h-10 rounded-md border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/45',
                                bookingTime === slot
                                  ? 'bg-primary text-background border-primary'
                                  : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-white'
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                      <FieldError message={fieldErrors.bookingTime} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/20 p-4 text-left">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Users size={14} className="text-primary" /> Số lượng khách
                        </label>
                        <p className="mt-1 text-sm text-muted-foreground">Nhà hàng sẽ dùng số khách để gợi ý bàn có sức chứa phù hợp.</p>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
                        <button
                          type="button"
                          aria-label="Giảm số khách"
                          disabled={numberOfGuests <= 1}
                          onClick={() => setNumberOfGuests((value) => Math.max(1, value - 1))}
                          className="h-9 w-9 rounded-md text-muted-foreground hover:bg-secondary hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Minus size={15} className="mx-auto" />
                        </button>
                        <span className="min-w-24 text-center text-sm font-bold text-white">{numberOfGuests} khách</span>
                        <button
                          type="button"
                          aria-label="Tăng số khách"
                          disabled={numberOfGuests >= 100}
                          onClick={() => setNumberOfGuests((value) => Math.min(100, value + 1))}
                          className="h-9 w-9 rounded-md text-muted-foreground hover:bg-secondary hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Plus size={15} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                    <FieldError message={fieldErrors.numberOfGuests} />
                  </div>
                </div>

                <StepActions>
                  <div />
                  <Button
                    type="button"
                    disabled={!bookingDate || !bookingTime || checkingTables}
                    onClick={handleCheckTables}
                    className="bg-primary hover:bg-primary/95 text-background font-bold h-11 px-5"
                  >
                    {checkingTables ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Đang kiểm tra bàn
                      </>
                    ) : (
                      <>
                        Kiểm tra bàn trống <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </StepActions>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-card border-border p-5 sm:p-6">
                <StepHeader
                  icon={Armchair}
                  eyebrow="Bước 2"
                  title="Chọn vị trí bàn ăn"
                  description="Bạn có thể dùng gợi ý của hệ thống hoặc để nhà hàng tự xếp bàn khi xác nhận."
                />

                <div className="grid gap-5">
                  {tablesUnavailable && (
                    <InfoPanel
                      tone="warning"
                      icon={AlertTriangle}
                      title="Khung giờ này đã hết bàn phù hợp"
                      description="Bạn có thể tham gia danh sách chờ để nhà hàng liên hệ khi có bàn trống."
                      action={
                        <Button onClick={goToWaitlist} className="bg-primary text-background hover:bg-primary/95">
                          Tham gia danh sách chờ
                        </Button>
                      }
                    />
                  )}

                  <div className="rounded-xl border border-border bg-secondary/20 p-5 text-left">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Bàn đã chọn</p>
                        <p className="text-sm text-muted-foreground">
                          Cần tối thiểu {numberOfGuests} chỗ, hiện đã chọn {selectedCapacity} chỗ.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-md border px-3 py-1',
                          selectedCapacity >= numberOfGuests
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        )}
                      >
                        {selectedCapacity >= numberOfGuests ? 'Đủ sức chứa' : 'Chưa đủ sức chứa'}
                      </Badge>
                    </div>

                    <div className="mt-4">
                      {selectedTables.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTables.map((table) => (
                            <Badge key={getTableId(table)} variant="secondary" className="gap-2 border border-border bg-card text-white px-3 py-1.5">
                              Bàn {table.tableNumber} ({getTableCapacity(table)} chỗ)
                              <button
                                type="button"
                                aria-label={`Bỏ chọn bàn ${table.tableNumber}`}
                                onClick={() => setSelectedTables((current) => current.filter((item) => getTableId(item) !== getTableId(table)))}
                                className="text-muted-foreground hover:text-rose-400"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
                          Chưa chọn bàn cụ thể. Nếu tiếp tục, nhà hàng sẽ tự xếp bàn phù hợp khi xác nhận.
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsTableModalOpen(true)}
                      className="mt-5 w-full border-border text-white hover:bg-secondary h-11"
                    >
                      <Search size={16} className="text-primary" />
                      {selectedTables.length > 0 ? 'Thay đổi bàn đã chọn' : 'Tự chọn bàn trực quan'}
                    </Button>
                  </div>
                </div>

                <StepActions>
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="border-border text-white hover:bg-secondary h-11">
                    <ArrowLeft size={16} /> Quay lại
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={tablesUnavailable || (selectedTables.length > 0 && selectedCapacity < numberOfGuests)}
                    className="bg-primary hover:bg-primary/95 text-background font-bold h-11 px-5"
                  >
                    Tiếp tục <ArrowRight size={16} />
                  </Button>
                </StepActions>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="bg-card border-border p-5 sm:p-6">
                <StepHeader
                  icon={Users}
                  eyebrow="Bước 3"
                  title="Thông tin liên hệ & đặt món trước"
                  description="Thông tin này giúp nhà hàng xác nhận và bạn có thể đặt trước các món ngon."
                />

                <div className="grid gap-5">
                  {restaurant && (
                    <div className="rounded-xl border border-border bg-secondary/20 p-4">
                      <PreOrderSelector
                        restaurantId={restaurantId}
                        bookingId={null}
                        onChange={(items) => setPreOrderItems(items)}
                      />
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 text-left">
                    <FormField label="Họ và tên người đặt" htmlFor="customer-name" required error={fieldErrors.customerName}>
                      <Input
                        id="customer-name"
                        value={customerName}
                        onChange={(event) => {
                          setCustomerName(event.target.value);
                          setFieldErrors((current) => ({ ...current, customerName: null }));
                        }}
                        placeholder="Nhập họ tên"
                        className={cn('h-11 bg-secondary/40 border-border text-white focus-visible:ring-primary/40', fieldErrors.customerName && 'border-rose-500/60')}
                      />
                    </FormField>

                    <FormField label="Số điện thoại" htmlFor="customer-phone" required error={fieldErrors.customerPhone}>
                      <Input
                        id="customer-phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(event) => {
                          setCustomerPhone(event.target.value);
                          setFieldErrors((current) => ({ ...current, customerPhone: null }));
                        }}
                        placeholder="Nhập số điện thoại"
                        className={cn('h-11 bg-secondary/40 border-border text-white focus-visible:ring-primary/40', fieldErrors.customerPhone && 'border-rose-500/60')}
                      />
                    </FormField>
                  </div>

                  <FormField label="Email nhận thông tin đặt bàn" htmlFor="customer-email" required error={fieldErrors.customerEmail} className="text-left">
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(event) => {
                        setCustomerEmail(event.target.value);
                        setFieldErrors((current) => ({ ...current, customerEmail: null }));
                      }}
                      placeholder="ten@email.com"
                      className={cn('h-11 bg-secondary/40 border-border text-white focus-visible:ring-primary/40', fieldErrors.customerEmail && 'border-rose-500/60')}
                    />
                  </FormField>

                  <div className="space-y-2 text-left">
                    <label className="text-sm font-semibold text-white">Dịp đặc biệt</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {occasionOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setOccasion((current) => (current === item.value ? '' : item.value))}
                          className={cn(
                            'h-10 rounded-md border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40',
                            occasion === item.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-secondary/35 text-muted-foreground hover:bg-secondary hover:text-white'
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label htmlFor="special-requests" className="text-sm font-semibold text-white">
                      Yêu cầu đặc biệt
                    </label>
                    <textarea
                      id="special-requests"
                      rows={4}
                      maxLength={500}
                      value={specialRequests}
                      onChange={(event) => setSpecialRequests(event.target.value)}
                      placeholder="Ví dụ: bàn yên tĩnh, gần cửa sổ, ghế trẻ em, dị ứng thực phẩm..."
                      className="w-full rounded-md border border-border bg-secondary/40 p-3 text-sm text-white placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <div className="text-right text-xs text-muted-foreground">{specialRequests.length}/500 ký tự</div>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/20 p-4 text-left">
                    <ApplyVoucher
                      restaurantId={restaurantId}
                      bookingAmount={depositAmount}
                      onApplySuccess={handleApplySuccess}
                      onRemove={handleRemoveVoucher}
                    />
                  </div>
                </div>

                <StepActions>
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="border-border text-white hover:bg-secondary h-11">
                    <ArrowLeft size={16} /> Quay lại
                  </Button>
                  <Button onClick={handleContactContinue} className="bg-primary hover:bg-primary/95 text-background font-bold h-11 px-5">
                    Xem tóm tắt <ArrowRight size={16} />
                  </Button>
                </StepActions>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="bg-card border-border p-5 sm:p-6">
                <StepHeader
                  icon={CheckCircle2}
                  eyebrow="Bước 4"
                  title="Kiểm tra và xác nhận"
                  description="Xem lại thông tin trước khi gửi yêu cầu đến nhà hàng."
                />

                <div className="mt-4">
                  <SummaryPanel
                    restaurant={restaurant}
                    restaurantAddress={restaurantAddress}
                    bookingDate={bookingDate}
                    bookingTime={bookingTime}
                    numberOfGuests={numberOfGuests}
                    selectedTables={selectedTables}
                    customerName={customerName}
                    customerPhone={customerPhone}
                    customerEmail={customerEmail}
                    specialRequests={specialRequests}
                    occasion={occasion}
                    appliedVoucher={appliedVoucher}
                    discountAmount={discountAmount}
                  />
                </div>

                <div className="mt-4">
                  <InfoPanel
                    icon={Info}
                    title="Lưu ý trước khi gửi"
                    description="Yêu cầu đặt bàn sẽ được gửi ở trạng thái chờ duyệt. Nhà hàng có thể xác nhận, đổi bàn hoặc liên hệ bạn nếu cần thêm thông tin."
                  />
                </div>

                <StepActions>
                  <Button variant="outline" onClick={() => setCurrentStep(3)} disabled={isSubmitting} className="border-border text-white hover:bg-secondary h-11">
                    <ArrowLeft size={16} /> Quay lại
                  </Button>
                  <Button
                    onClick={handleSubmitBooking}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/95 text-background font-bold h-11 px-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Đang gửi yêu cầu
                      </>
                    ) : (
                      <>
                        Xác nhận đặt bàn <Check size={16} />
                      </>
                    )}
                  </Button>
                </StepActions>
              </Card>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            <BookingAside
              restaurant={restaurant}
              restaurantAddress={restaurantAddress}
              currentStep={currentStep}
              bookingDate={bookingDate}
              bookingTime={bookingTime}
              numberOfGuests={numberOfGuests}
              selectedTables={selectedTables}
              depositAmount={depositAmount}
              discountAmount={discountAmount}
              appliedVoucher={appliedVoucher}
            />
          </aside>
        </div>
      </main>

      <TableSelectionModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tables={availableTables}
        suggestedTables={suggestedTables}
        selectedTables={selectedTables}
        onConfirm={(tables) => setSelectedTables(tables)}
        numberOfGuests={numberOfGuests}
      />
    </div>
  );
}

function BookingLoadingState() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-36 rounded bg-secondary" />
            <div className="space-y-3">
              <div className="h-10 w-full max-w-xl rounded bg-secondary" />
              <div className="h-4 w-full max-w-2xl rounded bg-secondary/80" />
              <div className="h-4 w-2/3 rounded bg-secondary/70" />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-20 rounded-xl bg-secondary/60" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingSuccessState({ booking, restaurant, restaurantAddress, onHome, onBookings }) {
  const bookingDateText = booking?.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Ngày dùng bữa';

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto bg-card border-border p-6 sm:p-8 text-center shadow-2xl">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Check size={34} />
          </div>
          <div className="space-y-4 my-4">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Đặt bàn thành công</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yêu cầu của bạn đã được gửi đến nhà hàng. Trạng thái hiện tại là chờ duyệt.
            </p>
          </div>

          <div className="w-full rounded-xl border border-border bg-secondary/25 p-5 text-left mb-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Mã đặt bàn" value={formatBookingCode(booking?.id || booking?._id)} mono />
              <DetailRow label="Trạng thái" value="Chờ duyệt" accent />
              <DetailRow label="Nhà hàng" value={restaurant?.name || 'Nhà hàng'} />
              <DetailRow label="Thời gian" value={`${booking?.bookingTime || ''} - ${bookingDateText}`} />
              <DetailRow label="Số khách" value={`${booking?.numberOfGuests || 0} người`} />
              <DetailRow label="Địa chỉ" value={restaurantAddress} />
            </div>
            {booking?.tableNumbers?.length > 0 && (
              <div className="mt-4 border-t border-border/60 pt-4">
                <DetailRow label="Bàn đã chọn" value={booking.tableNumbers.join(', ')} accent />
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={onHome} className="border-border text-white hover:bg-secondary h-11">
              Về trang chủ
            </Button>
            <Button onClick={onBookings} className="bg-primary hover:bg-primary/95 text-background font-bold h-11">
              Đơn đặt của tôi
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

function StepProgress({ currentStep }) {
  return (
    <nav aria-label="Tiến trình đặt bàn" className="rounded-xl border border-border bg-card p-3 sm:p-4 animate-fade-in">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <Fragment key={step.num}>
            {index > 0 && (
              <div className={cn('mx-2 h-px flex-1 sm:mx-4', currentStep >= step.num ? 'bg-primary' : 'bg-border')} />
            )}
            <div className="flex min-w-0 flex-col items-center gap-2 sm:flex-row">
              <div
                className={cn(
                  'h-9 w-9 rounded-full border flex items-center justify-center text-sm font-bold transition-colors',
                  currentStep >= step.num
                    ? 'border-primary bg-primary text-background'
                    : 'border-border bg-secondary/40 text-muted-foreground'
                )}
              >
                {currentStep > step.num ? <Check size={16} /> : step.num}
              </div>
              <div className="hidden min-w-0 sm:block text-left">
                <p className={cn('text-sm font-bold', currentStep >= step.num ? 'text-white' : 'text-muted-foreground')}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </nav>
  );
}

function StepHeader({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="flex items-start gap-4 border-b border-border/70 pb-5">
      <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon size={22} />
      </div>
      <div className="space-y-1 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepActions({ children }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

// Fixed missing custom class compatibility
function FormField({ label, htmlFor, required, error, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-white">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs font-semibold text-rose-400 mt-1">{message}</p>;
}

function InfoPanel({ icon: Icon = Info, title, description, action, tone = 'default' }) {
  const toneClass = {
    default: 'border-border bg-secondary/25 text-muted-foreground',
    warning: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
    danger: 'border-rose-500/25 bg-rose-500/10 text-rose-100',
  }[tone];

  const iconClass = {
    default: 'text-primary',
    warning: 'text-amber-400',
    danger: 'text-rose-400',
  }[tone];

  return (
    <div className={cn('rounded-xl border p-4 text-left', toneClass)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconClass)} />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

function SummaryPanel({
  restaurant,
  restaurantAddress,
  bookingDate,
  bookingTime,
  numberOfGuests,
  selectedTables,
  customerName,
  customerPhone,
  customerEmail,
  specialRequests,
  occasion,
  appliedVoucher,
  discountAmount,
}) {
  const formattedDate = bookingDate
    ? new Date(`${bookingDate}T00:00:00`).toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Chưa chọn ngày';

  const depositAmount = getDepositAmount(selectedTables);

  return (
    <section className="rounded-xl border border-border bg-secondary/20 p-5 text-left">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Store size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{restaurant?.name || 'Nhà hàng'}</p>
          <p className="text-xs text-muted-foreground truncate">{restaurantAddress}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <DetailRow label="Ngày dùng bữa" value={formattedDate} />
        <DetailRow label="Giờ dùng bữa" value={bookingTime || 'Chưa chọn'} accent />
        <DetailRow label="Số khách" value={`${numberOfGuests} người`} />
        <DetailRow
          label="Bàn"
          value={selectedTables.length > 0 ? selectedTables.map((table) => table.tableNumber).join(', ') : 'Nhà hàng tự xếp'}
          accent={selectedTables.length > 0}
        />
        <DetailRow label="Người đặt" value={customerName || 'Chưa nhập'} />
        <DetailRow label="Số điện thoại" value={customerPhone || 'Chưa nhập'} />
        <DetailRow label="Email" value={customerEmail || 'Chưa nhập'} />
        <DetailRow label="Dịp đặc biệt" value={occasion ? occasionLabels[occasion] : 'Không có'} />
      </div>

      {(specialRequests || appliedVoucher || depositAmount > 0) && (
        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          {specialRequests && <DetailRow label="Yêu cầu đặc biệt" value={specialRequests} />}
          {appliedVoucher && <DetailRow label={`Voucher ${appliedVoucher}`} value={`-${formatCurrency(discountAmount)}`} success />}
          <DetailRow label="Tiền cọc dự kiến" value={depositAmount > 0 ? formatCurrency(Math.max(depositAmount - discountAmount, 0)) : '0đ'} accent />
        </div>
      )}
    </section>
  );
}

function BookingAside({
  restaurant,
  restaurantAddress,
  currentStep,
  bookingDate,
  bookingTime,
  numberOfGuests,
  selectedTables,
  depositAmount,
  discountAmount,
  appliedVoucher,
}) {
  const currentStepMeta = steps.find((step) => step.num === currentStep);
  const finalDeposit = Math.max(depositAmount - discountAmount, 0);

  return (
    <Card className="bg-card border-border p-5 text-left">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Tóm tắt</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-white">Thông tin đặt bàn</h2>
        </div>

        <div className="rounded-xl border border-border bg-secondary/20 p-4">
          <p className="text-sm font-bold text-white truncate">{restaurant?.name || 'Nhà hàng'}</p>
          <p className="mt-1 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <MapPin size={13} className="text-primary shrink-0 mt-0.5" /> {restaurantAddress}
          </p>
        </div>

        <div className="space-y-3">
          <DetailRow label="Bước hiện tại" value={currentStepMeta?.label || 'Đặt bàn'} accent />
          <DetailRow label="Ngày" value={bookingDate || 'Chưa chọn'} />
          <DetailRow label="Giờ" value={bookingTime || 'Chưa chọn'} />
          <DetailRow label="Số khách" value={`${numberOfGuests} người`} />
          <DetailRow
            label="Bàn"
            value={selectedTables.length > 0 ? selectedTables.map((table) => table.tableNumber).join(', ') : 'Chưa chọn'}
          />
        </div>

        <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Ticket size={16} className="text-primary" /> Chi phí dự kiến
          </div>
          <DetailRow label="Tiền cọc" value={formatCurrency(depositAmount)} />
          {appliedVoucher && <DetailRow label="Voucher" value={`-${formatCurrency(discountAmount)}`} success />}
          <div className="border-t border-border/60 pt-3">
            <DetailRow label="Tạm tính" value={formatCurrency(finalDeposit)} accent />
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Số tiền cọc có thể bằng 0 nếu nhà hàng không yêu cầu đặt cọc cho bàn đã chọn.
        </p>
      </div>
    </Card>
  );
}

function DetailRow({ label, value, accent, success, mono }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-sm font-semibold text-white break-words',
          accent && 'text-primary',
          success && 'text-emerald-400',
          mono && 'font-mono'
        )}
      >
        {value}
      </p>
    </div>
  );
}
