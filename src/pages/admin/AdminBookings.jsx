import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  Search, Eye, RefreshCw, ChevronLeft, ChevronRight,
  CalendarDays, Filter,
} from 'lucide-react';
import './AdminBookings.css';

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'no_show', label: 'Khách không đến' },
];

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    fromDate: '',
    toDate: '',
  });

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings({ page, limit: 20, ...filters });
      setBookings(res.data.bookings);
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
      });
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const getStatusBadge = (status) => {
    const map = {
      pending:   { label: 'Chờ xác nhận', cls: 'pending' },
      confirmed: { label: 'Đã xác nhận', cls: 'confirmed' },
      completed: { label: 'Hoàn thành',   cls: 'completed' },
      cancelled: { label: 'Đã hủy',       cls: 'cancelled' },
      no_show:   { label: 'Không đến',    cls: 'no-show' },
    };
    const s = map[status] || { label: status, cls: '' };
    return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <AdminLayout title="Quản lý Đặt bàn" subtitle={`Tổng cộng ${pagination.total} lượt đặt bàn`}>
      {/* Toolbar */}
      <div className="bookings-toolbar">
        <form onSubmit={handleSearch} className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm tên KH, SĐT, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <div className="date-filter">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters(p => ({ ...p, fromDate: e.target.value }))}
              title="Từ ngày"
            />
            <span>-</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters(p => ({ ...p, toDate: e.target.value }))}
              title="Đến ngày"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {(filters.search || filters.status || filters.fromDate || filters.toDate) && (
            <button
              type="button"
              className="btn-clear"
              onClick={() => {
                setFilters({ search: '', status: '', fromDate: '', toDate: '' });
                setSearchInput('');
              }}
              title="Xóa bộ lọc"
            >
              <Filter size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="admin-empty">
          <CalendarDays size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Không tìm thấy lượt đặt bàn nào</p>
        </div>
      ) : (
        <>
          <div className="bookings-table-wrap">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Nhà hàng</th>
                  <th>Thời gian đặt</th>
                  <th>Số khách</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-name">{booking.customerName}</div>
                        <div className="customer-phone">{booking.customerPhone}</div>
                      </div>
                    </td>
                    <td>
                      <div className="restaurant-cell">
                        {booking.restaurantId?.name || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        <div className="booking-date">
                          {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="booking-hour">{booking.bookingTime}</div>
                      </div>
                    </td>
                    <td>
                      <div className="guest-cell">
                        {booking.numberOfGuests} người
                      </div>
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      <button
                        className="action-btn view"
                        title="Xem chi tiết"
                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchBookings(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-info">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBookings(pagination.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
