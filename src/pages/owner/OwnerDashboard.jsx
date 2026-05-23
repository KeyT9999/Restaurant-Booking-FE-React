import { useEffect, useState } from 'react';
import { CalendarDays, MessageCircle, Star, Wallet } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getOwnerRestaurantDashboard } from '../../api/restaurantApi';
import './OwnerDashboard.css';

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
      title="Dashboard"
      subtitle="Quản lý theo nhà hàng đang hoạt động, tương tự cách chuyển trang Fanpage."
    >
      {contextLoading && <div className="owner-panel">Đang tải danh sách nhà hàng...</div>}

      {!contextLoading && restaurants.length === 0 && (
        <div className="owner-panel empty-context">
          <h2>Bạn chưa có nhà hàng nào</h2>
          <p>Tạo nhà hàng đầu tiên để bắt đầu quản lý bảng điều khiển, đặt bàn và chat.</p>
        </div>
      )}

      {!contextLoading && restaurants.length > 1 && !selectedRestaurantId && (
        <div className="owner-panel empty-context">
          <h2>Chọn nhà hàng để làm việc</h2>
          <p>Toàn bộ thông tin bảng điều khiển, đặt bàn, thực đơn, chat và đánh giá sẽ hoạt động theo nhà hàng bạn chọn.</p>
        </div>
      )}

      {selectedRestaurantId && (
        <>
          <section className="active-restaurant-strip">
            <div>
              <span>Nhà hàng đang hoạt động</span>
              <strong>{selectedRestaurant?.name || dashboard?.restaurant?.name}</strong>
            </div>
            <small>ID: {selectedRestaurantId}</small>
          </section>

          {loading && <div className="owner-panel">Đang tải dữ liệu nhà hàng...</div>}
          {error && <div className="owner-panel error">{error}</div>}

          {!loading && !error && stats && (
            <div className="owner-stat-grid">
              <article className="owner-stat-card">
                <CalendarDays size={22} />
                <span>Tổng đặt bàn</span>
                <strong>{stats.totalBookings}</strong>
              </article>
              <article className="owner-stat-card">
                <MessageCircle size={22} />
                <span>Chờ xác nhận</span>
                <strong>{stats.pendingBookings}</strong>
              </article>
              <article className="owner-stat-card">
                <Star size={22} />
                <span>Đánh giá</span>
                <strong>{Number(stats.averageRating || 0).toFixed(1)}</strong>
              </article>
              <article className="owner-stat-card">
                <Wallet size={22} />
                <span>Số dư ví</span>
                <strong>{formatMoney(stats.balance)}</strong>
              </article>
            </div>
          )}
        </>
      )}
    </OwnerLayout>
  );
}
