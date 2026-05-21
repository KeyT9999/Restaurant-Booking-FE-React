import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, Mail, Utensils } from 'lucide-react';
import { authApi } from '../../api/authApi';
import '../../styles/auth.css';

function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    document.title = 'Quên mật khẩu - Book Eat';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen login-screen">
      <section className="login-card" aria-labelledby="forgot-title">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo" aria-hidden="true">
            <Utensils size={28} />
          </div>
          <h1 id="forgot-title" className="login-brand" style={{ fontSize: '1.8rem' }}>
            Quên mật khẩu
          </h1>
          <p className="login-welcome">
            {success
              ? 'Kiểm tra hộp thư của bạn'
              : 'Nhập email để nhận link đặt lại mật khẩu'}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="verify-state">
            <CheckCircle size={64} className="verify-icon verify-icon-success" aria-hidden="true" />
            <p style={{ color: 'var(--color-faded-stone)', fontSize: '0.95rem', lineHeight: 1.7, textAlign: 'center' }}>
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong style={{ color: 'var(--color-aged-parchment)' }}>{email}</strong>.
              <br />
              Link có hiệu lực trong <strong>60 phút</strong>.
            </p>
            <p style={{ color: 'var(--color-faded-stone)', fontSize: '0.85rem', textAlign: 'center' }}>
              Không thấy email? Hãy kiểm tra thư mục Spam.
            </p>
            <Link to="/auth/login" className="verify-primary-btn" style={{ marginTop: '0.5rem' }}>
              <ArrowLeft size={17} />
              Về trang đăng nhập
            </Link>
          </div>
        ) : (
          <>
            {/* Error alert */}
            {error && (
              <div className="auth-alert auth-alert-error" role="alert">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="forgot-email">
                  <Mail size={16} />
                  Địa chỉ email <span className="required">*</span>
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  placeholder="Nhập email đã đăng ký"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="auth-primary-button"
                disabled={loading || !email.trim()}
              >
                <Mail size={18} />
                <span>{loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}</span>
              </button>
            </form>

            {/* Back link */}
            <p className="login-register">
              <Link to="/auth/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={14} />
                Quay lại đăng nhập
              </Link>
            </p>
          </>
        )}

      </section>
    </main>
  );
}

export default ForgotPassword;
