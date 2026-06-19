import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, RefreshCw, Search, Users, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAdminWaitlistStats,
  getAdminWaitlists,
  updateAdminWaitlistStatus,
} from '../../api/waitlistApi';
import WaitlistStatusBadge from '../../components/waitlist/WaitlistStatusBadge';

const STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'expired', label: 'Hết hạn' },
];

const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '--';

export default function AdminWaitlists() {
  const [waitlists, setWaitlists] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '', fromDate: '', toDate: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchWaitlists = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAdminWaitlists({
        page,
        limit: 20,
        status: filters.status || undefined,
        search: filters.search || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
      if (res.success) {
        setWaitlists(res.data.waitlists || []);
        setPagination({
          page: res.data.page || page,
          totalPages: res.data.totalPages || 1,
          total: res.data.total || 0,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách chờ');
    } finally {
      setLoading(false);
    }
  }, [filters.fromDate, filters.search, filters.status, filters.toDate]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getAdminWaitlistStats();
      if (res.success) setStats(res.data);
    } catch (error) {
      console.error('Cannot fetch admin waitlist stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchWaitlists(1);
    fetchStats();
  }, [fetchStats, fetchWaitlists]);

  useEffect(() => {
    const handler = () => {
      fetchWaitlists(pagination.page);
      fetchStats();
    };
    window.addEventListener('bookeat:waitlist-event', handler);
    return () => window.removeEventListener('bookeat:waitlist-event', handler);
  }, [fetchStats, fetchWaitlists, pagination.page]);

  const updateStatus = async (waitlist, status) => {
    const note = window.prompt(status === 'cancelled' ? 'Lý do hủy?' : 'Lý do đánh dấu hết hạn?');
    if (note === null) return;
    try {
      const res = await updateAdminWaitlistStatus(waitlist.id, { status, note });
      if (res.success) {
        toast.success('Đã cập nhật trạng thái waitlist');
        fetchWaitlists(pagination.page);
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <AdminLayout title="Quản lý Danh sách chờ" subtitle={`Tổng cộng ${pagination.total} yêu cầu waitlist`}>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-zinc-150">{stats.total}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mt-1">Tổng yêu cầu</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-amber-500 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-amber-550">{stats.pending}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mt-1">Đang chờ</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-emerald-500 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-emerald-400">{stats.confirmed}</span>
            <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold mt-1">Đã xác nhận</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-rose-500 rounded-xl p-4 flex flex-col justify-between shadow-md">
            <span className="text-2xl font-bold text-rose-450">{stats.cancelled}</span>
            <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold mt-1">Đã hủy</span>
          </div>
          <div className="bg-[#1A1D24] border border-zinc-850 border-l-4 border-l-zinc-550 rounded-xl p-4 flex flex-col justify-between shadow-md col-span-2 md:col-span-1">
            <span className="text-2xl font-bold text-zinc-300">{stats.expired}</span>
            <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold mt-1">Hết hạn</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
            <Search size={16} />
          </span>
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Tìm tên, SĐT, email..."
            className="w-full bg-[#1A1D24] border border-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg text-sm pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="bg-[#1A1D24] border border-zinc-800 text-zinc-350 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          >
            {STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>

          <div className="flex items-center gap-2 bg-[#1A1D24] border border-zinc-800 rounded-lg px-2 py-1.5">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
              className="bg-transparent border-none text-zinc-350 text-xs outline-none cursor-pointer"
              title="Từ ngày"
            />
            <span className="text-zinc-500 text-xs">-</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
              className="bg-transparent border-none text-zinc-350 text-xs outline-none cursor-pointer"
              title="Đến ngày"
            />
          </div>

          <button 
            type="button" 
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition"
            onClick={() => { fetchWaitlists(1); fetchStats(); }}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Table wrapping */}
      <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Đang tải danh sách chờ...</span>
          </div>
        ) : waitlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4">
            <Users size={48} className="opacity-40 text-amber-500" />
            <p className="text-sm">Không tìm thấy waitlist phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-zinc-350 text-sm">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-450 font-medium">
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Nhà hàng</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Số khách</th>
                  <th className="p-4">Hạng chờ</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {waitlists.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-zinc-200">{item.customerName}</div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">{item.customerPhone}</div>
                        <div className="text-[10px] text-zinc-550 mt-0.5">{item.customerEmail}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-zinc-300">
                        {item.restaurant?.name || item.restaurantId?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">{item.preferredTime}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">{formatDate(item.preferredDate)}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-300 font-medium">
                        <Users size={13} className="text-zinc-500" /> {item.numberOfGuests}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-xs font-semibold text-zinc-300">#{item.queuePositionSnapshot || '-'}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.estimatedWaitMinutes || 0} phút</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <WaitlistStatusBadge status={item.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        {item.status === 'pending' ? (
                          <>
                            <button 
                              type="button" 
                              className="px-2.5 py-1.5 border border-zinc-800 hover:bg-zinc-850 hover:text-rose-500 text-zinc-400 font-medium rounded-lg transition" 
                              onClick={() => updateStatus(item, 'cancelled')}
                            >
                              <XCircle size={14} className="inline mr-1" /> Hủy
                            </button>
                            <button 
                              type="button" 
                              className="px-2.5 py-1.5 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-medium rounded-lg transition" 
                              onClick={() => updateStatus(item, 'expired')}
                            >
                              <Clock size={14} className="inline mr-1" /> Hết hạn
                            </button>
                          </>
                        ) : item.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 size={13} /> Đã chuyển booking
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-550 italic">Không có thao tác</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button 
            disabled={pagination.page <= 1} 
            onClick={() => fetchWaitlists(pagination.page - 1)}
            className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
          >
            Trước
          </button>
          <span className="text-xs text-zinc-400">Trang {pagination.page} / {pagination.totalPages}</span>
          <button 
            disabled={pagination.page >= pagination.totalPages} 
            onClick={() => fetchWaitlists(pagination.page + 1)}
            className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
          >
            Sau
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
