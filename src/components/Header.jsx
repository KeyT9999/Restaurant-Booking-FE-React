import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Utensils, LogOut, ChevronDown, User, Calendar, Shield, Menu, X, Heart, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';
import NotificationIcon from './notifications/NotificationIcon';
export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const getMenuItems = () => {
    const items = [{ to: '/', label: 'Trang chủ' }];
    if (!isAuthenticated) {
      items.push({ to: '/restaurants', label: 'Nhà hàng' });
      items.push({ to: '/recommendations', label: 'Gần tôi' });
    } else if (user?.role === 'customer') {
      items.push(
        { to: '/restaurants', label: 'Khám phá' },
        { to: '/recommendations', label: 'Gần tôi' },
        { to: '/my-favorites', label: 'Yêu thích' },
        { to: '/my-bookings', label: 'Đặt bàn' },
        { to: '/my-waitlists', label: 'Waitlist' },
        { to: '/my-vouchers', label: 'Mã ưu đãi' },
        { to: '/chat', label: 'Tin nhắn' }
      );
    } else {
      items.push({ to: '/restaurants', label: 'Khám phá' });
      items.push({ to: '/recommendations', label: 'Gần tôi' });
    }
    return items;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[#0F1115]/90 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-primary rounded-lg p-1" id="logo-link" aria-label="BookEat Logo - Quay về trang chủ">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-amber-600">
            <Utensils className="h-4 w-4 text-background font-bold" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold tracking-tight text-white">
            BookEat
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Danh mục chính">
          {getMenuItems().map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50",
                  isActive
                    ? "text-white bg-[#20242D]"
                    : "text-muted-foreground hover:text-white hover:bg-[#20242D]/40"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth / Action Area */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            type="button"
            className="md:hidden p-1.5 text-muted-foreground hover:text-white hover:bg-[#20242D]/40 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {!loading && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/recommendations')}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 text-xs font-semibold gap-1.5 h-8"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Gần tôi</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth/login')}
                className="text-muted-foreground hover:text-white hover:bg-[#20242D]/40 text-xs font-semibold px-2.5 h-8"
                id="header-btn-login"
              >
                Đăng nhập
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/auth/register')}
                className="bg-primary hover:bg-primary/95 text-background text-xs font-semibold px-3 h-8"
                id="header-btn-register"
              >
                Đăng ký
              </Button>
            </div>
          )}

          {!loading && isAuthenticated && (
            <div className="flex items-center gap-3">
              {/* Notification icon */}
              <NotificationIcon buttonClassName="text-muted-foreground hover:text-white hover:bg-secondary/40 h-9 w-9" />

              {/* Quick links to workspaces */}
              {user?.role === 'admin' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden sm:inline-flex border-primary/30 hover:border-primary/50 hover:bg-primary/10 text-primary text-xs font-semibold gap-1.5"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Khu quản trị
                </Button>
              )}
              {user?.role === 'restaurant_owner' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/owner/dashboard')}
                  className="hidden sm:inline-flex border-primary/30 hover:border-primary/50 hover:bg-primary/10 text-primary text-xs font-semibold gap-1.5"
                >
                  <Utensils className="h-3.5 w-3.5" />
                  Quản lý nhà hàng
                </Button>
              )}

              {/* Quick Access: Nearby Restaurants Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/recommendations')}
                className="hidden md:inline-flex border-primary/30 hover:border-primary/50 hover:bg-primary/10 text-primary text-xs font-semibold gap-1.5"
              >
                <Navigation className="h-3.5 w-3.5" />
                Gần tôi
              </Button>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 focus:outline-none group"
                  aria-expanded={menuOpen}
                  aria-label="Menu người dùng"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-primary/15 transition group-hover:ring-primary/45">
                    {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                    <AvatarFallback className="bg-secondary text-white text-xs font-semibold">
                      {(user?.fullName || user?.username || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-white transition" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3.5 py-2.5">
                        <p className="text-xs text-muted-foreground font-medium">Tài khoản</p>
                        <p className="text-sm font-semibold truncate text-white mt-0.5">{user?.fullName || user?.username}</p>
                        <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="h-px bg-border my-1.5" />
                      <button
                        onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Hồ sơ cá nhân
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); navigate('/my-bookings'); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
                      >
                        <Calendar className="h-4 w-4" />
                        Đặt bàn của tôi
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); navigate('/my-favorites'); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-secondary transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        Nhà hàng yêu thích
                      </button>

                      {/* Workspaces links in dropdown for mobile */}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => { setMenuOpen(false); navigate('/admin/dashboard'); }}
                          className="flex sm:hidden w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          Khu quản trị
                        </button>
                      )}
                      {user?.role === 'restaurant_owner' && (
                        <button
                          onClick={() => { setMenuOpen(false); navigate('/owner/dashboard'); }}
                          className="flex sm:hidden w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Utensils className="h-4 w-4" />
                          Quản lý nhà hàng
                        </button>
                      )}

                      <div className="h-px bg-border my-1.5" />
                      <button
                        type="button"
                        id="btn-logout"
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-[#0F1115]/95 backdrop-blur-md px-6 py-4 flex flex-col gap-2 animate-in slide-in-from-top duration-200">
          {/* Quick Action: Nearby Restaurants */}
          <button
            onClick={() => { setMobileMenuOpen(false); navigate('/recommendations'); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors text-primary hover:bg-primary/10"
          >
            <Navigation className="h-4 w-4" />
            Gần tôi
          </button>
          <div className="h-px bg-border" />
          {getMenuItems().map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors",
                  isActive
                    ? "text-white bg-[#20242D]"
                    : "text-muted-foreground hover:text-white hover:bg-[#20242D]/40"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
