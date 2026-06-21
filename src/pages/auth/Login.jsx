import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle, Lock, Mail, RefreshCw, Utensils, User } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/useAuth';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const urlError = searchParams.get('error');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState(() => (urlError ? decodeURIComponent(urlError) : ''));
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // State khi tài khoản chưa verify email
  const [needsVerification, setNeedsVerification]   = useState(false);
  const [unverifiedEmail,   setUnverifiedEmail]     = useState('');
  const [resendLoading,     setResendLoading]       = useState(false);
  const [resendMessage,     setResendMessage]       = useState('');

  useEffect(() => {
    document.title = 'Đăng nhập - Book Eat';

    // Hiển thị lỗi từ query string (do OAuth callback redirect về)
    if (isAuthenticated) {
      navigate(searchParams.get('redirect') || '/', { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNeedsVerification(false);
    setResendMessage('');

    try {
      await login(formData.username, formData.password, formData.rememberMe);
      navigate(searchParams.get('redirect') || '/', { replace: true });
    } catch (err) {
      // BE trả 403 + needsVerification:true khi chưa verify email
      if (err?.raw?.response?.data?.needsVerification) {
        setNeedsVerification(true);
        setUnverifiedEmail(err?.raw?.response?.data?.email || '');
        setError(err.message || 'Tài khoản chưa được xác minh.');
      } else {
        setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    setResendMessage('');
    try {
      await authApi.resendVerification(unverifiedEmail);
      setResendMessage('Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư!');
    } catch (e) {
      setResendMessage(e?.message || 'Không thể gửi lại email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = (event) => {
    event.preventDefault();
    setGoogleLoading(true);
    setError('');
    // Redirect toàn trang sang BE /auth/google → Google → callback FE
    loginWithGoogle();
  };

  return (
    <main className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      {/* Background decoration lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <section className="w-full max-w-[440px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col gap-6 shadow-2xl relative backdrop-blur-md z-10" aria-labelledby="login-title">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl border border-primary/30 flex items-center justify-center text-primary bg-primary/10 shadow-md" aria-hidden="true">
            <Utensils size={28} />
          </div>
          <h1 id="login-title" className="font-serif text-3xl text-white font-bold tracking-tight">
            Book Eat
          </h1>
          <p className="text-xs text-muted-foreground text-center max-w-[280px] leading-relaxed">
            Đăng nhập để tiếp tục hành trình ẩm thực của bạn
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed" role="alert">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Đăng nhập thất bại</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Banner gửi lại email xác minh */}
        {needsVerification && (
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs">
            <div className="flex gap-2 items-center text-white font-semibold">
              <Mail size={16} />
              <span>Tài khoản chưa xác minh</span>
            </div>
            {resendMessage ? (
              <div className="flex gap-2 items-center text-primary font-medium">
                <CheckCircle size={14} />
                <span>{resendMessage}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="flex items-center gap-1.5 font-bold text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer outline-none underline self-start"
              >
                <RefreshCw size={13} className={resendLoading ? 'animate-spin' : ''} />
                {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác minh'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User size={14} />
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Nhập tên đăng nhập hoặc email"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              disabled={loading || googleLoading}
              className="flex h-12 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Lock size={14} />
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading || googleLoading}
              className="flex h-12 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs mt-1">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading || googleLoading}
                className="h-4 w-4 rounded border-border bg-[#20242D] text-primary focus:ring-primary accent-primary"
              />
              <span>Ghi nhớ tôi</span>
            </label>
            <Link to="/auth/forgot-password" className="text-primary font-medium hover:underline transition-all">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            disabled={loading || googleLoading}
          >
            <span>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-muted-foreground/60 my-2 before:h-px before:flex-1 before:bg-border/60 after:h-px after:flex-1 after:bg-border/60">
            <span>HOẶC</span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            id="btn-google-login"
            className="w-full h-12 rounded-xl border border-border bg-transparent hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <span className="text-muted-foreground">Đang chuyển hướng...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Đăng nhập với Google</span>
              </>
            )}
          </button>

          {/* Footer Register Link */}
          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
            <span>Chưa có tài khoản?</span>
            <Link to="/auth/register" className="text-primary font-semibold hover:underline">
              Đăng ký ngay.
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
