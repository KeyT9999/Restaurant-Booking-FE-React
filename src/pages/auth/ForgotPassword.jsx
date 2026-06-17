import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, Mail, Utensils } from 'lucide-react';
import { authApi } from '../../api/authApi';

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
    <main className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      {/* Background decoration lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <section className="w-full max-w-[440px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col gap-6 shadow-2xl relative backdrop-blur-md z-10" aria-labelledby="forgot-title">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl border border-primary/30 flex items-center justify-center text-primary bg-primary/10 shadow-md" aria-hidden="true">
            <Utensils size={28} />
          </div>
          <h1 id="forgot-title" className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight">
            Quên mật khẩu
          </h1>
          <p className="text-xs text-muted-foreground text-center max-w-[280px] leading-relaxed">
            {success
              ? 'Kiểm tra hộp thư của bạn'
              : 'Nhập email để nhận link đặt lại mật khẩu'}
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={40} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong className="text-white">{email}</strong>.
              <br />
              Link có hiệu lực trong <strong className="text-white">60 phút</strong>.
            </p>
            <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[260px]">
              Không thấy email? Hãy kiểm tra thư mục Spam hoặc thử gửi lại.
            </p>
            <Link
              to="/auth/login"
              className="mt-2 w-full h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Quay lại đăng nhập</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed" role="alert">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Mail size={14} />
                  <span>Địa chỉ email</span>
                  <span className="text-primary">*</span>
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
                  className="flex h-12 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
                disabled={loading || !email.trim()}
              >
                <Mail size={16} />
                <span>{loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}</span>
              </button>
            </form>

            {/* Back link */}
            <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1.5">
              <Link to="/auth/login" className="text-primary font-semibold hover:underline flex items-center gap-1">
                <ArrowLeft size={13} />
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
