import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, CalendarDays, ClipboardList, CreditCard, LogOut, MessageCircle, Plus, Settings, Store, Utensils, Armchair, Ticket } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import RestaurantSwitcher from './RestaurantSwitcher';
import Header from '../Header';
import './OwnerLayout.css';

const NAV_ITEMS = [
  { to: '/owner/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/owner/chat', icon: MessageCircle, label: 'Tin nhắn' },
  { to: '/owner/restaurants', icon: Store, label: 'Nhà hàng' },
  { to: '/owner/menu', icon: Utensils, label: 'Menu' },
  { to: '/owner/tables', icon: Armchair, label: 'Sơ đồ bàn' },
  { to: '/owner/bookings', icon: CalendarDays, label: 'Booking' },
  { to: '/owner/waitlists', icon: ClipboardList, label: 'Waitlist' },
  { to: '/owner/vouchers', icon: Ticket, label: 'Mã giảm giá' },
  { to: '/owner/billing', icon: CreditCard, label: 'Gói dịch vụ' },
  { to: '/owner/settings', icon: Settings, label: 'Cài đặt' },
];

export default function OwnerLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <>
      <Header />
      <div className="owner-shell">
      <aside className="owner-sidebar">
        <div className="owner-brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <span className="brand-mark">BE</span>
          <span>BookEat Owner</span>
        </div>

        <RestaurantSwitcher />

        <nav className="owner-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `owner-nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink to="/owner/restaurants/create" className="owner-create-link">
          <Plus size={17} />
          <span>Tạo nhà hàng</span>
        </NavLink>

        <div className="owner-sidebar-footer">
          <div className="owner-user">
            <span className="owner-user-avatar">{(user?.fullName || user?.username || 'O')[0].toUpperCase()}</span>
            <span>
              <strong>{user?.fullName || user?.username}</strong>
              <small>Chủ nhà hàng</small>
            </span>
          </div>
          <button type="button" className="owner-logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="owner-main">
        <header className="owner-page-heading">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </header>
        {children}
      </main>
      </div>
    </>
  );
}
