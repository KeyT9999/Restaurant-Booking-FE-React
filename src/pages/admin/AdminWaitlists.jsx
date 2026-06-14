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
import './AdminWaitlists.css';

const STATUSES = [
  { value: '', label: 'Tat ca' },
  { value: 'pending', label: 'Dang cho' },
  { value: 'confirmed', label: 'Da xac nhan' },
  { value: 'cancelled', label: 'Da huy' },
  { value: 'expired', label: 'Het han' },
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
      toast.error(error.message || 'Khong the tai danh sach cho');
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
    const note = window.prompt(status === 'cancelled' ? 'Ly do huy?' : 'Ly do danh dau het han?');
    if (note === null) return;
    try {
      const res = await updateAdminWaitlistStatus(waitlist.id, { status, note });
      if (res.success) {
        toast.success('Da cap nhat trang thai waitlist');
        fetchWaitlists(pagination.page);
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Khong the cap nhat trang thai');
    }
  };

  return (
    <AdminLayout title="Quan ly Danh sach cho" subtitle={`Tong cong ${pagination.total} yeu cau waitlist`}>
      {stats && (
        <section className="admin-waitlist-stats">
          <div><span>{stats.total}</span><small>Tong</small></div>
          <div className="pending"><span>{stats.pending}</span><small>Dang cho</small></div>
          <div className="confirmed"><span>{stats.confirmed}</span><small>Da xac nhan</small></div>
          <div className="cancelled"><span>{stats.cancelled}</span><small>Da huy</small></div>
          <div className="expired"><span>{stats.expired}</span><small>Het han</small></div>
        </section>
      )}

      <section className="admin-waitlist-toolbar">
        <div className="admin-waitlist-search">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Tim ten, SDT, email..."
            aria-label="Tim waitlist"
          />
        </div>
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          aria-label="Loc trang thai"
        >
          {STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <input
          type="date"
          value={filters.fromDate}
          onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
          aria-label="Tu ngay"
        />
        <input
          type="date"
          value={filters.toDate}
          onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
          aria-label="Den ngay"
        />
        <button type="button" onClick={() => { fetchWaitlists(1); fetchStats(); }}>
          <RefreshCw size={16} /> Lam moi
        </button>
      </section>

      <section className="admin-waitlist-table-wrap">
        {loading ? (
          <div className="admin-waitlist-empty">Dang tai danh sach cho...</div>
        ) : waitlists.length === 0 ? (
          <div className="admin-waitlist-empty">Khong tim thay waitlist phu hop.</div>
        ) : (
          <table className="admin-waitlist-table">
            <thead>
              <tr>
                <th>Khach hang</th>
                <th>Nha hang</th>
                <th>Thoi gian</th>
                <th>So khach</th>
                <th>Hang cho</th>
                <th>Trang thai</th>
                <th>Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {waitlists.map((item) => (
                <tr key={item.id}>
                  <td data-label="Khach hang">
                    <strong>{item.customerName}</strong>
                    <span>{item.customerPhone}</span>
                    <span>{item.customerEmail}</span>
                  </td>
                  <td data-label="Nha hang">
                    <strong>{item.restaurant?.name || item.restaurantId?.name || 'N/A'}</strong>
                  </td>
                  <td data-label="Thoi gian">
                    <strong>{item.preferredTime}</strong>
                    <span>{formatDate(item.preferredDate)}</span>
                  </td>
                  <td data-label="So khach">
                    <span className="admin-waitlist-guests"><Users size={15} /> {item.numberOfGuests}</span>
                  </td>
                  <td data-label="Hang cho">
                    <span>#{item.queuePositionSnapshot || '-'}</span>
                    <span>{item.estimatedWaitMinutes || 0} phut</span>
                  </td>
                  <td data-label="Trang thai"><WaitlistStatusBadge status={item.status} /></td>
                  <td data-label="Hanh dong">
                    <div className="admin-waitlist-actions">
                      {item.status === 'pending' ? (
                        <>
                          <button type="button" className="danger" onClick={() => updateStatus(item, 'cancelled')}>
                            <XCircle size={15} /> Huy
                          </button>
                          <button type="button" onClick={() => updateStatus(item, 'expired')}>
                            <Clock size={15} /> Het han
                          </button>
                        </>
                      ) : item.status === 'confirmed' ? (
                        <span className="admin-waitlist-readonly"><CheckCircle2 size={15} /> Da chuyen booking</span>
                      ) : (
                        <span className="admin-waitlist-readonly">Khong co thao tac</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {pagination.totalPages > 1 && (
        <footer className="admin-waitlist-pagination">
          <button disabled={pagination.page <= 1} onClick={() => fetchWaitlists(pagination.page - 1)}>Truoc</button>
          <span>Trang {pagination.page} / {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchWaitlists(pagination.page + 1)}>Sau</button>
        </footer>
      )}
    </AdminLayout>
  );
}
