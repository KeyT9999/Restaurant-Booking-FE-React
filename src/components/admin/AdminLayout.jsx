import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutDashboard, Users, ShieldCheck, LogOut, Menu, X,
  ChevronLeft, Store, CalendarDays, ClipboardList, MessageCircle, TrendingUp, RefreshCcw,
} from 'lucide-react';
import './AdminLayout.css';
import Header from '../Header';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',     icon: Users,           label: 'Quản lý Users' },
  { to: '/admin/restaurants', icon: Store,         label: 'Nhà hàng' },
  { to: '/admin/bookings',    icon: CalendarDays,  label: 'Đặt bàn' },
  { to: '/admin/waitlists',   icon: ClipboardList, label: 'Waitlist' },
  { to: '/admin/revenue',     icon: TrendingUp,    label: 'Doanh thu' },
  { to: '/admin/refunds',     icon: RefreshCcw,    label: 'Hoàn tiền' },
  { to: '/admin/chat',        icon: MessageCircle, label: 'Tin nhắn' },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Kiểm tra role admin
  if (user && user.role !== 'admin') {
    return (
      <div className="admin-forbidden">
        <ShieldCheck size={48} />
        <h2>Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập khu vực quản trị.</p>
        <button onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">🍽️</span>
            {sidebarOpen && <span className="brand-text">BookEat Admin</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={item.label}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && user && (
            <div className="sidebar-user">
              <div className="user-avatar">
                {user.fullName?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.fullName || user.username}</span>
                <span className="user-role">Admin</span>
              </div>
            </div>
          )}
          <button className="sidebar-link logout-btn" onClick={handleLogout} title="Đăng xuất">
            <LogOut size={20} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="mobile-title">{title || 'Admin'}</span>
        </div>

        {/* Page header */}
        {title && (
          <div className="admin-page-header">
            <div>
              <h1 className="page-title">{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="admin-content">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      </div>
    </>
  );
}
