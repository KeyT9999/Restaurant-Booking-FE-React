import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Header from '../../components/Header';
import './HomePage.css';

const FEATURES = [
  {
    icon: '🍽️',
    title: 'Đặt bàn tức thì',
    desc: 'Chọn nhà hàng, chọn giờ, xác nhận trong vài giây. Không cần gọi điện chờ đợi.',
  },
  {
    icon: '📍',
    title: 'Tìm kiếm thông minh',
    desc: 'Khám phá hàng nghìn nhà hàng xung quanh bạn với đánh giá thực tế từ cộng đồng.',
  },
  {
    icon: '⚡',
    title: 'Xác nhận ngay lập tức',
    desc: 'Nhận xác nhận đặt bàn tức thì. Không lo chờ đợi hay bỏ lỡ cơ hội.',
  },
  {
    icon: '🎁',
    title: 'Ưu đãi độc quyền',
    desc: 'Hàng loạt ưu đãi và combo đặc biệt chỉ dành riêng cho thành viên BookEat.',
  },
];

const CATEGORIES = [
  { emoji: '🍜', name: 'Món Việt' },
  { emoji: '🍣', name: 'Nhật Bản' },
  { emoji: '🍕', name: 'Ý & Pizza' },
  { emoji: '🥩', name: 'BBQ & Lẩu' },
  { emoji: '🍱', name: 'Hàn Quốc' },
  { emoji: '🍛', name: 'Ấn Độ' },
  { emoji: '🥗', name: 'Thuần Chay' },
  { emoji: '☕', name: 'Cafe & Bánh' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-root">
      <Header />

      {/* ══ Hero ══ */}
      <section className="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-content">
          {/* Left */}
          <div className="hero-left">
            <span className="hero-eyebrow">Nền tảng đặt bàn hàng đầu</span>

            <h1 className="hero-title">
              Trải nghiệm<br />
              ẩm thực <em>đỉnh cao</em>
            </h1>

            <p className="hero-desc">
              Khám phá và đặt bàn tại hàng nghìn nhà hàng hàng đầu Việt Nam. Nhanh chóng, tiện lợi và hoàn toàn miễn phí.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/restaurants" className="btn-primary" id="btn-explore">
                  Khám phá ngay
                </Link>
              ) : (
                <>
                  <Link to="/auth/register" className="btn-primary" id="btn-start">
                    Bắt đầu ngay
                  </Link>
                  <Link to="/auth/login" className="btn-outline" id="btn-hero-login">
                    Đăng nhập
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>2,000+</strong>
                <span>Nhà hàng</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <strong>50K+</strong>
                <span>Khách hàng</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <strong>4.9 ★</strong>
                <span>Đánh giá</span>
              </div>
            </div>
          </div>

          {/* Right — floating cards */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card-stack">
              <div className="hcard hcard-1">
                <span className="hcard-emoji">🍜</span>
                <div>
                  <strong>Phở Thìn Bờ Hồ</strong>
                  <small>Hà Nội · ★ 4.9</small>
                </div>
              </div>
              <div className="hcard hcard-2">
                <span className="hcard-emoji">🍣</span>
                <div>
                  <strong>Sushi Hokkaido</strong>
                  <small>TP.HCM · ★ 4.8</small>
                </div>
              </div>
              <div className="hcard hcard-3">
                <span className="hcard-emoji">🥩</span>
                <div>
                  <strong>King BBQ Premium</strong>
                  <small>Đà Nẵng · ★ 4.7</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Categories ══ */}
      <section className="section categories-section" aria-label="Thể loại ẩm thực">
        <div className="container">
          <span className="section-eyebrow">Thực đơn theo phong cách</span>
          <h2 className="section-title">Khám phá thể loại</h2>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <button key={cat.name} className="category-card" type="button">
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Features ══ */}
      <section className="section features-section" aria-label="Tính năng">
        <div className="container">
          <span className="section-eyebrow">Tại sao chọn chúng tôi</span>
          <h2 className="section-title">Dịch vụ vượt trội</h2>
          <p className="section-sub">Chúng tôi mang lại trải nghiệm đặt bàn hoàn hảo và đẳng cấp nhất</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon-big">{f.icon}</span>
                <h3 className="feature-card-title">{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      {!isAuthenticated && (
        <section className="cta-section" aria-label="Đăng ký">
          <div className="container cta-inner">
            <span className="section-eyebrow">Tham gia cùng chúng tôi</span>
            <h2>Sẵn sàng<br /><em style={{ fontStyle: 'italic' }}>trải nghiệm?</em></h2>
            <p>Tạo tài khoản miễn phí và đặt bàn ngay hôm nay</p>
            <div className="cta-actions">
              <Link to="/auth/register" className="btn-primary" id="btn-cta-register">
                Đăng ký miễn phí
              </Link>
              <Link to="/auth/login" className="btn-ghost" id="btn-cta-login">
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ Footer ══ */}
      <footer className="home-footer">
        <div className="container">
          <span className="footer-brand">BookEat</span>
          <span className="footer-copy">© 2026 BookEat. Mọi quyền được bảo lưu.</span>
        </div>
      </footer>
    </div>
  );
}
