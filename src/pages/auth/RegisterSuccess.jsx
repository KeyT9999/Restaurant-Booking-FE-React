import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, LogIn } from 'lucide-react';

function RegisterSuccess() {
  useEffect(() => {
    document.title = 'Đăng ký thành công - Book Eat';
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#0F1115] relative flex items-center justify-center p-4 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(212,150,83,0.06)_0%,transparent_70%)]">
      {/* Background decoration lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <section className="w-full max-w-[560px] p-8 md:p-10 bg-card/90 border border-border rounded-2xl flex flex-col items-center gap-6 shadow-2xl relative backdrop-blur-md z-10 text-center" aria-labelledby="register-success-title">
        <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
          <CheckCircle size={48} className="success-icon" />
        </div>
        <h1 id="register-success-title" className="font-serif text-3xl text-white font-bold tracking-tight">
          Đăng ký thành công!
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          Cảm ơn bạn đã đăng ký tài khoản tại <strong className="text-white font-semibold">Book Eat</strong>.
        </p>

        {/* Hướng dẫn xác minh email */}
        <div className="w-full flex flex-col gap-2 p-5 rounded-xl border border-primary/25 bg-primary/5 text-left text-sm text-white">
          <strong className="font-bold flex items-center gap-1.5 text-primary text-base">
            <span>📧 Kiểm tra email của bạn</span>
          </strong>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chúng tôi đã gửi một email xác minh đến địa chỉ bạn đã đăng ký.
            Vui lòng bấm vào link trong email để kích hoạt tài khoản trước khi đăng nhập.
          </p>
          <div className="h-px bg-border/40 my-1" />
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            Không thấy email? Hãy kiểm tra thư mục <strong className="text-white font-semibold">Spam</strong> hoặc hộp thư rác.
          </p>
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-center gap-3 mt-2">
          <Link
            to="/auth/login"
            className="flex-1 h-12 rounded-xl bg-primary text-[#0F1115] font-bold text-sm tracking-wide hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn size={16} />
            Đăng nhập
          </Link>
          <Link
            to="/"
            className="flex-1 h-12 rounded-xl border border-border bg-transparent hover:bg-white/5 transition-all text-sm font-semibold flex items-center justify-center gap-2 text-white cursor-pointer"
          >
            <Home size={16} />
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}

export default RegisterSuccess;
