import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
  Calendar,
  ChevronRight,
  Loader2,
  Coins,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { profileApi } from '../../api/profileApi';
import { loyaltyApi } from '../../api/loyaltyApi';
import toast from 'react-hot-toast';
import Header from '../../components/Header';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const PHONE_REGEX = /^(0[35789])[0-9]{8}$/;

const ROLE_LABELS = {
  customer: 'Khách hàng',
  restaurant_owner: 'Chủ nhà hàng',
  admin: 'Quản trị viên',
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// Toast component
// ─────────────────────────────────────────────

function ProfileAlert({ type, message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-xs leading-relaxed transition-all animate-in fade-in duration-200 ${
        type === 'success'
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-destructive/20 bg-destructive/10 text-destructive'
      }`}
      role="alert"
    >
      {type === 'success' ? (
        <CheckCircle size={16} className="shrink-0 mt-0.5" />
      ) : (
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Thông tin tài khoản (display + edit)
// ─────────────────────────────────────────────

function TabInfo({ user, onUserUpdated }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState({});

  // Sync form khi user thay đổi
  useEffect(() => {
    setForm({
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
    });
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Họ và tên không được để trống';
    if (form.phoneNumber && !PHONE_REGEX.test(form.phoneNumber)) {
      errs.phoneNumber = 'Số điện thoại phải 10 số, bắt đầu bằng 03/05/07/08/09';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setAlert({ type: '', message: '' });
    try {
      const res = await profileApi.updateMyProfile({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        address: form.address.trim() || null,
      });
      onUserUpdated(res.user);
      setEditing(false);
      setAlert({ type: 'success', message: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setAlert({ type: 'error', message: err?.message || 'Không thể cập nhật thông tin' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    setForm({
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Thông tin hiển thị ── */}
      <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col gap-6">
        <div className="border-b border-border/40 pb-4">
          <h2 className="font-serif text-xl text-white font-bold">Thông tin tài khoản</h2>
          <p className="text-xs text-muted-foreground mt-1">Thông tin được liên kết với tài khoản BookEat của bạn.</p>
        </div>

        <ProfileAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <User size={12} className="text-primary/70" />
              Họ và tên
            </span>
            <span className="text-sm font-medium text-white">{user?.fullName || '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <Mail size={12} className="text-primary/70" />
              Email
            </span>
            <span className="text-sm font-medium text-white break-all">{user?.email || '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <User size={12} className="text-primary/70" />
              Tên đăng nhập
            </span>
            <span className="text-sm font-medium text-white">@{user?.username || '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <Phone size={12} className="text-primary/70" />
              Số điện thoại
            </span>
            <span className={`text-sm font-medium text-white ${!user?.phoneNumber ? 'text-muted-foreground italic' : ''}`}>
              {user?.phoneNumber || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <MapPin size={12} className="text-primary/70" />
              Địa chỉ
            </span>
            <span className={`text-sm font-medium text-white ${!user?.address ? 'text-muted-foreground italic' : ''}`}>
              {user?.address || 'Chưa cập nhật'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <Shield size={12} className="text-primary/70" />
              Vai trò
            </span>
            <span className="text-sm font-medium text-white">
              {ROLE_LABELS[user?.role] || user?.role || '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <Clock size={12} className="text-primary/70" />
              Ngày tham gia
            </span>
            <span className="text-sm font-medium text-white">
              {formatDate(user?.createdAt) || '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <Clock size={12} className="text-primary/70" />
              Đăng nhập gần nhất
            </span>
            <span className={`text-sm font-medium text-white ${!user?.lastLogin ? 'text-muted-foreground italic' : ''}`}>
              {formatDate(user?.lastLogin) || 'Chưa ghi nhận'}
            </span>
          </div>
        </div>

        {!editing && (
          <div className="border-t border-border/40 pt-4 flex">
            <button
              type="button"
              id="btn-edit-profile"
              className="h-11 px-6 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all cursor-pointer"
              onClick={() => setEditing(true)}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        )}
      </div>

      {/* ── Form chỉnh sửa ── */}
      {editing && (
        <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col gap-6">
          <div className="border-b border-border/40 pb-4">
            <h2 className="font-serif text-xl text-white font-bold">Chỉnh sửa thông tin</h2>
            <p className="text-xs text-muted-foreground mt-1">Email và tên đăng nhập không thể thay đổi tại đây.</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit} id="form-update-profile">
            {/* Họ tên */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User size={14} />
                Họ và tên <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                disabled={loading}
                autoFocus
                className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                  errors.fullName ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.fullName && (
                <span className="text-xs text-destructive font-medium mt-0.5">{errors.fullName}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Số điện thoại */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phoneNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Phone size={14} />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="VD: 0912345678"
                  disabled={loading}
                  className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                    errors.phoneNumber ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.phoneNumber ? (
                  <span className="text-xs text-destructive font-medium mt-0.5">{errors.phoneNumber}</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50 mt-0.5">10 số, bắt đầu bằng 03/05/07/08/09</span>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MapPin size={14} />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ của bạn"
                  disabled={loading}
                  className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            {/* Email — readonly */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-readonly" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Mail size={14} />
                Email (không thể thay đổi)
              </label>
              <input
                type="email"
                id="email-readonly"
                value={user?.email || ''}
                disabled
                readOnly
                className="flex h-11 w-full rounded-xl border border-border bg-[#1A1D24] opacity-55 px-4 py-2 text-sm text-muted-foreground cursor-not-allowed focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground/50 mt-0.5">Liên hệ bộ phận hỗ trợ nếu bạn cần thay đổi email đăng ký.</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-border/40 pt-4 mt-2">
              <button
                type="submit"
                id="btn-save-profile"
                className="h-11 px-6 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                disabled={loading}
              >
                <Save size={16} />
                <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
              <button
                type="button"
                id="btn-cancel-edit"
                className="h-11 px-6 rounded-xl border border-border bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
                onClick={handleCancel}
                disabled={loading}
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Đổi mật khẩu
// ─────────────────────────────────────────────

function TabPassword({ isGoogleUser }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Mật khẩu hiện tại không được để trống';
    if (!form.newPassword || form.newPassword.length < 8)
      errs.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    if (!form.confirmPassword) errs.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'Xác nhận mật khẩu không khớp';
    if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword)
      errs.newPassword = 'Mật khẩu mới không được trùng mật khẩu hiện tại';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setAlert({ type: '', message: '' });
    try {
      const res = await profileApi.changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setAlert({ type: 'success', message: res?.message || 'Đổi mật khẩu thành công!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setAlert({ type: 'error', message: err?.message || 'Không thể đổi mật khẩu' });
    } finally {
      setLoading(false);
    }
  };

  if (isGoogleUser) {
    return (
      <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col gap-6">
        <div className="border-b border-border/40 pb-4">
          <h2 className="font-serif text-xl text-white font-bold">Đổi mật khẩu</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 text-primary">
            <Lock size={28} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Tài khoản Google</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            Tài khoản của bạn đăng nhập thông qua liên kết Google. Mọi tùy chỉnh bảo mật và mật khẩu vui lòng thực hiện trực tiếp trên trang quản lý tài khoản Google.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col gap-6 w-full">
      <div className="border-b border-border/40 pb-4">
        <h2 className="font-serif text-xl text-white font-bold">Đổi mật khẩu</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Mật khẩu mới phải có ít nhất 8 ký tự và khác mật khẩu hiện tại.
        </p>
      </div>

      <ProfileAlert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: '', message: '' })}
      />

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} id="form-change-password">
        {/* Mật khẩu hiện tại */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Lock size={14} />
            Mật khẩu hiện tại <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <input
              type={show.currentPassword ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={loading}
              autoComplete="current-password"
              className={`flex h-11 w-full rounded-xl border bg-[#20242D] pl-4 pr-11 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                errors.currentPassword ? 'border-destructive' : 'border-border'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
              onClick={() => toggleShow('currentPassword')}
              aria-label="Hiện/ẩn mật khẩu"
            >
              {show.currentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && (
            <span className="text-xs text-destructive font-medium mt-0.5">{errors.currentPassword}</span>
          )}
        </div>

        {/* Mật khẩu mới */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Lock size={14} />
            Mật khẩu mới <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <input
              type={show.newPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Tối thiểu 8 ký tự"
              disabled={loading}
              autoComplete="new-password"
              className={`flex h-11 w-full rounded-xl border bg-[#20242D] pl-4 pr-11 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                errors.newPassword ? 'border-destructive' : 'border-border'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
              onClick={() => toggleShow('newPassword')}
              aria-label="Hiện/ẩn mật khẩu mới"
            >
              {show.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <span className="text-xs text-destructive font-medium mt-0.5">{errors.newPassword}</span>
          )}
          {!errors.newPassword && form.newPassword.length > 0 && (
            <span className="text-[10px] text-muted-foreground/50 mt-0.5">
              Độ mạnh: {form.newPassword.length < 8 ? '⚠️ Quá ngắn' : form.newPassword.length < 12 ? '🟡 Trung bình' : '✅ Tốt'}
            </span>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Lock size={14} />
            Xác nhận mật khẩu mới <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <input
              type={show.confirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              disabled={loading}
              autoComplete="new-password"
              className={`flex h-11 w-full rounded-xl border bg-[#20242D] pl-4 pr-11 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                errors.confirmPassword ? 'border-destructive' : 'border-border'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
              onClick={() => toggleShow('confirmPassword')}
              aria-label="Hiện/ẩn xác nhận mật khẩu"
            >
              {show.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-destructive font-medium mt-0.5">{errors.confirmPassword}</span>
          )}
          {!errors.confirmPassword &&
            form.confirmPassword.length > 0 &&
            form.newPassword === form.confirmPassword && (
              <span className="text-[10px] text-emerald-400 font-medium mt-0.5">
                ✅ Mật khẩu trùng khớp
              </span>
            )}
        </div>

        <div className="border-t border-border/40 pt-4 flex mt-2">
          <button
            type="submit"
            id="btn-change-password"
            className="h-11 px-6 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            disabled={loading}
          >
            <Lock size={16} />
            <span>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: BookEat Coins (Loyalty Points)
// ─────────────────────────────────────────────

function TabLoyalty() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Simulation states
  const [simAmount, setSimAmount] = useState('5000');
  const [simSource, setSimSource] = useState('completed');
  const [simLoading, setSimLoading] = useState(false);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const data = await loyaltyApi.getLoyaltySummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải thông tin tích điểm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    const amount = parseInt(simAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Vui lòng nhập số xu hợp lệ');
      return;
    }
    setSimLoading(true);
    try {
      const res = await loyaltyApi.simulateEarn({ amount, source: simSource });
      if (res.success) {
        toast.success(res.message || 'Giả lập tích xu thành công!');
        fetchLoyaltyData();
      } else {
        toast.error(res.message || 'Giả lập thất bại');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi hệ thống');
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Đang tải thông tin ví xu...</span>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* ── Tổng quan ví xu ── */}
      <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Coins size={28} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl text-white font-bold">Ví BookEat Coins</h2>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-muted-foreground hover:text-white transition-colors cursor-pointer focus:outline-none"
                title="Cách sử dụng xu"
              >
                <HelpCircle size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Tích xu khi đặt cọc hoặc dùng bữa để nhận chiết khấu tiền mặt cọc.</p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <span className="text-2xl font-extrabold text-primary font-mono">
            {new Intl.NumberFormat('vi-VN').format(summary?.loyaltyPoints || 0)} Xu
          </span>
          <span className="text-[10px] text-muted-foreground">
            Tương đương ~ {formatCurrency(summary?.loyaltyPoints || 0)} cọc
          </span>
        </div>
      </div>

      {/* ── Bảng trợ giúp / Cách dùng xu ── */}
      {showHelp && (
        <div className="p-6 bg-[#20242D] border border-primary/20 rounded-2xl flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle size={14} className="text-primary" /> Hướng dẫn sử dụng BookEat Coins
          </h3>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-2 leading-relaxed">
            <li>
              <strong>Quy ước tỷ lệ cọc:</strong> Mỗi 100.000đ tiền đặt cọc đã thanh toán sẽ tích lũy được <strong>1.000 Coins</strong> (tương đương 1 Coin = 1đ).
            </li>
            <li>
              <strong>Cơ chế Khấu trừ (Redemption Cap):</strong> Khi đặt bàn lần sau, bạn có thể chọn trừ tối đa <strong>50% giá trị tiền đặt cọc</strong> của đơn đặt bàn đó bằng xu tích lũy trong ví.
            </li>
            <li>
              <strong>Thanh toán tối thiểu:</strong> Số tiền mặt thực tế phải thanh toán sau khi trừ xu không được thấp hơn hạn mức tối thiểu của cổng thanh toán (ví dụ: tối thiểu 2.000đ). Nếu thấp hơn, hệ thống sẽ tự động bớt số xu áp dụng để bảo vệ tính thanh toán.
            </li>
            <li>
              <strong>Thưởng đặt bàn không cọc:</strong> Khách đặt bàn không cọc khi dùng bữa thành công cũng được thưởng từ <strong>200 - 500 Coins</strong>.
            </li>
            <li>
              <strong>Hạn sử dụng xu:</strong> Xu tích lũy sẽ tự động hết hạn và biến mất sau <strong>6 tháng</strong> kể từ ngày được tích lũy.
            </li>
          </ul>
        </div>
      )}

      {/* ── Lịch sử giao dịch ── */}
      <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col gap-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lịch sử giao dịch xu</h3>

        {(!summary?.history || summary.history.length === 0) ? (
          <div className="text-center py-10 border border-dashed border-border/40 bg-card/10 rounded-xl flex flex-col items-center justify-center gap-3">
            <Coins size={24} className="text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">Chưa có giao dịch xu nào được ghi nhận.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground/80 font-semibold">
                  <th className="py-2.5">Mô tả</th>
                  <th className="py-2.5 text-center">Biến động</th>
                  <th className="py-2.5 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {summary.history.map((tx) => (
                  <tr key={tx._id || tx.id} className="hover:bg-secondary/10">
                    <td className="py-3">
                      <div className="font-medium text-white">{tx.description}</div>
                      {tx.expiresAt && !tx.isExpired && tx.points > 0 && (
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          Hạn dùng: {new Date(tx.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                      {tx.isExpired && (
                        <div className="text-[9px] text-rose-400 font-semibold mt-0.5">
                          Đã hết hạn
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center font-mono font-bold">
                      <span className={tx.points > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Widget Giả lập tích xu (Hidden/Simulation Mode) ── */}
      <div className="p-6 md:p-8 bg-card border border-border border-dashed rounded-2xl flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🧪 Bảng thử nghiệm: Giả lập Tích xu
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">Dùng để kiểm tra nhanh luồng tích xu và biến động số dư ví BookEat Coins.</p>
        </div>

        <form onSubmit={handleSimulate} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1 w-full">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Số xu tích lũy</label>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              placeholder="VD: 5000"
              className="h-10 w-full rounded-xl border border-border bg-[#20242D] px-3.5 text-xs text-white placeholder-muted-foreground/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1 w-full">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Nguồn tích xu</label>
            <select
              value={simSource}
              onChange={(e) => setSimSource(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-[#20242D] px-3 text-xs text-white focus:outline-none"
            >
              <option value="completed">Đơn hoàn tất (bữa ăn xong)</option>
              <option value="deposit">Đặt cọc thành công</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={simLoading}
            className="h-10 px-5 rounded-xl bg-[#D49653] hover:bg-[#D49653]/90 text-background text-xs font-bold shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer border-none"
          >
            {simLoading && <Loader2 size={12} className="animate-spin" />}
            <span>Giả lập tích xu</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Lịch sử đặt bàn (placeholder)
// ─────────────────────────────────────────────

function TabBookings() {
  return (
    <div className="p-6 md:p-8 bg-card border border-border rounded-2xl shadow-lg flex flex-col gap-6 w-full">
      <div className="border-b border-border/40 pb-4">
        <h2 className="font-serif text-xl text-white font-bold">Lịch sử đặt bàn</h2>
        <p className="text-xs text-muted-foreground mt-1">Danh sách các lần đặt bàn của bạn tại BookEat.</p>
      </div>
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 text-primary">
          <Calendar size={28} />
        </div>
        <p className="text-base font-bold text-white mb-2">Chưa có lịch sử đặt bàn</p>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-5">
          Bạn chưa đặt bàn tại nhà hàng nào trên hệ thống. Hãy khám phá các địa điểm ăn uống tuyệt vời ngay hôm nay!
        </p>
        <Link
          to="/restaurants"
          id="btn-explore-restaurants"
          className="h-11 px-6 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Khám phá nhà hàng</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main ProfilePage
// ─────────────────────────────────────────────

const TABS = [
  { id: 'info',     label: 'Thông tin',    icon: User },
  { id: 'password', label: 'Mật khẩu',     icon: Lock },
  { id: 'bookings', label: 'Đặt bàn',      icon: Calendar },
  { id: 'loyalty',  label: 'BookEat Coins',icon: Coins },
];

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    document.title = 'Tài khoản của tôi — BookEat';
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const fetchProfile = async () => {
      try {
        const data = await profileApi.getMyProfile();
        setProfileUser(data);
      } catch (err) {
        setPageError(err?.message || 'Không thể tải thông tin tài khoản');
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading]);

  // Callback khi update thành công — refresh cả local state và AuthContext (Header)
  const handleUserUpdated = (updatedUser) => {
    setProfileUser(updatedUser);
    if (updateUser) updateUser(updatedUser); // Đồng bộ Header avatar/name
  };

  // ── Loading ──
  if (pageLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Đang tải thông tin tài khoản...</span>
        </main>
      </div>
    );
  }

  // ── Error ──
  if (pageError) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-lg text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2">
              <AlertCircle size={32} />
            </div>
            <h2 className="font-serif text-xl text-white font-bold">Không thể tải trang</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pageError}
            </p>
            <Link
              to="/auth/login"
              className="mt-2 w-full h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center cursor-pointer"
            >
              Đăng nhập lại
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const user = profileUser || authUser;
  const isGoogleUser = Boolean(user?.googleId || (!user?.phoneNumber && user?.emailVerified && !user?.username?.startsWith('@')));

  const avatarLetter = (user?.fullName || user?.username || '?')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6" id="profile-main">
        {/* ── Page Header ── */}
        <div className="border-b border-border/40 pb-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
            <Link to="/" className="text-primary hover:underline transition-all">Trang chủ</Link>
            <ChevronRight size={10} />
            <span>Tài khoản</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-4xl text-white font-bold tracking-tight">Tài khoản của tôi</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
        </div>

        {/* ── Layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 mt-2 items-start">
          {/* ── Sidebar ── */}
          <aside className="flex flex-col gap-6 md:sticky md:top-24">
            {/* Avatar card */}
            <div className="flex flex-col items-center gap-4 p-6 bg-card border border-border rounded-2xl text-center shadow-lg">
              <div className="relative w-24 h-24">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary/40 shadow-inner"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-primary/40 flex items-center justify-center bg-primary/10 text-primary font-serif text-3xl font-bold shadow-md" aria-label="Avatar">
                    {avatarLetter}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-serif text-lg font-bold text-white tracking-tight leading-tight">{user?.fullName || 'Người dùng'}</h2>
                {user?.username && (
                  <p className="text-xs text-muted-foreground mt-1">@{user.username}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user?.emailVerified 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-destructive/10 border border-destructive/20 text-destructive'
                }`}>
                  {user?.emailVerified ? '✓ Đã xác minh' : '⚠ Chưa xác minh'}
                </span>
                {user?.role && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                )}
              </div>
            </div>

            {/* Tab nav */}
            <nav className="flex flex-row md:flex-col border border-border bg-card/60 rounded-2xl overflow-hidden shadow-md" aria-label="Profile sections">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    id={`tab-${tab.id}`}
                    className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-5 py-4 text-sm font-medium transition-all cursor-pointer border-b-2 md:border-b-0 md:border-l-2 active:outline-none ${
                      isActive 
                        ? 'bg-primary/5 text-primary border-primary font-semibold' 
                        : 'text-muted-foreground hover:bg-[#20242D]/45 hover:text-white border-transparent'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="hidden sm:inline md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Content ── */}
          <section className="w-full" aria-label={TABS.find((t) => t.id === activeTab)?.label}>
            {activeTab === 'info' && (
              <TabInfo user={user} onUserUpdated={handleUserUpdated} />
            )}
            {activeTab === 'password' && (
              <TabPassword isGoogleUser={isGoogleUser} />
            )}
            {activeTab === 'bookings' && (
              <TabBookings />
            )}
            {activeTab === 'loyalty' && (
              <TabLoyalty />
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 md:px-12 border-t border-border/40 bg-card/20 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <span className="font-serif font-bold text-white tracking-wide">BookEat</span>
        <span>© 2026 BookEat. Mọi quyền được bảo lưu.</span>
      </footer>
    </div>
  );
}
