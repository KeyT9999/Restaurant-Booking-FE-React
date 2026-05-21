import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import '../../styles/auth.css';

/**
 * Trang callback sau khi Google OAuth hoàn tất.
 * BE redirect về đây với ?token=... hoặc ?error=...
 */
function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const expiresIn = searchParams.get('expires_in');
    const error = searchParams.get('error');

    if (error || !token) {
      const messages = {
        google_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
        no_user: 'Không thể lấy thông tin tài khoản từ Google.',
        server_error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      };
      const msg = messages[error] || 'Đăng nhập Google thất bại.';
      navigate(`/auth/login?error=${encodeURIComponent(msg)}`, { replace: true });
      return;
    }

    // Lưu token và load user profile
    loginWithToken(token, expiresIn)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/auth/login?error=' + encodeURIComponent('Phiên đăng nhập không hợp lệ.'), { replace: true });
      });
  }, [searchParams, navigate, loginWithToken]);

  return (
    <main className="auth-screen login-screen">
      <section className="login-card" style={{ textAlign: 'center', gap: '1.5rem' }}>
        <div className="login-logo" aria-hidden="true" style={{ margin: '0 auto' }}>
          <div className="google-callback-spinner" />
        </div>
        <h1 className="login-brand" style={{ fontSize: '1.4rem' }}>Đang xử lý đăng nhập...</h1>
        <p className="login-welcome">Vui lòng chờ trong giây lát</p>
      </section>
    </main>
  );
}

export default GoogleCallback;
