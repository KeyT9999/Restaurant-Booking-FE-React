import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, LogIn, Mail, RefreshCw, Utensils } from 'lucide-react';
import { authApi } from '../../api/authApi';

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
    <main className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      {/* Background decoration lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <section className="w-full max-w-[480px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col gap-6 shadow-2xl relative backdrop-blur-md z-10 text-center" aria-live="polite">
        
        {/* ── Loading ── */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <RefreshCw size={48} className="animate-spin text-primary" />
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Đang xác minh tài khoản...</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
              Vui lòng chờ trong giây lát khi hệ thống xác thực tài khoản của bạn.
            </p>
          </div>
        )}

        {/* ── Success ── */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Xác minh thành công!</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
              Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <Link
              to="/auth/login"
              className="mt-2 w-full h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={16} />
              <span>Đăng nhập ngay</span>
            </Link>
          </div>
        )}

        {/* ── Already verified ── */}
        {status === 'already_verified' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <CheckCircle size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Tài khoản đã xác minh</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
              Tài khoản của bạn đã được xác minh từ trước. Hãy đăng nhập để bắt đầu trải nghiệm.
            </p>
            <Link
              to="/auth/login"
              className="mt-2 w-full h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={16} />
              <span>Đăng nhập</span>
            </Link>
          </div>
        )}

        {/* ── Token expired — cho phép gửi lại ── */}
        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Đường dẫn hết hạn</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[320px]">
              {message}
            </p>

            {/* Form gửi lại */}
            {!resendSuccess ? (
              <form onSubmit={handleResend} className="w-full flex flex-col gap-3 mt-2 text-left">
                <p className="text-xs text-muted-foreground">Nhập email của bạn để nhận lại link xác minh mới:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      id="resend-email"
                      type="email"
                      placeholder="email@example.com"
                      value={resendEmail || userEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                      className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="h-11 px-5 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                    <span>Gửi lại</span>
                  </button>
                </div>
                {resendMessage && (
                  <p className="text-xs text-destructive mt-1">{resendMessage}</p>
                )}
              </form>
            ) : (
              <div className="w-full flex items-center gap-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs text-left">
                <CheckCircle size={16} className="shrink-0" />
                <span>{resendMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Invalid token ── */}
        {status === 'invalid' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <AlertTriangle size={36} />
            </div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Token không hợp lệ</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[320px]">
              {message || 'Mã xác minh không đúng hoặc đã được sử dụng.'}
            </p>

            {/* Vẫn cho gửi lại */}
            {!resendSuccess ? (
              <form onSubmit={handleResend} className="w-full flex flex-col gap-3 mt-2 text-left">
                <p className="text-xs text-muted-foreground">Thử gửi lại email xác minh bằng địa chỉ email đã đăng ký:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      id="resend-email-invalid"
                      type="email"
                      placeholder="email@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                      className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="h-11 px-5 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                    <span>Gửi lại</span>
                  </button>
                </div>
                {resendMessage && (
                  <p className="text-xs text-destructive mt-1">{resendMessage}</p>
                )}
              </form>
            ) : (
              <div className="w-full flex items-center gap-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs text-left">
                <CheckCircle size={16} className="shrink-0" />
                <span>{resendMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Footer link ── */}
        <div className="h-px bg-border/40 w-full mt-2" />
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
          <Utensils size={14} aria-hidden="true" />
          <Link to="/" className="text-primary font-semibold hover:underline">
            Về trang chủ BookEat
          </Link>
        </div>

      </section>
    </main>
  );
}

export default VerifyEmail;
