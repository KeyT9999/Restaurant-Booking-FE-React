import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Users, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { getPublicRestaurantDetail } from '../../api/restaurantApi';
import { checkAvailability, createBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/useAuth';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';
import TableSelectionModal from '../../components/tables/TableSelectionModal';
import ApplyVoucher from '../../components/booking/ApplyVoucher';
import toast from 'react-hot-toast';
import './BookingFormPage.css';

export default function BookingFormPage() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  
  // Table selection states
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [suggestedTables, setSuggestedTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [checkingTables, setCheckingTables] = useState(false);
  const [tablesUnavailable, setTablesUnavailable] = useState(false);

  // Additional info states
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [occasion, setOccasion] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  // Success state
  const [createdBooking, setCreatedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch restaurant details on load
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await getPublicRestaurantDetail(restaurantId);
        if (res.success) {
          setRestaurant(res.data);
        } else {
          toast.error(res.message || 'Không thể tải thông tin nhà hàng');
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi tải thông tin nhà hàng');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [restaurantId, navigate]);

  // Sync user details when loaded
  useEffect(() => {
    if (!user) return undefined;

    const timeoutId = window.setTimeout(() => {
      if (!customerName) setCustomerName(user.fullName || '');
      if (!customerPhone) setCustomerPhone(user.phoneNumber || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [customerEmail, customerName, customerPhone, user]);

  const getOperatingHoursForDate = useCallback((dateValue) => {
    const fallback = { open: '10:00', close: '22:00', closed: false };
    if (!dateValue || !restaurant?.operatingHours) return fallback;

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysOfWeek[new Date(`${dateValue}T00:00:00`).getDay()];
    return restaurant.operatingHours[dayName] || fallback;
  }, [restaurant]);

  const timeSlots = useMemo(() => {
    const hours = getOperatingHoursForDate(bookingDate);
    if (hours.closed) return [];

    const toMinutes = (value) => {
      const [hour, minute] = value.split(':').map(Number);
      return hour * 60 + minute;
    };

    let start = toMinutes(hours.open || '10:00');
    let end = toMinutes(hours.close || '22:00');
    if (end <= start) end += 24 * 60;

    const slots = [];
    for (let cursor = start; cursor <= end; cursor += 30) {
      const hour = Math.floor((cursor % (24 * 60)) / 60);
      const minute = cursor % 60;
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
    return slots;
  }, [bookingDate, getOperatingHoursForDate]);

  useEffect(() => {
    if (!bookingTime || timeSlots.length === 0 || timeSlots.includes(bookingTime)) return undefined;

    const timeoutId = window.setTimeout(() => {
      setBookingTime('');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [bookingTime, timeSlots]);

  const validateStepOne = () => {
    const nextErrors = {};
    if (!bookingDate) nextErrors.bookingDate = 'Vui long chon ngay dung bua';
    if (!bookingTime) nextErrors.bookingTime = 'Vui long chon gio dung bua';
    if (timeSlots.length === 0 && bookingDate) nextErrors.bookingTime = 'Nha hang dong cua vao ngay da chon';
    if (!numberOfGuests || numberOfGuests < 1) nextErrors.numberOfGuests = 'So khach phai lon hon 0';

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
    if (!customerName.trim()) nextErrors.customerName = 'Vui long nhap ho ten';
    if (!isValidPhone(customerPhone)) nextErrors.customerPhone = 'So dien thoai khong hop le';
    if (!isValidEmail(customerEmail)) nextErrors.customerEmail = 'Email khong hop le';

    setFieldErrors((current) => ({
      ...current,
      customerName: nextErrors.customerName || null,
      customerPhone: nextErrors.customerPhone || null,
      customerEmail: nextErrors.customerEmail || null,
    }));
    return Object.keys(nextErrors).length === 0;
  };

  // Load available tables when entering Step 2
  const handleCheckTables = async () => {
    if (!validateStepOne()) {
      toast.error('Vui lòng chọn ngày và giờ trước');
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

      if (res.success) {
        const availability = res.data || {};
        setAvailableTables(availability.availableTables || []);
        setSuggestedTables(availability.suggestedTables || []);
        // Auto select suggested tables as default
        setSelectedTables(availability.suggestedTables || []);
        setTablesUnavailable(!availability.available);
        if (!availability.available) {
          toast('Khung gio nay da het ban phu hop. Ban co the tham gia danh sach cho.');
        }
        setCurrentStep(2);
      } else {
        toast.error(res.message || 'Lỗi khi kiểm tra bàn trống');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể kiểm tra bàn trống tại thời điểm này');
    } finally {
      setCheckingTables(false);
    }
  };

  const handleApplySuccess = ({ voucherCode, discountAmount }) => {
    setAppliedVoucher(voucherCode);
    setDiscountAmount(discountAmount);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherCode('');
  };

  const handleContactContinue = () => {
    if (!validateContactInfo()) {
      toast.error('Vui long kiem tra thong tin lien he');
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
      toast.error('Vui long kiem tra lai thong tin dat ban');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        restaurantId,
        bookingDate,
        bookingTime,
        numberOfGuests,
        customerName,
        customerPhone,
        customerEmail,
        specialRequests: specialRequests || null,
        occasion: occasion || null,
        tableNumbers: selectedTables.map(t => t.tableNumber),
        voucherCode: appliedVoucher,
      };

      const res = await createBooking(payload);
      if (res.success) {
        setCreatedBooking(res.data);
        toast.success('Đặt bàn thành công!');
      } else {
        toast.error(res.message || 'Đặt bàn thất bại');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra khi tạo đặt bàn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDateString = () => {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="booking-loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin đặt bàn...</p>
      </div>
    );
  }

  // Render Success Screen
  if (createdBooking) {
    const bDateStr = new Date(createdBooking.bookingDate).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="booking-success-wrapper" role="alert" aria-live="assertive">
        <div className="booking-success-card">
          <div className="success-icon-badge" aria-hidden="true">
            <Check size={48} />
          </div>
          <h2 className="success-title">Đặt bàn thành công!</h2>
          <p className="success-subtitle">Yêu cầu đặt bàn của bạn đã được gửi tới nhà hàng.</p>
          
          <div className="success-details-box">
            <div className="success-detail-row">
              <span className="label">Mã đặt bàn:</span>
              <span className="val font-mono font-bold">#{createdBooking.id.substring(18)}</span>
            </div>
            <div className="success-detail-row">
              <span className="label">Nhà hàng:</span>
              <span className="val">{restaurant?.name}</span>
            </div>
            <div className="success-detail-row">
              <span className="label">Thời gian:</span>
              <span className="val">{createdBooking.bookingTime} - {bDateStr}</span>
            </div>
            <div className="success-detail-row">
              <span className="label">Số khách:</span>
              <span className="val">{createdBooking.numberOfGuests} người</span>
            </div>
            {createdBooking.tableNumbers?.length > 0 && (
              <div className="success-detail-row">
                <span className="label">Bàn được chọn:</span>
                <span className="val text-blue font-bold">{createdBooking.tableNumbers.join(', ')}</span>
              </div>
            )}
            <div className="success-detail-row">
              <span className="label">Trạng thái:</span>
              <span className="val status-pending">⏳ Chờ nhà hàng duyệt</span>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-outline" onClick={() => navigate('/')} aria-label="Về trang chủ">
              Về trang chủ
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')} aria-label="Xem đơn đặt của tôi">
              Đơn đặt của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-page-container">
      {/* Header Info */}
      <div className="booking-page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <h2 className="restaurant-title">Đặt bàn tại {restaurant?.name}</h2>
        <p className="restaurant-sub">{restaurant?.address?.fullAddress}</p>
      </div>

      {/* Steps Indicator */}
      <div className="steps-indicator-container" role="navigation" aria-label="Các bước đặt bàn">
        <div className={`step-dot-wrapper ${currentStep >= 1 ? 'active' : ''}`} aria-current={currentStep === 1 ? 'step' : undefined}>
          <div className="step-dot">1</div>
          <span>Chọn thời gian</span>
        </div>
        <div className="step-line" aria-hidden="true"></div>
        <div className={`step-dot-wrapper ${currentStep >= 2 ? 'active' : ''}`} aria-current={currentStep === 2 ? 'step' : undefined}>
          <div className="step-dot">2</div>
          <span>Chọn bàn ăn</span>
        </div>
        <div className="step-line" aria-hidden="true"></div>
        <div className={`step-dot-wrapper ${currentStep >= 3 ? 'active' : ''}`} aria-current={currentStep === 3 ? 'step' : undefined}>
          <div className="step-dot">3</div>
          <span>Thông tin thêm</span>
        </div>
        <div className="step-line" aria-hidden="true"></div>
        <div className={`step-dot-wrapper ${currentStep >= 4 ? 'active' : ''}`} aria-current={currentStep === 4 ? 'step' : undefined}>
          <div className="step-dot">4</div>
          <span>Xác nhận</span>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="booking-form-main-content">
        {currentStep === 1 && (
          <div className="step-content-card">
            <h3>📅 Bước 1: Chọn ngày, giờ và số lượng khách</h3>
            
            <div className="form-group-wrapper">
              <div className="form-input-group">
                <label className="input-label">
                  <CalendarIcon size={16} /> Ngày dùng bữa
                </label>
                <input
                  id="booking-date"
                  type="date"
                  className="form-control"
                  min={getTodayString()}
                  max={getMaxDateString()}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setFieldErrors((current) => ({ ...current, bookingDate: null }));
                  }}
                  aria-invalid={Boolean(fieldErrors.bookingDate)}
                  aria-describedby={fieldErrors.bookingDate ? 'booking-date-error' : undefined}
                />
                {fieldErrors.bookingDate && (
                  <small id="booking-date-error" className="field-error-text">{fieldErrors.bookingDate}</small>
                )}
              </div>

              <div className="form-input-group">
                <label className="input-label">
                  <Clock size={16} /> Giờ dùng bữa
                </label>
                <div className="time-slots-container-grid" role="radiogroup" aria-label="Chọn giờ dùng bữa">
                  {timeSlots.length === 0 ? (
                    <p className="field-error-text">Nhà hàng không mở cửa vào ngày đã chọn.</p>
                  ) : (
                    timeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        role="radio"
                        className={`time-slot-btn ${bookingTime === slot ? 'selected' : ''}`}
                        onClick={() => {
                          setBookingTime(slot);
                          setFieldErrors((current) => ({ ...current, bookingTime: null }));
                        }}
                        aria-checked={bookingTime === slot}
                        aria-label={`Giờ ${slot}`}
                      >
                        {slot}
                      </button>
                    ))
                  )}
                </div>
                {fieldErrors.bookingTime && (
                  <small className="field-error-text">{fieldErrors.bookingTime}</small>
                )}
              </div>

              <div className="form-input-group">
                <label className="input-label">
                  <Users size={16} /> Số lượng khách đi cùng
                </label>
                <div className="guest-counter-input">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                    disabled={numberOfGuests <= 1}
                    aria-label="Giảm số khách"
                  >
                    -
                  </button>
                  <span className="guest-count-val" aria-live="polite" aria-atomic="true">{numberOfGuests} khách</span>
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => setNumberOfGuests(Math.min(100, numberOfGuests + 1))}
                    disabled={numberOfGuests >= 100}
                    aria-label="Tăng số khách"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="step-navigation-actions right-align">
              <button
                type="button"
                className="btn btn-primary btn-next"
                disabled={!bookingDate || !bookingTime || checkingTables}
                onClick={handleCheckTables}
              >
                {checkingTables ? 'Đang kiểm tra...' : 'Chọn bàn ăn'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content-card">
            <h3>🪑 Bước 2: Lựa chọn vị trí bàn ăn</h3>
            <p className="step-desc-text">
              Bạn có thể tự chọn một hoặc nhiều bàn ăn trống theo danh sách bên dưới, hoặc bỏ qua để nhà hàng tự động xếp bàn tối ưu nhất cho bạn.
            </p>

            {tablesUnavailable && (
              <div className="booking-waitlist-cta" role="status">
                <div>
                  <strong>Khung gio nay hien da het ban phu hop.</strong>
                  <span>Tham gia danh sach cho de nha hang thong bao khi co ban trong, kem mon va dich vu chon truoc.</span>
                </div>
                <button type="button" className="btn btn-primary" onClick={goToWaitlist}>
                  Tham gia waitlist
                </button>
              </div>
            )}

            <div className="selected-tables-preview">
              <div className="preview-header-info">
                <span>Số khách cần phục vụ: <strong>{numberOfGuests} người</strong></span>
                <span>
                  Đã chọn:{' '}
                  <strong className={selectedTables.reduce((sum, t) => sum + t.capacity, 0) >= numberOfGuests ? 'text-green' : 'text-danger'}>
                    {selectedTables.reduce((sum, t) => sum + t.capacity, 0)} chỗ
                  </strong>
                </span>
              </div>

              {selectedTables.length > 0 ? (
                <div className="selected-tables-tags-list">
                  {selectedTables.map(t => (
                    <span key={t.id} className="selected-table-tag">
                      Bàn {t.tableNumber} ({t.capacity} chỗ)
                      <button className="remove-table-tag-btn" onClick={() => setSelectedTables(selectedTables.filter(st => st.id !== t.id))}>×</button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="no-table-selected-notice">
                  💡 Bạn chưa chọn bàn ăn nào. Bạn có thể chọn bàn tự thủ công bằng cách bấm nút dưới đây.
                </div>
              )}

              <button className="btn btn-outline center-btn" onClick={() => setIsTableModalOpen(true)}>
                {selectedTables.length > 0 ? 'Thay đổi bàn đã chọn' : '🔍 Chọn bàn ăn trực quan'}
              </button>
            </div>

            <div className="step-navigation-actions">
              <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft size={16} /> Quay lại
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(3)}
                disabled={tablesUnavailable || (selectedTables.length > 0 && selectedTables.reduce((sum, t) => sum + t.capacity, 0) < numberOfGuests)}
              >
                Nhập thông tin liên hệ <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content-card">
            <h3>📝 Bước 3: Thông tin liên hệ và ghi chú đặc biệt</h3>

            <div className="form-group-wrapper">
              <div className="form-two-cols-row">
                <div className="form-input-group">
                  <label className="input-label">Họ và tên người đặt</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập họ tên của bạn"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setFieldErrors((current) => ({ ...current, customerName: null }));
                    }}
                    aria-invalid={Boolean(fieldErrors.customerName)}
                    aria-describedby={fieldErrors.customerName ? 'customer-name-error' : undefined}
                  />
                  {fieldErrors.customerName && (
                    <small id="customer-name-error" className="field-error-text">{fieldErrors.customerName}</small>
                  )}
                </div>
                <div className="form-input-group">
                  <label className="input-label">Số điện thoại liên lạc</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Nhập số điện thoại liên lạc"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setFieldErrors((current) => ({ ...current, customerPhone: null }));
                    }}
                    aria-invalid={Boolean(fieldErrors.customerPhone)}
                    aria-describedby={fieldErrors.customerPhone ? 'customer-phone-error' : undefined}
                  />
                  {fieldErrors.customerPhone && (
                    <small id="customer-phone-error" className="field-error-text">{fieldErrors.customerPhone}</small>
                  )}
                </div>
              </div>

              <div className="form-input-group">
                <label className="input-label">Email nhận thông tin đặt bàn</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Nhập email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    setFieldErrors((current) => ({ ...current, customerEmail: null }));
                  }}
                  aria-invalid={Boolean(fieldErrors.customerEmail)}
                  aria-describedby={fieldErrors.customerEmail ? 'customer-email-error' : undefined}
                />
                {fieldErrors.customerEmail && (
                  <small id="customer-email-error" className="field-error-text">{fieldErrors.customerEmail}</small>
                )}
              </div>

              <div className="form-input-group">
                <label className="input-label">Dịp đặc biệt (nếu có)</label>
                <div className="occasion-grid-selector">
                  {[
                    { value: 'birthday', label: '🎂 Sinh nhật' },
                    { value: 'anniversary', label: '💍 Kỷ niệm' },
                    { value: 'business', label: '💼 Công việc' },
                    { value: 'date', label: '💑 Hẹn hò' },
                    { value: 'family', label: '👨‍👩‍👧‍👦 Gia đình' },
                    { value: 'other', label: '🎯 Khác' },
                  ].map(occ => (
                    <button
                      key={occ.value}
                      type="button"
                      className={`occasion-btn ${occasion === occ.value ? 'selected' : ''}`}
                      onClick={() => setOccasion(occasion === occ.value ? '' : occ.value)}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-input-group">
                <label className="input-label">Yêu cầu đặc biệt cho nhà hàng</label>
                <textarea
                  className="form-control textarea"
                  rows="3"
                  placeholder="Nhập các yêu cầu về vị trí (gần cửa sổ, phòng VIP...), ghế trẻ em, ghi chú dị ứng món ăn..."
                  maxLength="500"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                ></textarea>
                <small className="char-count-text">{specialRequests.length}/500 ký tự</small>
              </div>

              {/* Voucher section */}
              <ApplyVoucher
                restaurantId={restaurantId}
                bookingAmount={selectedTables.reduce((sum, t) => sum + (t.depositAmount || 0), 0)}
                onApplySuccess={handleApplySuccess}
                onRemove={handleRemoveVoucher}
              />
            </div>

            <div className="step-navigation-actions">
              <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft size={16} /> Quay lại
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleContactContinue}
              >
                Tóm tắt & Xác nhận <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content-card">
            <h3>📋 Bước 4: Kiểm tra thông tin và xác nhận đặt bàn</h3>
            
            <div className="summary-card-container-wrapper">
              <BookingSummaryCard
                bookingData={{
                  bookingDate,
                  bookingTime,
                  numberOfGuests,
                  customerName,
                  customerPhone,
                  customerEmail,
                  specialRequests,
                  occasion,
                  voucherCode: appliedVoucher,
                  discountAmount,
                }}
                restaurant={restaurant}
                selectedTables={selectedTables}
              />
            </div>

            <div className="booking-notes-alert-card">
              <h5>⚠️ Lưu ý đặt bàn</h5>
              <ul>
                <li>Yêu cầu đặt bàn của bạn sẽ được chuyển đến trạng thái <strong>Chờ xác nhận</strong>.</li>
                <li>Nhà hàng sẽ duyệt và phản hồi trong thời gian sớm nhất. Bạn có thể kiểm tra ở mục đơn đặt của tôi.</li>
                <li>Bạn có thể hủy đặt bàn miễn phí bất kỳ lúc nào trước giờ dùng bữa dự kiến.</li>
              </ul>
            </div>

            <div className="step-navigation-actions">
              <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(3)} disabled={isSubmitting}>
                <ArrowLeft size={16} /> Quay lại
              </button>
              <button
                type="button"
                className="btn btn-primary btn-submit-booking font-bold"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : '🍽️ XÁC NHẬN ĐẶT BÀN NGAY'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table selection modal */}
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
