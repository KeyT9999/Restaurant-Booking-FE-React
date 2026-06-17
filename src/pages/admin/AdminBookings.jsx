import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  Search, Eye, ChevronLeft, ChevronRight,
  CalendarDays, Filter,
} from 'lucide-react';

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
  const [stats, setStats] = useState(null);
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

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getBookingStats();
      setStats(res.data);
    } catch (err) {
      console.error('Cannot load booking stats:', err);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchBookings(1);
      fetchStats();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBookings, fetchStats]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Chờ xác nhận</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Đã xác nhận</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Hoàn thành</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-450 border border-rose-500/20">Đã hủy</span>;
      case 'no_show':
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-550/20">Không đến</span>;
    }
  };

  return (
    <AdminLayout title="Quản lý Đặt bàn" subtitle={`Tổng cộng ${pagination.total} lượt đặt bàn`}>
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm tên KH, SĐT, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1A1D24] border border-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg text-sm pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1A1D24] border border-zinc-800 rounded-lg px-2 py-1.5">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters(p => ({ ...p, fromDate: e.target.value }))}
              title="Từ ngày"
              className="bg-transparent border-none text-zinc-350 text-xs outline-none cursor-pointer"
            />
            <span className="text-zinc-500 text-xs">-</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters(p => ({ ...p, toDate: e.target.value }))}
              title="Đến ngày"
              className="bg-transparent border-none text-zinc-350 text-xs outline-none cursor-pointer"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="bg-[#1A1D24] border border-zinc-800 text-zinc-300 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {(filters.search || filters.status || filters.fromDate || filters.toDate) && (
            <button
              type="button"
              className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
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

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-zinc-100">{stats.totalBookings}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mt-1">Tổng booking</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-amber-500 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-amber-450">{stats.pending}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mt-1">Chờ xác nhận</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-blue-500 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-blue-400">{stats.confirmed}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mt-1">Đã xác nhận</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-emerald-500 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-emerald-400">{stats.completed}</span>
            <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold mt-1">Hoàn thành</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-rose-500 rounded-xl p-4 flex flex-col justify-between shadow-md col-span-2 md:col-span-1">
            <span className="text-2xl font-bold text-rose-400">{stats.cancelled}</span>
            <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold mt-1">Đã hủy</span>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <CalendarDays size={48} className="opacity-40 text-amber-500" />
          <p className="text-sm">Không tìm thấy lượt đặt bàn nào</p>
        </div>
      ) : (
        <>
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-zinc-350 text-sm">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-450 font-medium">
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Nhà hàng</th>
                    <th className="p-4">Thời gian đặt</th>
                    <th className="p-4">Số khách</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-zinc-205">{booking.customerName}</div>
                          <div className="text-xs text-zinc-450 font-mono mt-0.5">{booking.customerPhone}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-300">
                          {booking.restaurantId?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-zinc-200">
                            {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-zinc-500 font-mono">{booking.bookingTime}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-zinc-300 font-medium">{booking.numberOfGuests} người</span>
                      </td>
                      <td className="p-4">{getStatusBadge(booking.status)}</td>
                      <td className="p-4 text-right">
                        <button
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-lg transition"
                          title="Xem chi tiết"
                          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchBookings(pagination.page - 1)}
                className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-zinc-400">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBookings(pagination.page + 1)}
                className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
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
