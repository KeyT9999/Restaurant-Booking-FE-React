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
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { profileApi } from '../../api/profileApi';
import Header from '../../components/Header';
import '../../styles/profile.css';

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
    <div className={`profile-alert profile-alert-${type}`} role="alert">
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
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
    <div className="profile-panel">
      {/* ── Thông tin hiển thị ── */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h2 className="profile-card-title">Thông tin tài khoản</h2>
          <p className="profile-card-sub">Thông tin được liên kết với tài khoản BookEat của bạn.</p>
        </div>

        <ProfileAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span className="profile-info-label">
              <User size={11} style={{ display: 'inline', marginRight: 4 }} />
              Họ và tên
            </span>
            <span className="profile-info-value">{user?.fullName || '—'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              <Mail size={11} style={{ display: 'inline', marginRight: 4 }} />
              Email
            </span>
            <span className="profile-info-value">{user?.email || '—'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              <User size={11} style={{ display: 'inline', marginRight: 4 }} />
              Tên đăng nhập
            </span>
            <span className="profile-info-value">{user?.username || '—'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              <Phone size={11} style={{ display: 'inline', marginRight: 4 }} />
              Số điện thoại
            </span>
            <span className={`profile-info-value ${!user?.phoneNumber ? 'empty' : ''}`}>
              {user?.phoneNumber || 'Chưa cập nhật'}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              <MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />
              Địa chỉ
            </span>
            <span className={`profile-info-value ${!user?.address ? 'empty' : ''}`}>
              {user?.address || 'Chưa cập nhật'}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              <Shield size={11} style={{ display: 'inline', marginRight: 4 }} />
              Vai trò
            </span>
            <span className="profile-info-value">
              {ROLE_LABELS[user?.role] || user?.role || '—'}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
              Ngày tham gia
            </span>
            <span className="profile-info-value">
              {formatDate(user?.createdAt) || '—'}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">
              <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
              Đăng nhập gần nhất
            </span>
            <span className={`profile-info-value ${!user?.lastLogin ? 'empty' : ''}`}>
              {formatDate(user?.lastLogin) || 'Chưa ghi nhận'}
            </span>
          </div>
        </div>

        {!editing && (
          <div className="profile-form-actions" style={{ marginTop: 'var(--spacing-24)' }}>
            <button
              type="button"
              id="btn-edit-profile"
              className="profile-btn-primary"
              onClick={() => setEditing(true)}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        )}
      </div>

      {/* ── Form chỉnh sửa ── */}
      {editing && (
        <div className="profile-card">
          <div className="profile-card-header">
            <h2 className="profile-card-title">Chỉnh sửa thông tin</h2>
            <p className="profile-card-sub">Email và tên đăng nhập không thể thay đổi tại đây.</p>
          </div>

          <form className="profile-form" onSubmit={handleSubmit} id="form-update-profile">
            {/* Họ tên */}
            <div className="profile-field">
              <label htmlFor="fullName">
                <User size={14} />
                Họ và tên <span style={{ color: 'var(--color-amber-glow)' }}>*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                className={errors.fullName ? 'field-error' : ''}
                disabled={loading}
                autoFocus
              />
              {errors.fullName && (
                <span className="field-error-msg">{errors.fullName}</span>
              )}
            </div>

            <div className="profile-form-row">
              {/* Số điện thoại */}
              <div className="profile-field">
                <label htmlFor="phoneNumber">
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
                  className={errors.phoneNumber ? 'field-error' : ''}
                  disabled={loading}
                />
                {errors.phoneNumber ? (
                  <span className="field-error-msg">{errors.phoneNumber}</span>
                ) : (
                  <span className="field-hint">10 số, bắt đầu bằng 03/05/07/08/09</span>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="profile-field">
                <label htmlFor="address">
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
                />
              </div>
            </div>

            {/* Email — readonly */}
            <div className="profile-field">
              <label htmlFor="email-readonly">
                <Mail size={14} />
                Email (không thể thay đổi)
              </label>
              <input
                type="email"
                id="email-readonly"
                value={user?.email || ''}
                disabled
                readOnly
              />
              <span className="field-hint">Liên hệ hỗ trợ nếu cần đổi email.</span>
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                id="btn-save-profile"
                className="profile-btn-primary"
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                id="btn-cancel-edit"
                className="profile-btn-ghost"
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
      <div className="profile-panel">
        <div className="profile-card">
          <div className="profile-card-header">
            <h2 className="profile-card-title">Đổi mật khẩu</h2>
          </div>
          <div className="profile-empty-state">
            <span className="profile-empty-icon">🔒</span>
            <p className="profile-empty-title">Tài khoản Google</p>
            <p className="profile-empty-sub">
              Tài khoản của bạn được liên kết với Google. Vui lòng quản lý mật khẩu qua tài khoản Google của bạn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-panel">
      <div className="profile-card">
        <div className="profile-card-header">
          <h2 className="profile-card-title">Đổi mật khẩu</h2>
          <p className="profile-card-sub">
            Mật khẩu mới phải có ít nhất 8 ký tự và khác mật khẩu hiện tại.
          </p>
        </div>

        <ProfileAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        <form className="profile-form" onSubmit={handleSubmit} id="form-change-password">
          {/* Mật khẩu hiện tại */}
          <div className="profile-field">
            <label htmlFor="currentPassword">
              <Lock size={14} />
              Mật khẩu hiện tại <span style={{ color: 'var(--color-amber-glow)' }}>*</span>
            </label>
            <div className="pwd-input-wrap">
              <input
                type={show.currentPassword ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu hiện tại"
                className={errors.currentPassword ? 'field-error' : ''}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => toggleShow('currentPassword')}
                aria-label="Hiện/ẩn mật khẩu"
              >
                {show.currentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="field-error-msg">{errors.currentPassword}</span>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className="profile-field">
            <label htmlFor="newPassword">
              <Lock size={14} />
              Mật khẩu mới <span style={{ color: 'var(--color-amber-glow)' }}>*</span>
            </label>
            <div className="pwd-input-wrap">
              <input
                type={show.newPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự"
                className={errors.newPassword ? 'field-error' : ''}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => toggleShow('newPassword')}
                aria-label="Hiện/ẩn mật khẩu mới"
              >
                {show.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="field-error-msg">{errors.newPassword}</span>
            )}
            {!errors.newPassword && form.newPassword.length > 0 && (
              <span className="field-hint">
                Độ mạnh: {form.newPassword.length < 8 ? '⚠️ Quá ngắn' : form.newPassword.length < 12 ? '🟡 Trung bình' : '✅ Tốt'}
              </span>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="profile-field">
            <label htmlFor="confirmPassword">
              <Lock size={14} />
              Xác nhận mật khẩu mới <span style={{ color: 'var(--color-amber-glow)' }}>*</span>
            </label>
            <div className="pwd-input-wrap">
              <input
                type={show.confirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                className={errors.confirmPassword ? 'field-error' : ''}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => toggleShow('confirmPassword')}
                aria-label="Hiện/ẩn xác nhận mật khẩu"
              >
                {show.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error-msg">{errors.confirmPassword}</span>
            )}
            {!errors.confirmPassword &&
              form.confirmPassword.length > 0 &&
              form.newPassword === form.confirmPassword && (
                <span className="field-hint" style={{ color: '#6ab47a' }}>
                  ✅ Mật khẩu khớp
                </span>
              )}
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              id="btn-change-password"
              className="profile-btn-primary"
              disabled={loading}
            >
              <Lock size={16} />
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Lịch sử đặt bàn (placeholder)
// ─────────────────────────────────────────────

function TabBookings() {
  // TODO: Implement khi backend có model Booking
  // const [bookings, setBookings] = useState([]);
  // useEffect(() => { profileApi.getMyBookings().then(setBookings); }, []);

  return (
    <div className="profile-panel">
      <div className="profile-card">
        <div className="profile-card-header">
          <h2 className="profile-card-title">Lịch sử đặt bàn</h2>
          <p className="profile-card-sub">Danh sách các lần đặt bàn của bạn tại BookEat.</p>
        </div>
        {/* TODO: Replace with booking list khi backend có Booking model */}
        <div className="profile-empty-state">
          <span className="profile-empty-icon">📅</span>
          <p className="profile-empty-title">Chưa có lịch sử đặt bàn</p>
          <p className="profile-empty-sub">
            Bạn chưa đặt bàn tại nhà hàng nào. Hãy khám phá các nhà hàng tuyệt vời trên BookEat!
          </p>
          <Link
            to="/restaurants"
            className="profile-btn-primary"
            id="btn-explore-restaurants"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginTop: '8px' }}
          >
            Khám phá nhà hàng
            <ChevronRight size={16} />
          </Link>
        </div>
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
      <div className="profile-page">
        <Header />
        <main className="profile-main">
          <div className="profile-loading">
            <div className="profile-spinner" />
            <span>Đang tải thông tin tài khoản...</span>
          </div>
        </main>
      </div>
    );
  }

  // ── Error ──
  if (pageError) {
    return (
      <div className="profile-page">
        <Header />
        <main className="profile-main">
          <div className="profile-card" style={{ textAlign: 'center', padding: 'var(--spacing-62)' }}>
            <AlertCircle size={40} style={{ color: '#c87272', margin: '0 auto var(--spacing-16)' }} />
            <h2 style={{ color: 'var(--color-aged-parchment)', marginBottom: 'var(--spacing-8)' }}>
              Không thể tải trang
            </h2>
            <p style={{ color: 'var(--color-faded-stone)', marginBottom: 'var(--spacing-20)' }}>
              {pageError}
            </p>
            <Link to="/auth/login" className="profile-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', margin: '0 auto' }}>
              Đăng nhập lại
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const user = profileUser || authUser;
  const isGoogleUser = Boolean(user?.googleId || (!user?.phoneNumber && user?.emailVerified && !user?.username?.startsWith('@')));
  // Cách chính xác hơn: check nếu user có googleId trả về từ API
  // Hiện tại toPublicJSON() chưa trả googleId, nên dùng flag googleUser từ context nếu có

  const avatarLetter = (user?.fullName || user?.username || '?')[0].toUpperCase();

  return (
    <div className="profile-page">
      <Header />

      <main className="profile-main" id="profile-main">
        {/* ── Page Header ── */}
        <div className="profile-page-header">
          <nav className="profile-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={12} />
            <span>Tài khoản</span>
          </nav>
          <h1 className="profile-page-title">Tài khoản của tôi</h1>
          <p className="profile-page-sub">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
        </div>

        {/* ── Layout ── */}
        <div className="profile-layout">
          {/* ── Sidebar ── */}
          <aside className="profile-sidebar">
            {/* Avatar card */}
            <div className="profile-avatar-card">
              <div className="profile-avatar-wrap">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-initials" aria-label="Avatar">
                    {avatarLetter}
                  </div>
                )}
              </div>

              <div>
                <h2 className="profile-sidebar-name">{user?.fullName || 'Người dùng'}</h2>
                {user?.username && (
                  <p className="profile-sidebar-username">@{user.username}</p>
                )}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                <span className={`profile-badge ${user?.emailVerified ? 'profile-badge-verified' : 'profile-badge-unverified'}`}>
                  {user?.emailVerified ? '✓ Đã xác minh' : '⚠ Chưa xác minh'}
                </span>
                {user?.role && (
                  <span className="profile-badge profile-badge-role">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                )}
              </div>

              {/* TODO: Upload avatar khi backend có multer */}
              <p className="profile-avatar-upload-hint">
                {/* Tính năng đổi ảnh đại diện sẽ sớm có */}
              </p>
            </div>

            {/* Tab nav */}
            <nav className="profile-nav" aria-label="Profile sections">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    id={`tab-${tab.id}`}
                    className={`profile-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <Icon size={16} className="profile-nav-icon" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Content ── */}
          <section aria-label={TABS.find((t) => t.id === activeTab)?.label}>
            {activeTab === 'info' && (
              <TabInfo user={user} onUserUpdated={handleUserUpdated} />
            )}
            {activeTab === 'password' && (
              <TabPassword isGoogleUser={false} />
            )}
            {activeTab === 'bookings' && (
              <TabBookings />
            )}
          </section>
        </div>
      </main>

      {/* Footer inline — không phá layout homepage */}
      <footer className="home-footer" style={{ marginTop: 'auto' }}>
        <div className="container">
          <span className="footer-brand">BookEat</span>
          <span className="footer-copy">© 2026 BookEat. Mọi quyền được bảo lưu.</span>
        </div>
      </footer>
    </div>
  );
}
