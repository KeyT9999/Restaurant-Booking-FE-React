import { useState, useEffect, useCallback } from 'react';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getRestaurantBookings, getBookingStats, confirmBooking, ownerCancelBooking, completeBooking, markNoShow } from '../../api/bookingApi';
import OwnerLayout from '../../components/owner/OwnerLayout';
import StatusBadge from '../../components/booking/StatusBadge';
import BookingDetailModal from '../../components/owner/BookingDetailModal';
import CancelReasonModal from '../../components/owner/CancelReasonModal';
import ChangeTableModal from '../../components/owner/ChangeTableModal';
import { Search, RefreshCw, Clipboard, CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import './OwnerBookingsPage.css';

export default function OwnerBookingsPage() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  
  // Cancel action state
  const [cancellingBooking, setCancellingBooking] = useState(null);

  // Change table state
  const [changingTableBooking, setChangingTableBooking] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await getBookingStats({ restaurantId: selectedRestaurantId, period: 'all' });
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [selectedRestaurantId]);

  const fetchBookings = useCallback(async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await getRestaurantBookings({
        restaurantId: selectedRestaurantId,
        status: filterStatus || undefined,
        search: searchQuery || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit: 10,
      });

      if (res.success) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.totalPages || 1);
      } else {
        toast.error(res.message || 'Lỗi khi tải danh sách đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId, filterStatus, searchQuery, fromDate, toDate, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (isRestaurantReady) {
        fetchBookings();
        fetchStats();
      } else {
        setBookings([]);
        setStats(null);
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isRestaurantReady, fetchBookings, fetchStats]);

  useEffect(() => {
    const handleBookingEvent = (event) => {
      const eventRestaurantId = event.detail?.payload?.restaurantId?.toString?.() || event.detail?.payload?.restaurantId;
      if (eventRestaurantId && eventRestaurantId !== selectedRestaurantId) return;
      fetchBookings();
      fetchStats();
    };

    window.addEventListener('bookeat:booking-event', handleBookingEvent);
    return () => window.removeEventListener('bookeat:booking-event', handleBookingEvent);
  }, [fetchBookings, fetchStats, selectedRestaurantId]);

  // Handlers
  const handleConfirm = async (id) => {
    try {
      const res = await confirmBooking(id);
      if (res.success) {
        toast.success('Xác nhận đặt bàn thành công');
        fetchBookings();
        fetchStats();
      } else {
        toast.error(res.message || 'Không thể xác nhận đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi xác nhận đặt bàn');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await completeBooking(id);
      if (res.success) {
        toast.success('Hoàn thành đặt bàn thành công');
        fetchBookings();
        fetchStats();
      } else {
        toast.error(res.message || 'Không thể hoàn tất đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi hoàn tất đặt bàn');
    }
  };

  const handleNoShow = async (id) => {
    try {
      const res = await markNoShow(id);
      if (res.success) {
        toast.success('Đã đánh dấu khách vắng mặt (no-show)');
        fetchBookings();
        fetchStats();
      } else {
        toast.error(res.message || 'Không thể đánh dấu đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi đánh dấu vắng mặt');
    }
  };

  const handleCancelSubmit = async (reason) => {
    if (!cancellingBooking) return;
    try {
      const res = await ownerCancelBooking(cancellingBooking.id, reason);
      if (res.success) {
        toast.success('Hủy đặt bàn thành công');
        setCancellingBooking(null);
        fetchBookings();
        fetchStats();
      } else {
        toast.error(res.message || 'Không thể hủy đặt bàn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi hủy đặt bàn');
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`owner-pagination-btn ${page === i ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return <div className="owner-bookings-pagination">{pages}</div>;
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Quản lý Đặt bàn" subtitle="Xem và duyệt đặt bàn từ khách hàng">
        <div className="owner-bookings-empty-state">
          <Clipboard size={48} />
          <p>Vui lòng chọn hoặc thiết lập nhà hàng để xem đơn đặt bàn</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Quản lý Đặt bàn" subtitle="Theo dõi, duyệt và sắp xếp đặt bàn ăn">
      {/* Stats Cards */}
      {stats && (
        <div className="owner-bookings-stats-grid">
          <div className="stats-card">
            <span className="stats-val">{stats.totalBookings}</span>
            <span className="stats-label">Tổng đơn đặt bàn</span>
          </div>
          <div className="stats-card stats-card--yellow">
            <span className="stats-val">{stats.pending}</span>
            <span className="stats-label">Chờ xác nhận</span>
          </div>
          <div className="stats-card stats-card--blue">
            <span className="stats-val">{stats.confirmed}</span>
            <span className="stats-label">Đang chờ phục vụ</span>
          </div>
          <div className="stats-card stats-card--green">
            <span className="stats-val">{stats.completed}</span>
            <span className="stats-label">Dùng bữa hoàn tất</span>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="owner-bookings-toolbar">
        <div className="toolbar-left-filters">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã dùng bữa</option>
            <option value="cancelled">Đã hủy</option>
            <option value="no_show">Vắng mặt (No-show)</option>
          </select>

          <div className="date-filters-group">
            <input
              type="date"
              className="toolbar-date-input"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              placeholder="Từ ngày"
            />
            <span className="date-sep">to</span>
            <input
              type="date"
              className="toolbar-date-input"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              placeholder="Đến ngày"
            />
          </div>

          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm khách hàng (tên, SĐT)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <button className="btn-refresh" onClick={() => { fetchBookings(); fetchStats(); }} title="Làm mới">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Booking Table */}
      <div className="owner-bookings-table-container">
        {loading ? (
          <div className="owner-bookings-loading">
            <div className="spinner"></div>
            <p>Đang tải danh sách đặt bàn...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="owner-bookings-empty-state">
            <Clipboard size={48} />
            <h3>Chưa có đơn đặt bàn nào</h3>
            <p>Đơn đặt bàn của khách hàng cho ngày và bộ lọc đã chọn sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="owner-bookings-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Thời gian</th>
                    <th>Số khách</th>
                    <th>Bàn Assigned</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const bDateStr = new Date(b.bookingDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });

                    return (
                      <tr key={b.id} className="booking-table-row" onClick={() => setSelectedBookingId(b.id)}>
                        <td className="customer-cell" data-label="Khach hang" onClick={(e) => e.stopPropagation()}>
                          <div className="cust-info">
                            <span className="cust-name" onClick={() => setSelectedBookingId(b.id)} style={{ cursor: 'pointer' }}>{b.customerName}</span>
                            <span className="cust-phone">{b.customerPhone}</span>
                            <span className="cust-email">{b.customerEmail}</span>
                          </div>
                        </td>
                        <td data-label="Thoi gian">
                          <div className="time-info">
                            <span className="time-val font-bold">{b.bookingTime}</span>
                            <span className="date-val">{bDateStr}</span>
                          </div>
                        </td>
                        <td data-label="So khach">
                          <div className="flex items-center gap-1">
                            <Users size={14} className="text-gray-400" />
                            <strong>{b.numberOfGuests}</strong> khách
                          </div>
                        </td>
                        <td data-label="Ban">
                          <span className="table-numbers-badge">
                            {b.tableNumbers?.length > 0 ? b.tableNumbers.join(', ') : 'Chưa gán bàn'}
                          </span>
                        </td>
                        <td data-label="Trang thai">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="actions-cell" data-label="Hanh dong" onClick={(e) => e.stopPropagation()}>
                          <div className="row-actions-wrapper">
                            {b.status === 'pending' && (
                              <>
                                <button
                                  className="action-icon-btn btn-confirm"
                                  onClick={() => handleConfirm(b.id)}
                                  title="Xác nhận đặt bàn"
                                >
                                  <CheckCircle size={16} /> Duyệt
                                </button>
                                <button
                                  className="action-icon-btn btn-cancel"
                                  onClick={() => setCancellingBooking({ id: b.id, name: b.customerName })}
                                  title="Từ chối/Hủy"
                                >
                                  <XCircle size={16} /> Từ chối
                                </button>
                              </>
                            )}

                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  className="action-icon-btn btn-confirm"
                                  onClick={() => handleComplete(b.id)}
                                  title="Hoàn tất dùng bữa"
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  className="action-icon-btn btn-change-table"
                                  onClick={() => setChangingTableBooking({ id: b.id, tables: b.tableNumbers })}
                                  title="Đổi bàn"
                                >
                                  Đổi bàn
                                </button>
                                <button
                                  className="action-icon-btn btn-no-show"
                                  onClick={() => handleNoShow(b.id)}
                                  title="Đánh dấu khách không đến"
                                >
                                  No-show
                                </button>
                                <button
                                  className="action-icon-btn btn-cancel"
                                  onClick={() => setCancellingBooking({ id: b.id, name: b.customerName })}
                                  title="Hủy đặt bàn"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBookingId && (
        <BookingDetailModal
          isOpen={selectedBookingId !== null}
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onActionComplete={() => {
            fetchBookings();
            fetchStats();
          }}
          onCancelClick={(id, name) => {
            setSelectedBookingId(null);
            setCancellingBooking({ id, name });
          }}
          onChangeTableClick={(id, tables) => {
            setSelectedBookingId(null);
            setChangingTableBooking({ id, tables });
          }}
        />
      )}

      {/* Owner Cancel Reason Input Modal */}
      {cancellingBooking && (
        <CancelReasonModal
          isOpen={cancellingBooking !== null}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleCancelSubmit}
          bookingInfo={cancellingBooking}
        />
      )}

      {/* Owner Change Table Selection Modal */}
      {changingTableBooking && (
        <ChangeTableModal
          isOpen={changingTableBooking !== null}
          onClose={() => setChangingTableBooking(null)}
          bookingId={changingTableBooking.id}
          currentTables={changingTableBooking.tables}
          onConfirm={() => {
            setChangingTableBooking(null);
            fetchBookings();
          }}
        />
      )}
    </OwnerLayout>
  );
}
