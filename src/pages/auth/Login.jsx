import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle, Lock, Mail, RefreshCw, Utensils, User } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/useAuth';
import '../../styles/auth.css';

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
    <main className="auth-screen login-screen">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-header">
          <div className="login-logo" aria-hidden="true">
            <Utensils size={30} />
          </div>
          <h1 id="login-title" className="login-brand">
            Book Eat
          </h1>
          <p className="login-welcome">Đăng nhập để tiếp tục hành trình ẩm thực của bạn</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertCircle size={18} />
            <div>
              <strong>Đăng nhập thất bại</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Banner gửi lại email xác minh */}
        {needsVerification && (
          <div className="auth-alert" style={{ background: 'rgba(212,150,83,0.08)', border: '1px solid rgba(212,150,83,0.3)', color: 'var(--color-aged-parchment)', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Mail size={17} />
              <span style={{ fontWeight: 600 }}>Tài khoản chưa xác minh</span>
            </div>
            {resendMessage ? (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', color: 'var(--color-amber-glow)' }}>
                <CheckCircle size={15} />
                <span style={{ fontSize: '0.85rem' }}>{resendMessage}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.85rem', color: 'var(--color-amber-glow)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: 0, textDecoration: 'underline',
                }}
              >
                <RefreshCw size={14} />
                {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác minh'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="username">
              <User size={16} />
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
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              <Lock size={16} />
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
            />
          </div>

          <div className="login-options">
            <label className="auth-check">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading || googleLoading}
              />
              <span>Ghi nhớ tôi</span>
            </label>
            <Link to="/auth/forgot-password" className="auth-link">
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="auth-primary-button" disabled={loading || googleLoading}>
            <span>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>

          <div className="login-separator">
            <span>HOẶC</span>
          </div>

          <button
            type="button"
            id="btn-google-login"
            className="auth-google-button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              'Đang chuyển hướng...'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Đăng nhập với Google
              </>
            )}
          </button>

          <p className="login-register">
            <span>Chưa có tài khoản?</span>
            <Link to="/auth/register">Đăng ký ngay.</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
