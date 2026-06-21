import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MessageCircle, Star, Wallet, Store, Loader2, AlertCircle } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getOwnerRestaurantDashboard } from '../../api/restaurantApi';

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(value || 0);

export default function OwnerDashboard() {
  const { selectedRestaurantId, selectedRestaurant, restaurants, loading: contextLoading } = useRestaurantContext();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedRestaurantId) {
      const timeoutId = window.setTimeout(() => {
        setDashboard(null);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    let ignore = false;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        setDashboard(null);
        const response = await getOwnerRestaurantDashboard(selectedRestaurantId);
        if (!ignore) setDashboard(response.data);
      } catch (err) {
        if (!ignore) setError(err.message || 'Không thể tải bảng điều khiển nhà hàng');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [selectedRestaurantId]);

  const stats = dashboard?.stats;

  return (
    <OwnerLayout
      title="Bảng điều khiển"
      subtitle="Tổng quan hoạt động kinh doanh của nhà hàng."
    >
      {contextLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Đang tải danh sách nhà hàng...</p>
        </div>
      )}

      {!contextLoading && restaurants.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 border border-primary/20 text-primary">
            <Store size={28} />
          </div>
          <h2 className="font-serif text-lg font-bold text-white mb-2">Bạn chưa có nhà hàng nào</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mb-6">
            Bắt đầu tạo hồ sơ và menu nhà hàng đầu tiên của bạn để kích hoạt hệ thống quản lý đặt bàn và chat.
          </p>
          <Link
            to="/owner/restaurants/create"
            className="h-11 px-5 rounded-xl bg-primary text-[#0F1115] font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all flex items-center justify-center"
          >
            Tạo nhà hàng đầu tiên
          </Link>
        </div>
      )}

      {!contextLoading && restaurants.length > 0 && !selectedRestaurantId && (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 border border-primary/20 text-primary">
            <Store size={28} />
          </div>
          <h2 className="font-serif text-lg font-bold text-white mb-2">Chọn nhà hàng để làm việc</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            Toàn bộ thông tin đặt bàn, thực đơn, sơ đồ bàn, chat và đánh giá sẽ hoạt động theo nhà hàng bạn chọn trong Restaurant Switcher ở thanh bên.
          </p>
        </div>
      )}

      {selectedRestaurantId && (
        <div className="flex flex-col gap-6">
          {/* Active restaurant bar */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Nhà hàng đang hoạt động</span>
              <strong className="font-serif text-lg font-bold text-white tracking-tight mt-0.5">{selectedRestaurant?.name || dashboard?.restaurant?.name}</strong>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">ID: {selectedRestaurantId}</span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs">Đang tải dữ liệu nhà hàng...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs leading-relaxed max-w-lg mx-auto">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <article className="p-5 bg-card border border-border rounded-xl flex flex-col gap-3 min-h-[130px] hover:border-primary/40 hover:bg-primary/[0.01] transition-all shadow-md group">
                <CalendarDays size={20} className="text-primary group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng đặt bàn</span>
                <strong className="text-2xl font-serif font-bold text-white mt-auto">{stats.totalBookings}</strong>
              </article>

              <article className="p-5 bg-card border border-border rounded-xl flex flex-col gap-3 min-h-[130px] hover:border-primary/40 hover:bg-primary/[0.01] transition-all shadow-md group">
                <MessageCircle size={20} className="text-primary group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chờ xác nhận</span>
                <strong className="text-2xl font-serif font-bold text-white mt-auto">{stats.pendingBookings}</strong>
              </article>

              <article className="p-5 bg-card border border-border rounded-xl flex flex-col gap-3 min-h-[130px] hover:border-primary/40 hover:bg-primary/[0.01] transition-all shadow-md group">
                <Star size={20} className="text-primary group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Đánh giá trung bình</span>
                <strong className="text-2xl font-serif font-bold text-white mt-auto">{Number(stats.averageRating || 0).toFixed(1)}</strong>
              </article>

              <article className="p-5 bg-card border border-border rounded-xl flex flex-col gap-3 min-h-[130px] hover:border-primary/40 hover:bg-primary/[0.01] transition-all shadow-md group">
                <Wallet size={20} className="text-primary group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Số dư ví đặt cọc</span>
                <strong className="text-2xl font-serif font-bold text-white mt-auto">{formatMoney(stats.balance)}</strong>
              </article>
            </div>
          )}
        </div>
      )}
    </OwnerLayout>
  );
}
