import { useState, useEffect, useCallback } from 'react';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { getRestaurantBookings, getBookingStats, confirmBooking, ownerCancelBooking, completeBooking, markNoShow } from '../../api/bookingApi';
import OwnerLayout from '../../components/owner/OwnerLayout';
import StatusBadge from '../../components/booking/StatusBadge';
import BookingDetailModal from '../../components/owner/BookingDetailModal';
import CancelReasonModal from '../../components/owner/CancelReasonModal';
import ChangeTableModal from '../../components/owner/ChangeTableModal';
import { Search, RefreshCw, Clipboard, CheckCircle, XCircle, Users, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';

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
          className={`w-8 h-8 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all ${
            page === i
              ? 'bg-primary text-black border-primary'
              : 'border-border bg-card text-muted-foreground hover:text-white hover:bg-secondary/40'
          }`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return <div className="flex justify-center items-center gap-1.5 mt-6">{pages}</div>;
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Quản lý Đặt bàn" subtitle="Xem và duyệt đặt bàn từ khách hàng">
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <Clipboard size={48} className="text-muted-foreground/60 mb-4 animate-pulse" />
          <p className="text-sm text-muted-foreground">Vui lòng chọn hoặc thiết lập nhà hàng ở thanh bên để xem đơn đặt bàn.</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Quản lý Đặt bàn" subtitle="Theo dõi, duyệt đặt bàn và sắp xếp chỗ ngồi cho thực khách">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/30 transition-all text-left">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tổng đơn đặt bàn</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.totalBookings}</span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Clipboard size={16} /></span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all text-left">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chờ xác nhận</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-amber-500">{stats.pending}</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all text-left">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chờ phục vụ</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-sky-400">{stats.confirmed}</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all text-left">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đã hoàn thành</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-500">{stats.completed}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col xl:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto flex-1">
          {/* Lọc trạng thái */}
          <select 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full lg:w-[170px] cursor-pointer shrink-0"
            aria-label="Lọc trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã dùng bữa</option>
            <option value="cancelled">Đã hủy</option>
            <option value="no_show">Vắng mặt (No-show)</option>
          </select>

          {/* Lọc khoảng ngày */}
          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <input
              type="date"
              className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full sm:w-[140px]"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              placeholder="Từ ngày"
              aria-label="Từ ngày"
            />
            <span className="text-xs text-muted-foreground/60 shrink-0">đến</span>
            <input
              type="date"
              className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full sm:w-[140px]"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              placeholder="Đến ngày"
              aria-label="Đến ngày"
            />
          </div>

          {/* Tìm kiếm */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm khách hàng (tên, SĐT)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="bg-[#0F1115] border border-border text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full"
              aria-label="Tìm kiếm đặt bàn"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => { fetchBookings(); fetchStats(); }}
          className="border-border hover:bg-secondary/40 text-xs h-9 shrink-0 gap-1.5 w-full xl:w-auto"
        >
          <RefreshCw size={14} /> Làm mới
        </Button>
      </div>

      {/* Booking Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p>Đang tải danh sách đặt bàn...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
            <Clipboard size={48} className="text-primary/70 mb-4 animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-white mb-2">Chưa có đơn đặt bàn nào</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Đơn đặt bàn của khách hàng cho ngày và bộ lọc đã chọn sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-[#0F1115]/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Số khách</th>
                    <th className="p-4">Bàn gán</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {bookings.map((b) => {
                    const bDateStr = new Date(b.bookingDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });

                    return (
                      <tr 
                        key={b.id} 
                        className="hover:bg-secondary/10 transition-colors cursor-pointer" 
                        onClick={() => setSelectedBookingId(b.id)}
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col text-left">
                            <span 
                              className="font-bold text-white hover:text-primary transition-colors cursor-pointer" 
                              onClick={() => setSelectedBookingId(b.id)}
                            >
                              {b.customerName}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">{b.customerPhone}</span>
                            <span className="text-[11px] text-muted-foreground/80">{b.customerEmail}</span>
                          </div>
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white flex items-center gap-1">
                              <Clock size={12} className="text-muted-foreground/70" />
                              {b.bookingTime}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar size={12} className="text-muted-foreground/60" />
                              {bDateStr}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-left">
                          <div className="inline-flex items-center gap-1.5 text-white font-medium">
                            <Users size={14} className="text-muted-foreground" />
                            <span>{b.numberOfGuests}</span>
                          </div>
                        </td>
                        <td className="p-4 text-left">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-primary bg-primary/5 rounded border border-primary/20">
                            {b.tableNumbers?.length > 0 ? b.tableNumbers.join(', ') : 'Chưa gán bàn'}
                          </span>
                        </td>
                        <td className="p-4 text-left">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-1.5">
                            {b.status === 'pending' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleConfirm(b.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-2.5"
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setCancellingBooking({ id: b.id, name: b.customerName })}
                                  className="text-xs h-8 px-2.5"
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}

                            {b.status === 'confirmed' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleComplete(b.id)}
                                  className="bg-emerald-650 hover:bg-emerald-550 text-white text-xs h-8 px-2.5"
                                >
                                  Hoàn thành
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setChangingTableBooking({ id: b.id, tables: b.tableNumbers })}
                                  className="border-border hover:bg-secondary/40 text-xs h-8 px-2.5"
                                >
                                  Đổi bàn
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleNoShow(b.id)}
                                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-8 px-2.5"
                                >
                                  No-show
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setCancellingBooking({ id: b.id, name: b.customerName })}
                                  className="text-xs h-8 px-2.5"
                                >
                                  Hủy
                                </Button>
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
