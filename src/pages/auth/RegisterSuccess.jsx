import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, LogIn, Mail } from 'lucide-react';
import '../../styles/auth.css';

function RegisterSuccess() {
  useEffect(() => {
    document.title = 'Đăng ký thành công - Book Eat';
  }, []);

  return (
    <main className="register-success-screen">
      <section className="register-success-card" aria-labelledby="register-success-title">
        <CheckCircle size={78} className="success-icon" />
        <h1 id="register-success-title">Đăng ký thành công!</h1>
        <p>
          Cảm ơn bạn đã đăng ký tài khoản tại <strong>Book Eat</strong>.
        </p>

        {/* Hướng dẫn xác minh email */}
        <div className="success-note">
          <strong>📧 Kiểm tra email của bạn</strong>
          <span>
            Chúng tôi đã gửi một email xác minh đến địa chỉ bạn đã đăng ký.
            Vui lòng bấm vào link trong email để kích hoạt tài khoản trước khi đăng nhập.
          </span>
          <span style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
            Không thấy email? Hãy kiểm tra thư mục <strong>Spam</strong>.
          </span>
        </div>

        <div className="success-actions">
          <Link to="/auth/login" className="success-primary-link">
            <LogIn size={18} />
            Đăng nhập
          </Link>
          <Link to="/" className="success-secondary-link">
            <Home size={18} />
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}

export default RegisterSuccess;
