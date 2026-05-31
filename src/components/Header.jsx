import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Header.css';

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo" id="logo-link">
          <span className="logo-icon">🍽️</span>
          <span className="logo-name">BookEat</span>
        </Link>

        {/* Nav desktop */}
        <nav className="header-nav" aria-label="Navigation chính">
          <Link to="/" className="hnav-link">Trang chủ</Link>
          <Link to="/restaurants" className="hnav-link">Nhà hàng</Link>
          <Link to="/about" className="hnav-link">Giới thiệu</Link>
        </nav>

        {/* Auth area */}
        <div className="header-auth">
          {!loading && !isAuthenticated && (
            <>
              <Link to="/auth/login" className="hbtn-login" id="header-btn-login">
                Đăng nhập
              </Link>
              <Link to="/auth/register" className="hbtn-register" id="header-btn-register">
                Đăng ký
              </Link>
            </>
          )}

          {!loading && isAuthenticated && (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="hbtn-register" style={{ padding: '8px 12px', fontSize: '13px' }}>
                  ⚙️ Trang Quản trị
                </Link>
              )}
              {user?.role === 'restaurant_owner' && (
                <Link to="/owner/dashboard" className="hbtn-register" style={{ padding: '8px 12px', fontSize: '13px' }}>
                  🍽️ Quản lý nhà hàng
                </Link>
              )}
              <div className="header-user">
                <div
                  className="user-avatar"
                  role="button"
                  tabIndex={0}
                  aria-label="Menu người dùng"
                  onClick={() => setMenuOpen((o) => !o)}
                  onKeyDown={(e) => e.key === 'Enter' && setMenuOpen((o) => !o)}
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="avatar-img" />
                  ) : (
                    <span className="avatar-initials">
                      {(user?.fullName || user?.username || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>

              {menuOpen && (
                <div className="user-dropdown" role="menu">
                  <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    👤 Tài khoản
                  </Link>
                  <Link to="/my-bookings" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    📅 Đặt bàn của tôi
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item dropdown-logout"
                    role="menuitem"
                    id="btn-logout"
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
