import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import { getMyRestaurants } from '../../api/restaurantApi';
import './OwnerRestaurants.css';

const STATUS_CONFIG = {
  pending:   { label: 'Chờ duyệt',   className: 'badge-pending',   icon: '⏳' },
  approved:  { label: 'Đã duyệt',    className: 'badge-approved',  icon: '✅' },
  rejected:  { label: 'Bị từ chối',   className: 'badge-rejected',  icon: '❌' },
  suspended: { label: 'Tạm ngưng',    className: 'badge-suspended', icon: '⚠️' },
};

export default function OwnerRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchRestaurants = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyRestaurants({ page, limit: 20 });
      setRestaurants(response.data.restaurants);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhà hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="owner-restaurants-page">
      <Header />
      <main className="owner-restaurants-main">
        <div className="owner-restaurants-container">
          {/* Header */}
          <div className="owner-page-header">
            <div>
              <h1 className="owner-page-title">Nhà hàng của tôi</h1>
              <p className="owner-page-subtitle">
                Quản lý tất cả nhà hàng bạn sở hữu trên BookEat
              </p>
            </div>
            <Link to="/owner/restaurants/create" className="btn-create-new" id="btn-create-restaurant">
              + Tạo nhà hàng mới
            </Link>
          </div>

          {/* Stats summary */}
          {!loading && restaurants.length > 0 && (
            <div className="owner-stats-bar">
              <div className="owner-stat">
                <span className="stat-number">{pagination.total}</span>
                <span className="stat-label">Tổng nhà hàng</span>
              </div>
              <div className="owner-stat">
                <span className="stat-number">{restaurants.filter(r => r.approvalStatus === 'approved').length}</span>
                <span className="stat-label">Đã duyệt</span>
              </div>
              <div className="owner-stat">
                <span className="stat-number">{restaurants.filter(r => r.approvalStatus === 'pending').length}</span>
                <span className="stat-label">Chờ duyệt</span>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="owner-loading">
              <div className="owner-spinner" />
              <span>Đang tải danh sách...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="owner-error">
              <span>❌ {error}</span>
              <button onClick={() => fetchRestaurants()} className="btn-retry">Thử lại</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && restaurants.length === 0 && (
            <div className="owner-empty">
              <div className="empty-icon">🍽️</div>
              <h2 className="empty-title">Chưa có nhà hàng nào</h2>
              <p className="empty-desc">Bắt đầu bằng cách tạo nhà hàng đầu tiên của bạn.</p>
              <Link to="/owner/restaurants/create" className="btn-create-first">
                + Tạo nhà hàng đầu tiên
              </Link>
            </div>
          )}

          {/* Restaurant list */}
          {!loading && !error && restaurants.length > 0 && (
            <div className="restaurant-grid">
              {restaurants.map((r) => {
                const status = STATUS_CONFIG[r.approvalStatus] || STATUS_CONFIG.pending;
                return (
                  <div key={r.id} className="restaurant-card" id={`restaurant-${r.id}`}>
                    {/* Image */}
                    <div className="rcard-image">
                      {r.primaryImage || r.logo ? (
                        <img src={r.primaryImage || r.logo} alt={r.name} />
                      ) : (
                        <div className="rcard-placeholder">🍽️</div>
                      )}
                      <span className={`rcard-badge ${status.className}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="rcard-body">
                      <h3 className="rcard-name">{r.name}</h3>
                      <p className="rcard-address">
                        📍 {r.address?.fullAddress || [r.address?.street, r.address?.district, r.address?.city].filter(Boolean).join(', ') || '—'}
                      </p>
                      <div className="rcard-meta">
                        <span>📞 {r.phoneNumber || '—'}</span>
                        <span>📧 {r.email || '—'}</span>
                      </div>
                      <div className="rcard-stats">
                        <span>📅 {r.stats?.totalBookings || 0} đặt bàn</span>
                        <span>⭐ {r.stats?.averageRating?.toFixed(1) || '—'}</span>
                      </div>
                      <div className="rcard-date">
                        Tạo ngày {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="owner-pagination">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === pagination.page ? 'active' : ''}`}
                  onClick={() => fetchRestaurants(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
