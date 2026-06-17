import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  ConciergeBell,
  Minus,
  Plus,
  Users,
  Utensils,
  MapPin,
  Info
} from 'lucide-react';
import { getPublicRestaurantDetail } from '../../api/restaurantApi';
import { getPublicMenu } from '../../api/menuApi';
import { getPublicTables } from '../../api/tableApi';
import { getPublicServices } from '../../api/restaurantServiceApi';
import { createWaitlist } from '../../api/waitlistApi';
import { useAuth } from '../../context/useAuth';
import Header from '../../components/Header';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

const currency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

const todayString = () => new Date().toISOString().split('T')[0];

const maxDateString = () => {
  const value = new Date();
  value.setDate(value.getDate() + 30);
  return value.toISOString().split('T')[0];
};

export default function WaitlistFormPage() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const initial = location.state || {};

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [services, setServices] = useState([]);
  const [createdWaitlist, setCreatedWaitlist] = useState(null);

  const [form, setForm] = useState({
    preferredDate: initial.bookingDate || '',
    preferredTime: initial.bookingTime || '',
    numberOfGuests: initial.numberOfGuests || 2,
    customerName: initial.customerName || user?.fullName || '',
    customerPhone: initial.customerPhone || user?.phoneNumber || '',
    customerEmail: initial.customerEmail || user?.email || '',
    note: initial.specialRequests || '',
    maxWaitMinutes: 45,
  });

  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [dishQty, setDishQty] = useState({});
  const [serviceQty, setServiceQty] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        setLoading(true);
        const [restaurantRes, tablesRes, menuRes, servicesRes] = await Promise.allSettled([
          getPublicRestaurantDetail(restaurantId),
          getPublicTables(restaurantId, { status: 'available' }),
          getPublicMenu(restaurantId),
          getPublicServices(restaurantId, { availableOnly: 'true' }),
        ]);

        if (ignore) return;

        if (restaurantRes.status === 'fulfilled' && restaurantRes.value.success) {
          setRestaurant(restaurantRes.value.data);
        } else {
          toast.error('Không thể tải thông tin nhà hàng');
          navigate('/restaurants');
          return;
        }

        if (tablesRes.status === 'fulfilled') setTables(tablesRes.value.data?.tables || []);
        if (menuRes.status === 'fulfilled') setMenuItems(menuRes.value.data?.items || []);
        if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.data?.services || []);
      } catch (error) {
        toast.error(error.message || 'Không thể tải dữ liệu danh sách chờ');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [navigate, restaurantId]);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      customerName: current.customerName || user.fullName || '',
      customerPhone: current.customerPhone || user.phoneNumber || '',
      customerEmail: current.customerEmail || user.email || '',
    }));
  }, [user]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: null }));
  };

  const selectedDishes = useMemo(() => (
    Object.entries(dishQty)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const item = menuItems.find((menuItem) => menuItem.id === id);
        return item ? { ...item, quantity } : null;
      })
      .filter(Boolean)
  ), [dishQty, menuItems]);

  const selectedServices = useMemo(() => (
    Object.entries(serviceQty)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const item = services.find((service) => service.id === id);
        return item ? { ...item, quantity } : null;
      })
      .filter(Boolean)
  ), [serviceQty, services]);

  const selectedTables = useMemo(() => (
    tables.filter((table) => selectedTableIds.includes(table.id))
  ), [selectedTableIds, tables]);

  const estimatedTotal = useMemo(() => {
    const dishesTotal = selectedDishes.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const servicesTotal = selectedServices.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return dishesTotal + servicesTotal;
  }, [selectedDishes, selectedServices]);

  const validateStep = useCallback((targetStep = step) => {
    const nextErrors = {};

    if (targetStep === 1) {
      if (!form.preferredDate) nextErrors.preferredDate = 'Vui lòng chọn ngày';
      if (!form.preferredTime) nextErrors.preferredTime = 'Vui lòng chọn giờ';
      if (!form.numberOfGuests || Number(form.numberOfGuests) < 1) nextErrors.numberOfGuests = 'Số khách phải lớn hơn 0';
      if (!form.customerName.trim()) nextErrors.customerName = 'Vui lòng nhập họ tên';
      if (!/^(0[35789][0-9]{8}|02[0-9]{9})$/.test(form.customerPhone.trim())) nextErrors.customerPhone = 'Số điện thoại không hợp lệ';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) nextErrors.customerEmail = 'Email không hợp lệ';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form, step]);

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const changeQuantity = (setter, id, delta) => {
    setter((current) => {
      const nextValue = Math.max(0, Math.min(20, Number(current[id] || 0) + delta));
      const next = { ...current };
      if (nextValue === 0) delete next[id];
      else next[id] = nextValue;
      return next;
    });
  };

  const toggleTable = (tableId) => {
    setSelectedTableIds((current) => (
      current.includes(tableId)
        ? current.filter((id) => id !== tableId)
        : [...current, tableId]
    ));
  };

  const submitWaitlist = async () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        restaurantId,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        numberOfGuests: Number(form.numberOfGuests),
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim(),
        note: form.note || null,
        maxWaitMinutes: Number(form.maxWaitMinutes || 45),
        tables: selectedTableIds.map((tableId) => ({ tableId })),
        dishes: selectedDishes.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        services: selectedServices.map((item) => ({ serviceId: item.id, quantity: item.quantity })),
      };

      const res = await createWaitlist(payload);
      if (res.success) {
        setCreatedWaitlist(res.data.waitlist);
        toast.success('Đã gửi yêu cầu danh sách chờ');
      } else {
        toast.error(res.message || 'Không thể tạo danh sách chờ');
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tạo danh sách chờ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Đang tải biểu mẫu danh sách chờ...</p>
        </div>
      </div>
    );
  }

  if (createdWaitlist) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 border-border bg-card flex flex-col items-center text-center shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-6">
              <Check size={36} />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Đã tham gia hàng chờ
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Nhà hàng sẽ gửi thông báo đến bạn ngay khi có bàn trống phù hợp với các tiêu chí lựa chọn.
            </p>
            
            <div className="w-full bg-secondary/35 border border-border/80 rounded-xl p-5 my-6 flex flex-col gap-3.5 text-xs text-left">
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">Nhà hàng:</span>
                <span className="font-bold text-white truncate max-w-[65%]">{restaurant?.name}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">Thời gian mong muốn:</span>
                <span className="font-semibold text-white">
                  {form.preferredTime} - {new Date(form.preferredDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-muted-foreground">Số lượng khách:</span>
                <span className="font-semibold text-white">{form.numberOfGuests} người</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">Vị trí hàng chờ hiện tại:</span>
                <span className="px-2.5 py-1 text-xs font-bold bg-primary/25 text-primary border border-primary/20 rounded-full">
                  Số {createdWaitlist.queuePositionSnapshot || 'Đang tính'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" onClick={() => navigate('/my-waitlists')} className="border-border text-white hover:bg-secondary text-xs font-semibold h-10">
                Hàng chờ của tôi
              </Button>
              <Button onClick={() => navigate(`/waitlists/${createdWaitlist.id}`)} className="bg-primary hover:bg-primary/95 text-background text-xs font-bold h-10">
                Chi tiết hàng chờ
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Thông tin' },
    { num: 2, label: 'Bàn ưu tiên' },
    { num: 3, label: 'Món & dịch vụ' },
    { num: 4, label: 'Xác nhận' }
  ];

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Header Title with Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Đăng ký danh sách chờ
            </h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin size={13} className="text-primary flex-shrink-0" />
              <span className="truncate">{restaurant?.address?.fullAddress || restaurant?.address?.street || 'BookEat restaurant'}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-border hover:bg-secondary text-xs font-semibold self-start sm:self-auto gap-1">
            <ArrowLeft size={14} /> Quay lại
          </Button>
        </div>

        {/* Steps navigation bar */}
        <div className="flex justify-between items-center w-full px-2 sm:px-8 py-4 bg-secondary/25 border border-border rounded-xl">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              {idx > 0 && <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step >= s.num ? 'bg-primary' : 'bg-border/60'}`} />}
              <button
                type="button"
                onClick={() => {
                  if (s.num === 1 || validateStep(1)) setStep(s.num);
                }}
                className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 focus:outline-none cursor-pointer"
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s.num ? 'bg-primary text-background' : 'bg-secondary border border-border text-muted-foreground'
                }`}>
                  {s.num}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium tracking-wide transition-colors ${
                  step >= s.num ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {s.label}
                </span>
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Dynamic content cards */}
        <div className="w-full">
          {step === 1 && (
            <Card className="p-6 bg-card border-border flex flex-col gap-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="font-bold text-white text-sm">
                  📝 Bước 1: Thông tin liên hệ và lịch mong muốn
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left text-xs">
                {/* Date select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-primary" /> Ngày mong muốn *
                  </label>
                  <input
                    type="date"
                    min={todayString()}
                    max={maxDateString()}
                    value={form.preferredDate}
                    onChange={(event) => updateForm('preferredDate', event.target.value)}
                    className={cn(
                      "w-full bg-secondary/40 border border-border rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer",
                      errors.preferredDate && "border-rose-500/50"
                    )}
                  />
                  {errors.preferredDate && <span className="text-[10px] text-rose-400 font-semibold">{errors.preferredDate}</span>}
                </div>

                {/* Time select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" /> Giờ mong muốn *
                  </label>
                  <input
                    type="time"
                    value={form.preferredTime}
                    onChange={(event) => updateForm('preferredTime', event.target.value)}
                    className={cn(
                      "w-full bg-secondary/40 border border-border rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer",
                      errors.preferredTime && "border-rose-500/50"
                    )}
                  />
                  {errors.preferredTime && <span className="text-[10px] text-rose-400 font-semibold">{errors.preferredTime}</span>}
                </div>

                {/* Number of guests */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Users size={14} className="text-primary" /> Số lượng khách đi cùng *
                  </label>
                  <div className="flex items-center gap-1 bg-secondary/40 border border-border rounded-lg p-1 w-fit">
                    <button
                      type="button"
                      onClick={() => updateForm('numberOfGuests', Math.max(1, Number(form.numberOfGuests) - 1))}
                      disabled={Number(form.numberOfGuests) <= 1}
                      className="h-8 w-8 rounded text-sm text-muted-foreground hover:text-white hover:bg-[#20242D] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-bold text-white min-w-[70px] text-center">{form.numberOfGuests} khách</span>
                    <button
                      type="button"
                      onClick={() => updateForm('numberOfGuests', Math.min(100, Number(form.numberOfGuests) + 1))}
                      disabled={Number(form.numberOfGuests) >= 100}
                      className="h-8 w-8 rounded text-sm text-muted-foreground hover:text-white hover:bg-[#20242D] transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  {errors.numberOfGuests && <span className="text-[10px] text-rose-400 font-semibold">{errors.numberOfGuests}</span>}
                </div>

                {/* Max wait time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold">Thời gian chờ tối đa (phút)</label>
                  <select
                    value={form.maxWaitMinutes}
                    onChange={(event) => updateForm('maxWaitMinutes', event.target.value)}
                    className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="30" className="bg-card">30 phút</option>
                    <option value="45" className="bg-card">45 phút</option>
                    <option value="60" className="bg-card">60 phút</option>
                    <option value="90" className="bg-card">90 phút</option>
                    <option value="120" className="bg-card">120 phút</option>
                  </select>
                </div>

                {/* Customer name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold">Họ và tên *</label>
                  <Input
                    type="text"
                    value={form.customerName}
                    onChange={(event) => updateForm('customerName', event.target.value)}
                    placeholder="Nhập họ tên đầy đủ"
                    className={cn("bg-secondary/40 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary h-10", errors.customerName && "border-rose-500/50")}
                  />
                  {errors.customerName && <span className="text-[10px] text-rose-400 font-semibold">{errors.customerName}</span>}
                </div>

                {/* Customer phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground font-semibold">Số điện thoại *</label>
                  <Input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(event) => updateForm('customerPhone', event.target.value)}
                    placeholder="Nhập số điện thoại"
                    className={cn("bg-secondary/40 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary h-10", errors.customerPhone && "border-rose-500/50")}
                  />
                  {errors.customerPhone && <span className="text-[10px] text-rose-400 font-semibold">{errors.customerPhone}</span>}
                </div>

                {/* Customer email */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-muted-foreground font-semibold">Email nhận thông báo *</label>
                  <Input
                    type="email"
                    value={form.customerEmail}
                    onChange={(event) => updateForm('customerEmail', event.target.value)}
                    placeholder="Nhập địa chỉ email"
                    className={cn("bg-secondary/40 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary h-10", errors.customerEmail && "border-rose-500/50")}
                  />
                  {errors.customerEmail && <span className="text-[10px] text-rose-400 font-semibold">{errors.customerEmail}</span>}
                </div>

                {/* Ghi chú */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-muted-foreground font-semibold">Ghi chú cho nhà hàng</label>
                  <textarea
                    rows="3"
                    maxLength="500"
                    value={form.note}
                    onChange={(event) => updateForm('note', event.target.value)}
                    placeholder="Các yêu cầu đặc biệt như vị trí mong muốn, dị ứng món ăn, ghế em bé hoặc lý do cần bàn sớm..."
                    className="w-full bg-secondary/40 border border-border rounded-lg p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6 bg-card border-border flex flex-col gap-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="font-bold text-white text-sm">
                  🪑 Bước 2: Chọn vị trí bàn ưu tiên (Tùy chọn)
                </h3>
              </div>
              
              <div className="flex flex-col gap-5 text-left text-xs leading-relaxed">
                <p className="text-muted-foreground">
                  Bạn có thể tùy ý chọn vị trí bàn mong muốn dưới đây. Quản lý nhà hàng sẽ sắp xếp dựa trên mức độ ưu tiên này khi có bàn trống.
                </p>
                
                {tables.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground">Nhà hàng chưa cập nhật sơ đồ bàn trống trực tuyến.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {tables.map((table) => {
                      const isSelected = selectedTableIds.includes(table.id);
                      return (
                        <button
                          type="button"
                          key={table.id}
                          onClick={() => toggleTable(table.id)}
                          className={cn(
                            "relative text-left p-4 rounded-xl border transition-all select-none hover:border-primary/50 cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-secondary/20"
                          )}
                          aria-pressed={isSelected}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">Bàn {table.tableNumber}</h4>
                            <span className="text-[10px] text-muted-foreground font-semibold bg-secondary px-2 py-0.5 rounded">
                              {table.zone || 'Khu chung'}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-col gap-1 text-[11px] text-muted-foreground">
                            <div>Sức chứa: <strong className="text-white">{table.capacity} chỗ</strong></div>
                            {table.depositAmount > 0 && (
                              <div className="text-primary font-bold">Đặt cọc: {currency(table.depositAmount)}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6 bg-card border-border flex flex-col gap-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="font-bold text-white text-sm">
                  🍽️ Bước 3: Đặt trước món ăn & Dịch vụ tiện ích (Tùy chọn)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-xs">
                {/* Món ăn */}
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-white flex items-center gap-1.5 pb-2 border-b border-border/60">
                    <Utensils size={15} className="text-primary" /> Món ăn đặc trưng
                  </h4>
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {menuItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground italic">Không có danh sách món ăn khả dụng.</div>
                    ) : (
                      menuItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-secondary/15 hover:border-primary/10 transition">
                          <div>
                            <strong className="block text-white font-medium">{item.name}</strong>
                            <span className="text-[11px] text-primary font-semibold mt-0.5 block">{currency(item.price)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary/40 border border-border rounded p-0.5">
                            <button
                              type="button"
                              onClick={() => changeQuantity(setDishQty, item.id, -1)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#20242D] text-muted-foreground hover:text-white transition cursor-pointer"
                              aria-label={`Giảm số lượng ${item.name}`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-white">{dishQty[item.id] || 0}</span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(setDishQty, item.id, 1)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#20242D] text-muted-foreground hover:text-white transition cursor-pointer"
                              aria-label={`Tăng số lượng ${item.name}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Dịch vụ */}
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-white flex items-center gap-1.5 pb-2 border-b border-border/60">
                    <ConciergeBell size={15} className="text-primary" /> Dịch vụ đi kèm
                  </h4>
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {services.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground italic">Không có dịch vụ đặc biệt khả dụng.</div>
                    ) : (
                      services.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-secondary/15 hover:border-primary/10 transition">
                          <div>
                            <strong className="block text-white font-medium">{item.name}</strong>
                            <span className="text-[11px] text-primary font-semibold mt-0.5 block">{currency(item.price)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary/40 border border-border rounded p-0.5">
                            <button
                              type="button"
                              onClick={() => changeQuantity(setServiceQty, item.id, -1)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#20242D] text-muted-foreground hover:text-white transition cursor-pointer"
                              aria-label={`Giảm số lượng ${item.name}`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-white">{serviceQty[item.id] || 0}</span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(setServiceQty, item.id, 1)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#20242D] text-muted-foreground hover:text-white transition cursor-pointer"
                              aria-label={`Tăng số lượng ${item.name}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-6 bg-card border-border flex flex-col gap-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="font-bold text-white text-sm">
                  📋 Bước 4: Kiểm tra thông tin tóm tắt & Xác nhận hàng chờ
                </h3>
              </div>

              <div className="flex flex-col gap-5 text-left text-xs">
                {/* Summary Details */}
                <div className="bg-secondary/35 border border-border p-5 rounded-xl flex flex-col gap-3.5">
                  <div className="flex justify-between pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Nhà hàng:</span>
                    <span className="font-bold text-white">{restaurant?.name}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-semibold text-white">{form.preferredTime} - {new Date(form.preferredDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Số lượng khách:</span>
                    <span className="font-semibold text-white">{form.numberOfGuests} người</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Bàn ưu tiên:</span>
                    <span className="font-bold text-primary">
                      {selectedTables.length ? selectedTables.map((table) => table.tableNumber).join(', ') : 'Tự động xếp bàn trống'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Món ăn đã chọn trước:</span>
                    <span className="font-semibold text-white">{selectedDishes.length} món</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Dịch vụ đi kèm:</span>
                    <span className="font-semibold text-white">{selectedServices.length} dịch vụ</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border/40">
                    <span className="text-muted-foreground">Tạm tính (Món & Dịch vụ):</span>
                    <span className="font-bold text-primary">{currency(estimatedTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-muted-foreground">Thời gian chờ tối đa:</span>
                    <span className="font-bold text-white">{form.maxWaitMinutes} phút</span>
                  </div>
                </div>

                {/* Info block */}
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-primary/95">
                  <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white mb-1">Quy tắc hàng chờ:</strong>
                    <span>Yêu cầu đăng ký sẽ nằm ở trạng thái Chờ duyệt. Quản lý nhà hàng chỉ phê duyệt và chỉ định bàn cho bạn khi có bàn trống phù hợp với các tùy chọn ưu tiên của bạn phát sinh trên hệ thống.</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Stepper Footer actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => (step === 1 ? navigate(-1) : setStep((current) => current - 1))}
            disabled={submitting}
            className="border-border text-white hover:bg-secondary text-xs font-semibold h-10 px-5 gap-1.5"
          >
            <ArrowLeft size={14} /> {step === 1 ? 'Hủy bỏ' : 'Quay lại'}
          </Button>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              className="bg-primary hover:bg-primary/95 text-background font-semibold h-10 px-5 gap-1.5 text-xs"
            >
              Tiếp tục bước tiếp theo <ArrowRight size={14} />
            </Button>
          ) : (
            <Button
              onClick={submitWaitlist}
              disabled={submitting}
              className="bg-primary hover:bg-primary/95 text-background font-bold h-11 px-6 gap-2 text-xs uppercase tracking-wider"
            >
              {submitting ? 'Đang gửi yêu cầu...' : 'Gửi đăng ký hàng chờ'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
