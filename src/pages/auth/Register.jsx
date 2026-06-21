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
    <main className="min-h-screen w-full bg-[#0F1115] relative flex flex-col overflow-x-hidden">
      {/* Account Type Selection Overlay Modal */}
      {showAccountTypeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="account-type-title">
          <section className="w-full max-w-[640px] bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl border border-primary/30 flex items-center justify-center text-primary bg-primary/10 shadow-md">
                <Utensils size={28} />
              </div>
              <h2 id="account-type-title" className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight">
                Chọn loại tài khoản
              </h2>
              <p className="text-xs text-muted-foreground max-w-[280px]">Bạn muốn tham gia BookEat với vai trò nào?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <button
                type="button"
                className="flex flex-col items-center md:items-start gap-4 p-6 rounded-2xl border border-border bg-[#20242D]/40 hover:bg-[#20242D] hover:border-primary/50 text-left transition-all cursor-pointer outline-none group"
                onClick={() => handleAccountTypeSelect('customer')}
              >
                <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <User size={26} />
                </div>
                <div>
                  <strong className="text-base font-bold text-white block">Khách hàng</strong>
                  <span className="text-xs text-muted-foreground leading-relaxed mt-1 block">
                    Đặt bàn trực tuyến, khám phá các nhà hàng và nhận ưu đãi ăn uống cá nhân.
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="flex flex-col items-center md:items-start gap-4 p-6 rounded-2xl border border-border bg-[#20242D]/40 hover:bg-[#20242D] hover:border-primary/50 text-left transition-all cursor-pointer outline-none group"
                onClick={() => handleAccountTypeSelect('restaurant_owner')}
              >
                <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <Store size={24} />
                </div>
                <div>
                  <strong className="text-base font-bold text-white block">Chủ nhà hàng</strong>
                  <span className="text-xs text-muted-foreground leading-relaxed mt-1 block">
                    Đăng ký cơ sở kinh doanh, quản lý thông tin bàn trống, menu và nhận lịch đặt.
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Sticky Topbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-card/90 border-b border-border/60 backdrop-blur-md">
        <Link to="/" className="font-serif text-lg text-white font-bold flex items-center gap-2 hover:text-primary transition-all">
          <Utensils size={18} className="text-primary" />
          <span>Book Eat</span>
        </Link>
        <Link to="/auth/login" className="px-4 py-1.5 rounded-xl border border-border hover:bg-white/5 hover:border-white transition-all text-xs font-semibold text-white">
          Đăng nhập
        </Link>
      </header>

      {/* Hero Banner Section */}
      <section className="py-16 md:py-20 text-center relative border-b border-border/40 bg-card/25">
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-primary">
          Trang chủ / Đăng ký
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-white font-bold tracking-tight mt-3 mb-2">
          Đăng ký tài khoản
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed px-4">
          Tạo tài khoản để trải nghiệm dịch vụ đặt bàn nhà hàng tốt nhất và nhận hàng ngàn voucher ưu đãi.
        </p>
      </section>

      {/* Form Section */}
      <section className="w-full max-w-[640px] mx-auto my-12 p-6 md:p-10 bg-card border border-border rounded-2xl flex flex-col gap-6 shadow-2xl relative z-10 px-4 md:px-10" aria-labelledby="register-title">
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="w-10 h-10 rounded-xl border border-primary/30 flex items-center justify-center text-primary bg-primary/10">
            <UserPlus size={20} />
          </div>
          <h2 id="register-title" className="font-serif text-xl md:text-2xl text-white font-bold">
            Đăng ký {accountType === 'restaurant_owner' ? 'Chủ nhà hàng' : 'Khách hàng'}
          </h2>
        </div>

        {errors.submit && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed" role="alert">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AuthInput
            id="username"
            name="username"
            label="Username"
            icon={<User size={14} />}
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
            icon={<Mail size={14} />}
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email (VD: example@gmail.com)"
            error={errors.email}
            hint="Domain hợp lệ: @gmail.com, @outlook.com.vn, @yahoo.com, @hotmail.com, @student.ctu.edu.vn, @ctu.edu.vn"
            required
          />

          <AuthInput
            id="fullName"
            name="fullName"
            label="Họ và tên"
            icon={<User size={14} />}
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
            icon={<Phone size={14} />}
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Nhập số điện thoại (VD: 0987654321)"
            error={errors.phoneNumber}
            hint="Định dạng số điện thoại Việt Nam gồm 10 số (VD: 0912345678)"
          />

          <AuthInput
            id="address"
            name="address"
            label="Địa chỉ"
            icon={<MapPin size={14} />}
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ của bạn (tùy chọn)"
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
            hint="Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)"
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

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-3"
            disabled={loading}
          >
            <UserPlus size={16} />
            <span>{loading ? 'Đang xử lý...' : 'Đăng ký ngay'}</span>
          </button>

          {/* Separator */}
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-muted-foreground/60 my-2 before:h-px before:flex-1 before:bg-border/60 after:h-px after:flex-1 after:bg-border/60">
            <span>HOẶC</span>
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            className="w-full h-12 rounded-xl border border-border bg-transparent hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 text-white cursor-pointer"
            onClick={loginWithGoogle}
          >
            Tiếp tục với Google
          </button>

          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
            <span>Đã có tài khoản?</span>
            <Link to="/auth/login" className="text-primary font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function AuthInput({ id, label, icon, error, hint, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        {icon}
        <span>{label}</span>
        {inputProps.required && <span className="text-primary">*</span>}
      </label>
      <input
        id={id}
        className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
          error ? 'border-destructive' : 'border-border'
        }`}
        {...inputProps}
      />
      {error && <div className="text-xs text-destructive mt-0.5 font-medium">{error}</div>}
      {hint && <small className="text-[10px] text-muted-foreground/50 leading-relaxed block mt-0.5">{hint}</small>}
    </div>
  );
}

function PasswordInput({ id, label, show, onToggle, error, hint, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Lock size={14} />
        <span>{label}</span>
        {inputProps.required && <span className="text-primary">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`flex h-11 w-full rounded-xl border bg-[#20242D] pl-4 pr-11 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
            error ? 'border-destructive' : 'border-border'
          }`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <div className="text-xs text-destructive mt-0.5 font-medium">{error}</div>}
      {hint && <small className="text-[10px] text-muted-foreground/50 leading-relaxed block mt-0.5">{hint}</small>}
    </div>
  );
}

export default Register;
