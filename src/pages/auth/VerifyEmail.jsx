import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, LogIn, Mail, RefreshCw, Utensils } from 'lucide-react';
import { authApi } from '../../api/authApi';
import '../../styles/auth.css';

/**
 * Trang xác minh email.
 * Được mở khi user bấm link trong email: /auth/verify-email?token=...
 */
function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // status: 'loading' | 'success' | 'expired' | 'invalid' | 'already_verified'
  const [status, setStatus]         = useState('loading');
  const [message, setMessage]       = useState('');
  const [userEmail, setUserEmail]   = useState('');
  const processed                   = useRef(false);

  // ─── Gửi lại email ───
  const [resendEmail, setResendEmail]         = useState('');
  const [resendLoading, setResendLoading]     = useState(false);
  const [resendMessage, setResendMessage]     = useState('');
  const [resendSuccess, setResendSuccess]     = useState(false);

  useEffect(() => {
    document.title = 'Xác minh tài khoản - Book Eat';

    if (processed.current) return;
    processed.current = true;

    if (!token) {
      setStatus('invalid');
      setMessage('Không tìm thấy token xác minh trong URL.');
      return;
    }

    // Gọi API verify
    authApi.verifyEmail(token)
      .then((res) => {
        if (res?.success) {
          setStatus('success');
          setMessage(res.message || 'Xác minh tài khoản thành công!');
        } else {
          setStatus('invalid');
          setMessage(res?.message || 'Xác minh thất bại.');
        }
      })
      .catch((err) => {
        const code = err?.raw?.response?.data?.code || '';
        const msg  = err?.message || 'Không thể xác minh tài khoản.';
        const email = err?.raw?.response?.data?.email || '';

        if (code === 'TOKEN_EXPIRED') {
          setStatus('expired');
          setUserEmail(email);
        } else if (code === 'ALREADY_VERIFIED') {
          setStatus('already_verified');
        } else {
          setStatus('invalid');
        }
        setMessage(msg);
      });
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    setResendMessage('');

    try {
      const targetEmail = resendEmail || userEmail;
      await authApi.resendVerification(targetEmail);
      setResendSuccess(true);
      setResendMessage('Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư!');
    } catch (err) {
      setResendSuccess(false);
      setResendMessage(err?.message || 'Không thể gửi lại email. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="auth-screen login-screen">
      <section className="verify-email-card" aria-live="polite">

        {/* ── Loading ── */}
        {status === 'loading' && (
          <div className="verify-state">
            <div className="verify-spinner" aria-hidden="true" />
            <h1 className="verify-title">Đang xác minh tài khoản...</h1>
            <p className="verify-subtitle">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {/* ── Success ── */}
        {status === 'success' && (
          <div className="verify-state">
            <CheckCircle size={72} className="verify-icon verify-icon-success" aria-hidden="true" />
            <h1 className="verify-title">Xác minh thành công!</h1>
            <p className="verify-subtitle">
              Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <Link to="/auth/login" className="verify-primary-btn">
              <LogIn size={18} />
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {/* ── Already verified ── */}
        {status === 'already_verified' && (
          <div className="verify-state">
            <CheckCircle size={72} className="verify-icon verify-icon-success" aria-hidden="true" />
            <h1 className="verify-title">Tài khoản đã xác minh</h1>
            <p className="verify-subtitle">
              Tài khoản của bạn đã được xác minh trước đó. Hãy đăng nhập để tiếp tục.
            </p>
            <Link to="/auth/login" className="verify-primary-btn">
              <LogIn size={18} />
              Đăng nhập
            </Link>
          </div>
        )}

        {/* ── Token expired — cho phép gửi lại ── */}
        {status === 'expired' && (
          <div className="verify-state">
            <Clock size={72} className="verify-icon verify-icon-warn" aria-hidden="true" />
            <h1 className="verify-title">Link đã hết hạn</h1>
            <p className="verify-subtitle">{message}</p>

            {/* Form gửi lại */}
            {!resendSuccess ? (
              <form onSubmit={handleResend} className="verify-resend-form">
                <p className="verify-resend-label">Nhập email để nhận link xác minh mới:</p>
                <div className="verify-resend-row">
                  <div className="auth-field" style={{ flex: 1 }}>
                    <label htmlFor="resend-email" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                      <Mail size={15} />
                      Email
                    </label>
                    <input
                      id="resend-email"
                      type="email"
                      placeholder="email@example.com"
                      value={resendEmail || userEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="verify-resend-btn"
                    disabled={resendLoading}
                  >
                    <RefreshCw size={16} />
                    {resendLoading ? 'Đang gửi...' : 'Gửi lại'}
                  </button>
                </div>
                {resendMessage && (
                  <p className="verify-resend-error">{resendMessage}</p>
                )}
              </form>
            ) : (
              <div className="verify-resend-success">
                <CheckCircle size={20} />
                <span>{resendMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Invalid token ── */}
        {status === 'invalid' && (
          <div className="verify-state">
            <AlertTriangle size={72} className="verify-icon verify-icon-error" aria-hidden="true" />
            <h1 className="verify-title">Token không hợp lệ</h1>
            <p className="verify-subtitle">{message || 'Link xác minh không đúng hoặc đã được sử dụng.'}</p>

            {/* Vẫn cho gửi lại phòng trường hợp nhầm */}
            {!resendSuccess ? (
              <form onSubmit={handleResend} className="verify-resend-form">
                <p className="verify-resend-label">Thử gửi lại email xác minh:</p>
                <div className="verify-resend-row">
                  <div className="auth-field" style={{ flex: 1 }}>
                    <label htmlFor="resend-email-invalid" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                      <Mail size={15} />
                      Email đã đăng ký
                    </label>
                    <input
                      id="resend-email-invalid"
                      type="email"
                      placeholder="email@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="verify-resend-btn" disabled={resendLoading}>
                    <RefreshCw size={16} />
                    {resendLoading ? 'Đang gửi...' : 'Gửi lại'}
                  </button>
                </div>
                {resendMessage && (
                  <p className={resendSuccess ? 'verify-resend-ok' : 'verify-resend-error'}>
                    {resendMessage}
                  </p>
                )}
              </form>
            ) : (
              <div className="verify-resend-success">
                <CheckCircle size={20} />
                <span>{resendMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Footer link ── */}
        <div className="verify-footer">
          <Utensils size={14} aria-hidden="true" />
          <Link to="/" className="verify-home-link">Về trang chủ BookEat</Link>
        </div>

      </section>
    </main>
  );
}

export default VerifyEmail;
