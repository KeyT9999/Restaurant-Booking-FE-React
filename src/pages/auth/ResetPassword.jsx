import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { authApi } from '../../api/authApi';
import '../../styles/auth.css';

function ResetPassword() {
  const [searchParams]         = useSearchParams();
  const token                  = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirm,  setShowConfirm]             = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    document.title = 'Đặt lại mật khẩu - Book Eat';
  }, []);

  if (!token) {
    return (
      <main className="auth-screen login-screen">
        <section className="login-card" style={{ textAlign: 'center', gap: '1.5rem' }}>
          <AlertTriangle size={64} className="verify-icon verify-icon-error" aria-hidden="true" />
          <h1 className="login-brand" style={{ fontSize: '1.5rem' }}>Link không hợp lệ</h1>
          <p className="login-welcome">Không tìm thấy token trong URL. Hãy yêu cầu link mới.</p>
          <Link to="/auth/forgot-password" className="verify-primary-btn">
            Yêu cầu link mới
          </Link>
        </section>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword(token, formData.password, formData.confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen login-screen">
      <section className="login-card" aria-labelledby="reset-title">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo" aria-hidden="true">
            <Lock size={28} />
          </div>
          <h1 id="reset-title" className="login-brand" style={{ fontSize: '1.8rem' }}>
            Đặt lại mật khẩu
          </h1>
          <p className="login-welcome">
            {success ? 'Mật khẩu đã được cập nhật thành công' : 'Nhập mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        {/* Success */}
        {success ? (
          <div className="verify-state">
            <CheckCircle size={64} className="verify-icon verify-icon-success" aria-hidden="true" />
            <p style={{ color: 'var(--color-faded-stone)', textAlign: 'center', lineHeight: 1.7 }}>
              Mật khẩu của bạn đã được đặt lại thành công.<br />
              Hãy đăng nhập với mật khẩu mới.
            </p>
            <Link to="/auth/login" className="verify-primary-btn">
              <LogIn size={17} />
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="auth-alert auth-alert-error" role="alert">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Password */}
              <div className="auth-field">
                <label htmlFor="reset-password">
                  <Lock size={16} />
                  Mật khẩu mới <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Ít nhất 8 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label htmlFor="reset-confirm-password">
                  <Lock size={16} />
                  Xác nhận mật khẩu <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="reset-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-primary-button"
                disabled={loading || !formData.password || !formData.confirmPassword}
              >
                <Lock size={18} />
                <span>{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</span>
              </button>
            </form>

            <p className="login-register">
              <Link to="/auth/forgot-password" className="auth-link">
                Yêu cầu link mới
              </Link>
            </p>
          </>
        )}

      </section>
    </main>
  );
}

export default ResetPassword;
