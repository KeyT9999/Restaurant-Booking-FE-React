import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
  UserPlus,
  Utensils,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import '../../styles/auth.css';

const initialFormData = {
  username: '',
  email: '',
  fullName: '',
  phoneNumber: '',
  address: '',
  password: '',
  confirmPassword: '',
};

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithGoogle, register, registerRestaurantOwner } = useAuth();
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(true);
  const [accountType, setAccountType] = useState('customer');
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Đăng ký - Book Eat';

    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setShowAccountTypeModal(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.username.trim()) {
      nextErrors.username = 'Username không được để trống';
    } else if (formData.username.trim().length < 3) {
      nextErrors.username = 'Username phải có ít nhất 3 ký tự';
    }

    const emailRegex = /.*@(gmail\.com|outlook\.com\.vn|yahoo\.com|hotmail\.com|student\.ctu\.edu\.vn|ctu\.edu\.vn)$/;
    if (!formData.email.trim()) {
      nextErrors.email = 'Email không được để trống';
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email =
        'Email phải thuộc một trong các domain: @gmail.com, @outlook.com.vn, @yahoo.com, @hotmail.com, @student.ctu.edu.vn, @ctu.edu.vn';
    }

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Họ và tên không được để trống';
    }

    if (formData.phoneNumber.trim()) {
      const phoneRegex = /^(0[35789])[0-9]{8}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        nextErrors.phoneNumber = 'Số điện thoại phải là 10 số và bắt đầu bằng 03, 05, 07, 08, 09';
      }
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      nextErrors.password = 'Mật khẩu không được để trống';
    } else if (!passwordRegex.test(formData.password)) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const registerData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        address: formData.address.trim() || null,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      if (accountType === 'restaurant_owner') {
        await registerRestaurantOwner(registerData);
      } else {
        await register(registerData);
      }

      navigate('/auth/register-success', { replace: true });
    } catch (error) {
      setErrors({
        submit: error.message || 'Đăng ký thất bại. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {showAccountTypeModal && (
        <div className="account-type-overlay" role="dialog" aria-modal="true" aria-labelledby="account-type-title">
          <section className="account-type-modal">
            <div className="account-type-heading">
              <Utensils size={32} />
              <h2 id="account-type-title">Chọn loại tài khoản</h2>
              <p>Bạn muốn đăng ký với vai trò nào?</p>
            </div>
            <div className="account-type-actions">
              <button type="button" className="account-type-card" onClick={() => handleAccountTypeSelect('customer')}>
                <User size={34} />
                <span>
                  <strong>Đăng ký khách hàng</strong>
                  <small>Dùng để đặt bàn, khám phá nhà hàng và nhận ưu đãi.</small>
                </span>
              </button>
              <button
                type="button"
                className="account-type-card"
                onClick={() => handleAccountTypeSelect('restaurant_owner')}
              >
                <Store size={34} />
                <span>
                  <strong>Đăng ký chủ nhà hàng</strong>
                  <small>Quản lý nhà hàng, đặt bàn và chương trình ưu đãi.</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      <header className="auth-topbar">
        <Link to="/" className="auth-brand">
          <Utensils size={22} />
          Book Eat
        </Link>
        <Link to="/auth/login" className="auth-topbar-link">
          Đăng nhập
        </Link>
      </header>

      <section className="register-hero">
        <span>Trang chủ / Đăng ký</span>
        <h1>Đăng ký tài khoản</h1>
        <p>Tạo tài khoản để trải nghiệm dịch vụ đặt bàn nhà hàng tốt nhất</p>
      </section>

      <section className="auth-form-shell" aria-labelledby="register-title">
        <div className="form-title-row">
          <div className="feature-icon">
            <UserPlus size={22} />
          </div>
          <h2 id="register-title">Đăng ký tài khoản</h2>
        </div>

        {errors.submit && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertTriangle size={18} />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form register-form">
          <AuthInput
            id="username"
            name="username"
            label="Username"
            icon={<User size={16} />}
            value={formData.username}
            onChange={handleChange}
            placeholder="Nhập username"
            error={errors.username}
            required
          />

          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email"
            icon={<Mail size={16} />}
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email (VD: example@gmail.com)"
            error={errors.email}
            hint="Chỉ chấp nhận: @gmail.com, @outlook.com.vn, @yahoo.com, @hotmail.com, @student.ctu.edu.vn, @ctu.edu.vn"
            required
          />

          <AuthInput
            id="fullName"
            name="fullName"
            label="Họ và tên"
            icon={<User size={16} />}
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            error={errors.fullName}
            required
          />

          <AuthInput
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            label="Số điện thoại"
            icon={<Phone size={16} />}
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Nhập số điện thoại (VD: 0987654321)"
            error={errors.phoneNumber}
            hint="Định dạng: 0987654321"
          />

          <AuthInput
            id="address"
            name="address"
            label="Địa chỉ"
            icon={<MapPin size={16} />}
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ (tùy chọn)"
            error={errors.address}
          />

          <PasswordInput
            id="password"
            name="password"
            label="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            show={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            error={errors.password}
            hint="Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)"
            required
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
            error={errors.confirmPassword}
            required
          />

          <button type="submit" className="auth-primary-button" disabled={loading}>
            <UserPlus size={18} />
            <span>{loading ? 'Đang xử lý...' : 'Đăng ký'}</span>
          </button>

          <div className="login-separator">
            <span>HOẶC</span>
          </div>

          <button
            type="button"
            className="auth-google-button"
            onClick={loginWithGoogle}
          >
            Tiếp tục với Google
          </button>

          <p className="login-register">
            <span>Đã có tài khoản?</span>
            <Link to="/auth/login">Đăng nhập ngay</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function AuthInput({ id, label, icon, error, hint, ...inputProps }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>
        {icon}
        {label} {inputProps.required && <span className="required">*</span>}
      </label>
      <input id={id} className={error ? 'field-error' : ''} {...inputProps} />
      {error && <div className="invalid-feedback">{error}</div>}
      {hint && <small className="form-text">{hint}</small>}
    </div>
  );
}

function PasswordInput({ id, label, show, onToggle, error, hint, ...inputProps }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>
        <Lock size={16} />
        {label} {inputProps.required && <span className="required">*</span>}
      </label>
      <div className="password-input-wrapper">
        <input id={id} type={show ? 'text' : 'password'} className={error ? 'field-error' : ''} {...inputProps} />
        <button type="button" className="password-toggle" onClick={onToggle} aria-label={show ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <div className="invalid-feedback">{error}</div>}
      {hint && <small className="form-text">{hint}</small>}
    </div>
  );
}

export default Register;
