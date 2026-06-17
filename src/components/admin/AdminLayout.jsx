import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutGrid,
  Users,
  Building2,
  CalendarDays,
  ClipboardList,
  Ticket,
  DollarSign,
  RefreshCcw,
  MessageSquare,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  Menu,
  Shield,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutGrid, label: 'Tổng quan' },
  { to: '/admin/users', icon: Users, label: 'Người dùng' },
  { to: '/admin/restaurants', icon: Building2, label: 'Nhà hàng' },
  { to: '/admin/bookings', icon: CalendarDays, label: 'Đặt bàn' },
  { to: '/admin/waitlists', icon: ClipboardList, label: 'Waitlist' },
  { to: '/admin/vouchers', icon: Ticket, label: 'Mã ưu đãi' },
  { to: '/admin/revenue', icon: DollarSign, label: 'Doanh thu' },
  { to: '/admin/refunds', icon: RefreshCcw, label: 'Hoàn tiền' },
  { to: '/admin/reviews', icon: Star, label: 'Đánh giá' },
  { to: '/admin/chat', icon: MessageSquare, label: 'Tin nhắn' },
];

export default function AdminLayout({ children, title, subtitle, action }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Check role admin
  if (user && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mb-4">
          <Shield size={32} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mb-2">Không có quyền truy cập</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm mb-6">
          Bạn không có quyền truy cập vào khu vực quản trị của hệ thống BookEat.
        </p>
        <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90 text-background font-semibold">
          Về trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-white">
      {/* Sidebar Overlay for Mobile */}
      {!sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-sidebar transition-all duration-300 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Workspace Brand / Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-amber-600">
              <Shield className="h-5 w-5 text-background" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                BookEat
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Quản trị viên
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft size={18} />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                )
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-3 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-3 py-1.5">
            <Avatar className="h-9 w-9">
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
              <AvatarFallback className="bg-secondary text-white text-xs font-bold">
                {(user?.fullName || user?.username || 'A')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-semibold truncate text-white">
                {user?.fullName || user?.username}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                Admin
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-[#0F1115]/80 px-4 md:px-8 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title || 'Hệ thống'}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Search */}
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-full bg-secondary/40 border-border pl-9 text-xs focus-visible:ring-1 focus-visible:ring-primary h-8"
                placeholder="Tìm kiếm mọi thứ..."
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-white">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>

            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Mobile title */}
          <div className="mb-4 sm:hidden">
            <h1 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
