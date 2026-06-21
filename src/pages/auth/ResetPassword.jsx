import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { authApi } from '../../api/authApi';

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
      <main className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
        <section className="w-full max-w-[440px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col items-center gap-6 shadow-2xl relative backdrop-blur-md z-10 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2">
            <AlertTriangle size={36} />
          </div>
          <h1 className="font-serif text-xl md:text-2xl text-white font-bold tracking-tight">Link không hợp lệ</h1>
          <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
            Không tìm thấy mã bảo mật (token) trong địa chỉ truy cập. Hãy yêu cầu một đường dẫn mới.
          </p>
          <Link
            to="/auth/forgot-password"
            className="w-full h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
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
    <main className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      {/* Background decoration lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <section className="w-full max-w-[440px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col gap-6 shadow-2xl relative backdrop-blur-md z-10" aria-labelledby="reset-title">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl border border-primary/30 flex items-center justify-center text-primary bg-primary/10 shadow-md" aria-hidden="true">
            <Lock size={28} />
          </div>
          <h1 id="reset-title" className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight">
            Đặt lại mật khẩu
          </h1>
          <p className="text-xs text-muted-foreground text-center max-w-[280px] leading-relaxed">
            {success ? 'Mật khẩu đã được cập nhật thành công' : 'Nhập mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={40} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mật khẩu của bạn đã được đặt lại thành công.
              <br />
              Hãy đăng nhập lại với mật khẩu mới.
            </p>
            <Link
              to="/auth/login"
              className="mt-2 w-full h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={16} />
              <span>Đăng nhập ngay</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed" role="alert">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Lock size={14} />
                  <span>Mật khẩu mới</span>
                  <span className="text-primary">*</span>
                </label>
                <div className="relative">
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
                    className="flex h-12 w-full rounded-xl border border-border bg-[#20242D] pl-4 pr-11 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-confirm-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Lock size={14} />
                  <span>Xác nhận mật khẩu</span>
                  <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reset-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="flex h-12 w-full rounded-xl border border-border bg-[#20242D] pl-4 pr-11 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
                    aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
                disabled={loading || !formData.password || !formData.confirmPassword}
              >
                <Lock size={16} />
                <span>{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</span>
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-2">
              <Link to="/auth/forgot-password" className="text-primary font-semibold hover:underline">
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
