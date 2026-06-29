import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Armchair,
  Building2,
  CalendarDays,
  CalendarOff,
  ClipboardList,
  Globe2,
  LayoutGrid,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Star,
  Ticket,
  Utensils,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import NotificationIcon from '../notifications/NotificationIcon';
import RestaurantSwitcher from './RestaurantSwitcher';
 
const NAV_ITEMS = [
  { to: '/owner/dashboard', icon: LayoutGrid, label: 'Bảng điều khiển', end: true },
  { to: '/owner/bookings', icon: CalendarDays, label: 'Quản lý đặt bàn' },
  { to: '/owner/restaurants', icon: Building2, label: 'Hồ sơ nhà hàng' },
  { to: '/owner/menu', icon: Utensils, label: 'Thực đơn' },
  { to: '/owner/tables', icon: Armchair, label: 'Sơ đồ bàn' },
  { to: '/owner/waitlists', icon: ClipboardList, label: 'Danh sách chờ' },
  { to: '/owner/blocked-slots', icon: CalendarOff, label: 'Chặn khung giờ đặt' },
  { to: '/owner/vouchers', icon: Ticket, label: 'Ưu đãi & Voucher' },
  { to: '/owner/reviews', icon: Star, label: 'Đánh giá' },
  { to: '/owner/billing', icon: Wallet, label: 'Tài chính & Ví' },
  { to: '/owner/chat', icon: MessageSquare, label: 'Tin nhắn chat' },
  { to: '/owner/restaurants', icon: Settings, label: 'Cài đặt', muted: true },
];

function getInitials(user) {
  const source = user?.fullName || user?.username || user?.email || 'AR';
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function OwnerLayout({ title, subtitle, children, action }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-white">
      <header className="h-[74px] shrink-0 border-b border-border bg-[#0F1115]">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:bg-secondary hover:text-white md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open owner navigation"
            >
              <Menu size={20} />
            </Button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 rounded-lg text-left"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-background">
                <Utensils size={19} />
              </span>
              <span className="font-serif text-lg font-bold leading-none text-white">BookEat</span>
            </button>

            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Globe2 size={15} />
              <span className="font-semibold text-primary">VI</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close owner navigation overlay"
            className="fixed inset-x-0 bottom-0 top-[74px] z-30 bg-black/65 md:hidden"
            onClick={closeSidebar}
          />
        )}

        <aside
          className={cn(
            'fixed bottom-0 top-[74px] z-40 flex w-[280px] flex-col border-r border-border bg-sidebar transition-transform duration-200 md:static md:z-auto md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-[88px] items-center justify-between border-b border-border px-5">
            <RestaurantSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-white md:hidden"
              onClick={closeSidebar}
              aria-label="Close owner navigation"
            >
              <X size={18} />
            </Button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    'flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors',
                    isActive && !item.muted
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-white'
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-[122px] shrink-0 flex-col gap-5 border-b border-border bg-background px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-9">
            <div>
              <h1 className="font-serif text-4xl font-bold leading-tight text-white md:text-[40px]">
                {title || 'Không gian quản lý nhà hàng'}
              </h1>
              {subtitle && <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden w-[316px] lg:block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-10 rounded-lg border-border bg-secondary/70 pl-11 text-base text-white placeholder:text-muted-foreground focus-visible:ring-primary/40"
                  placeholder="Tìm đặt bàn, khách hàng..."
                />
              </div>

              <NotificationIcon buttonClassName="h-10 w-10 rounded-full text-white hover:bg-secondary" />

              <Avatar className="h-10 w-10">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName || user.username} />}
                <AvatarFallback className="bg-secondary text-sm font-bold text-white">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>

              {action && <div className="hidden items-center gap-2 xl:flex">{action}</div>}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-5 py-9 lg:px-9">
            {action && <div className="mb-5 flex justify-end xl:hidden">{action}</div>}
            {children}
          </main>
        </section>
      </div>
    </div>
  );
}
