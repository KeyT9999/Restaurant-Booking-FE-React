import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { getPublicRestaurantDetail } from '../../api/restaurantApi';
import { getPublicMenu } from '../../api/menuApi';
import { getPublicTables } from '../../api/tableApi';
import { getPublicServices } from '../../api/restaurantServiceApi';
import { createWaitlist } from '../../api/waitlistApi';
import { useAuth } from '../../context/useAuth';
import './WaitlistFormPage.css';

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
          toast.error('Khong the tai thong tin nha hang');
          navigate('/restaurants');
          return;
        }

        if (tablesRes.status === 'fulfilled') setTables(tablesRes.value.data?.tables || []);
        if (menuRes.status === 'fulfilled') setMenuItems(menuRes.value.data?.items || []);
        if (servicesRes.status === 'fulfilled') setServices(servicesRes.value.data?.services || []);
      } catch (error) {
        toast.error(error.message || 'Khong the tai du lieu danh sach cho');
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
      if (!form.preferredDate) nextErrors.preferredDate = 'Vui long chon ngay';
      if (!form.preferredTime) nextErrors.preferredTime = 'Vui long chon gio';
      if (!form.numberOfGuests || Number(form.numberOfGuests) < 1) nextErrors.numberOfGuests = 'So khach phai lon hon 0';
      if (!form.customerName.trim()) nextErrors.customerName = 'Vui long nhap ho ten';
      if (!/^(0[35789][0-9]{8}|02[0-9]{9})$/.test(form.customerPhone.trim())) nextErrors.customerPhone = 'So dien thoai khong hop le';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) nextErrors.customerEmail = 'Email khong hop le';
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
        toast.success('Da gui yeu cau danh sach cho');
      } else {
        toast.error(res.message || 'Khong the tao danh sach cho');
      }
    } catch (error) {
      toast.error(error.message || 'Khong the tao danh sach cho');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="waitlist-page-shell">
        <div className="waitlist-loading">Dang tai form danh sach cho...</div>
      </div>
    );
  }

  if (createdWaitlist) {
    return (
      <div className="waitlist-page-shell">
        <div className="waitlist-success-card" role="alert" aria-live="assertive">
          <div className="waitlist-success-icon"><Check size={42} /></div>
          <h1>Da tham gia danh sach cho</h1>
          <p>Nha hang se thong bao realtime khi co ban trong phu hop voi yeu cau cua ban.</p>
          <div className="waitlist-success-grid">
            <span>Nha hang</span><strong>{restaurant?.name}</strong>
            <span>Thoi gian</span><strong>{form.preferredTime} - {new Date(form.preferredDate).toLocaleDateString('vi-VN')}</strong>
            <span>So khach</span><strong>{form.numberOfGuests} khach</strong>
            <span>Vi tri hang cho</span><strong>{createdWaitlist.queuePositionSnapshot || 'Dang tinh'}</strong>
          </div>
          <div className="waitlist-success-actions">
            <button type="button" className="waitlist-btn secondary" onClick={() => navigate('/my-waitlists')}>
              Danh sach cho cua toi
            </button>
            <button type="button" className="waitlist-btn primary" onClick={() => navigate(`/waitlists/${createdWaitlist.id}`)}>
              Xem chi tiet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="waitlist-page-shell">
      <header className="waitlist-header">
        <button type="button" className="waitlist-back-btn" onClick={() => navigate(-1)} aria-label="Quay lai">
          <ArrowLeft size={18} /> Quay lai
        </button>
        <div>
          <p>Danh sach cho</p>
          <h1>{restaurant?.name}</h1>
          <span>{restaurant?.address?.fullAddress || restaurant?.address?.street || 'BookEat restaurant'}</span>
        </div>
      </header>

      <nav className="waitlist-stepper" aria-label="Cac buoc dang ky danh sach cho">
        {['Thong tin', 'Ban uu tien', 'Mon & dich vu', 'Xac nhan'].map((label, index) => {
          const stepNumber = index + 1;
          return (
            <button
              key={label}
              type="button"
              className={step >= stepNumber ? 'active' : ''}
              onClick={() => {
                if (stepNumber === 1 || validateStep(1)) setStep(stepNumber);
              }}
              aria-current={step === stepNumber ? 'step' : undefined}
            >
              <span>{stepNumber}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <main className="waitlist-card-panel">
        {step === 1 && (
          <section className="waitlist-section">
            <h2>Thong tin cho ban</h2>
            <div className="waitlist-form-grid">
              <label>
                <span><CalendarDays size={16} /> Ngay mong muon</span>
                <input
                  type="date"
                  min={todayString()}
                  max={maxDateString()}
                  value={form.preferredDate}
                  onChange={(event) => updateForm('preferredDate', event.target.value)}
                  aria-invalid={Boolean(errors.preferredDate)}
                />
                {errors.preferredDate && <small>{errors.preferredDate}</small>}
              </label>
              <label>
                <span><Clock size={16} /> Gio mong muon</span>
                <input
                  type="time"
                  value={form.preferredTime}
                  onChange={(event) => updateForm('preferredTime', event.target.value)}
                  aria-invalid={Boolean(errors.preferredTime)}
                />
                {errors.preferredTime && <small>{errors.preferredTime}</small>}
              </label>
              <label>
                <span><Users size={16} /> So khach</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.numberOfGuests}
                  onChange={(event) => updateForm('numberOfGuests', event.target.value)}
                  aria-invalid={Boolean(errors.numberOfGuests)}
                />
                {errors.numberOfGuests && <small>{errors.numberOfGuests}</small>}
              </label>
              <label>
                <span>Thoi gian cho toi da</span>
                <select
                  value={form.maxWaitMinutes}
                  onChange={(event) => updateForm('maxWaitMinutes', event.target.value)}
                >
                  <option value="30">30 phut</option>
                  <option value="45">45 phut</option>
                  <option value="60">60 phut</option>
                  <option value="90">90 phut</option>
                  <option value="120">120 phut</option>
                </select>
              </label>
              <label>
                <span>Ho ten</span>
                <input value={form.customerName} onChange={(event) => updateForm('customerName', event.target.value)} />
                {errors.customerName && <small>{errors.customerName}</small>}
              </label>
              <label>
                <span>So dien thoai</span>
                <input value={form.customerPhone} onChange={(event) => updateForm('customerPhone', event.target.value)} />
                {errors.customerPhone && <small>{errors.customerPhone}</small>}
              </label>
              <label className="waitlist-field-wide">
                <span>Email</span>
                <input type="email" value={form.customerEmail} onChange={(event) => updateForm('customerEmail', event.target.value)} />
                {errors.customerEmail && <small>{errors.customerEmail}</small>}
              </label>
              <label className="waitlist-field-wide">
                <span>Ghi chu cho nha hang</span>
                <textarea
                  rows="3"
                  maxLength="500"
                  value={form.note}
                  onChange={(event) => updateForm('note', event.target.value)}
                  placeholder="Vi tri mong muon, di ung, tre em, ly do can ban som..."
                />
              </label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="waitlist-section">
            <h2>Chon ban uu tien</h2>
            <p className="waitlist-muted">Ban co the chon ban mong muon. Owner van se kiem tra xung dot truoc khi xac nhan.</p>
            <div className="waitlist-table-grid">
              {tables.length === 0 ? (
                <div className="waitlist-empty-inline">Nha hang chua cong khai so do ban.</div>
              ) : tables.map((table) => (
                <button
                  type="button"
                  key={table.id}
                  className={`waitlist-table-choice ${selectedTableIds.includes(table.id) ? 'selected' : ''}`}
                  onClick={() => toggleTable(table.id)}
                  aria-pressed={selectedTableIds.includes(table.id)}
                >
                  <strong>Ban {table.tableNumber}</strong>
                  <span>{table.capacity} cho · {table.zone || 'Khu chung'}</span>
                  {table.depositAmount > 0 && <small>Dat coc: {currency(table.depositAmount)}</small>}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="waitlist-section">
            <h2>Chon mon va dich vu truoc</h2>
            <div className="waitlist-pick-columns">
              <div>
                <h3><Utensils size={18} /> Mon an</h3>
                <div className="waitlist-pick-list">
                  {menuItems.length === 0 ? (
                    <div className="waitlist-empty-inline">Chua co mon cong khai.</div>
                  ) : menuItems.map((item) => (
                    <div key={item.id} className="waitlist-pick-item">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{currency(item.price)}</span>
                      </div>
                      <div className="qty-control">
                        <button type="button" onClick={() => changeQuantity(setDishQty, item.id, -1)} aria-label={`Giam ${item.name}`}>
                          <Minus size={14} />
                        </button>
                        <span>{dishQty[item.id] || 0}</span>
                        <button type="button" onClick={() => changeQuantity(setDishQty, item.id, 1)} aria-label={`Tang ${item.name}`}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3><ConciergeBell size={18} /> Dich vu</h3>
                <div className="waitlist-pick-list">
                  {services.length === 0 ? (
                    <div className="waitlist-empty-inline">Chua co dich vu cong khai.</div>
                  ) : services.map((item) => (
                    <div key={item.id} className="waitlist-pick-item">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{currency(item.price)}</span>
                      </div>
                      <div className="qty-control">
                        <button type="button" onClick={() => changeQuantity(setServiceQty, item.id, -1)} aria-label={`Giam ${item.name}`}>
                          <Minus size={14} />
                        </button>
                        <span>{serviceQty[item.id] || 0}</span>
                        <button type="button" onClick={() => changeQuantity(setServiceQty, item.id, 1)} aria-label={`Tang ${item.name}`}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="waitlist-section">
            <h2>Xac nhan yeu cau</h2>
            <div className="waitlist-summary">
              <div>
                <span>Nha hang</span>
                <strong>{restaurant?.name}</strong>
              </div>
              <div>
                <span>Thoi gian</span>
                <strong>{form.preferredTime} - {new Date(form.preferredDate).toLocaleDateString('vi-VN')}</strong>
              </div>
              <div>
                <span>So khach</span>
                <strong>{form.numberOfGuests} khach</strong>
              </div>
              <div>
                <span>Ban uu tien</span>
                <strong>{selectedTables.length ? selectedTables.map((table) => table.tableNumber).join(', ') : 'De nha hang xep ban'}</strong>
              </div>
              <div>
                <span>Mon da chon</span>
                <strong>{selectedDishes.length} mon</strong>
              </div>
              <div>
                <span>Dich vu</span>
                <strong>{selectedServices.length} dich vu</strong>
              </div>
              <div>
                <span>Tam tinh mon/dich vu</span>
                <strong>{currency(estimatedTotal)}</strong>
              </div>
              <div>
                <span>Thoi gian cho toi da</span>
                <strong>{form.maxWaitMinutes} phut</strong>
              </div>
            </div>
            <p className="waitlist-note-box">
              Yeu cau se o trang thai pending. Owner chi duoc xac nhan khi chon du ban trong va he thong khong phat hien trung lich.
            </p>
          </section>
        )}

        <footer className="waitlist-actions">
          <button
            type="button"
            className="waitlist-btn secondary"
            onClick={() => (step === 1 ? navigate(-1) : setStep((current) => current - 1))}
            disabled={submitting}
          >
            <ArrowLeft size={16} /> {step === 1 ? 'Huy' : 'Quay lai'}
          </button>
          {step < 4 ? (
            <button type="button" className="waitlist-btn primary" onClick={nextStep}>
              Tiep tuc <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="waitlist-btn primary" onClick={submitWaitlist} disabled={submitting}>
              {submitting ? 'Dang gui...' : 'Gui yeu cau waitlist'}
            </button>
          )}
        </footer>
      </main>
    </div>
  );
}
