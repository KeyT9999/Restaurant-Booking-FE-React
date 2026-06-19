import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Loader2 } from 'lucide-react';

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
    <main className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      <section className="w-full max-w-[440px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col items-center gap-6 shadow-2xl relative backdrop-blur-md z-10 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <h1 className="font-serif text-xl md:text-2xl text-white font-bold tracking-tight">Đang xử lý đăng nhập...</h1>
        <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
          Vui lòng chờ trong giây lát khi chúng tôi thiết lập phiên làm việc của bạn.
        </p>
      </section>
    </main>
  );
}

export default GoogleCallback;
