import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, RefreshCw, Search, Users, XCircle } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import {
  confirmWaitlist,
  expireWaitlist,
  getAvailableTablesForWaitlist,
  getOwnerWaitlistStats,
  getOwnerWaitlists,
  ownerCancelWaitlist,
  updateWaitlistPriority,
} from '../../api/waitlistApi';
import WaitlistStatusBadge from '../../components/waitlist/WaitlistStatusBadge';
import './OwnerWaitlistPage.css';

const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '--';

const STATUSES = [
  { value: '', label: 'Tat ca' },
  { value: 'pending', label: 'Dang cho' },
  { value: 'confirmed', label: 'Da xac nhan' },
  { value: 'cancelled', label: 'Da huy' },
  { value: 'expired', label: 'Het han' },
];

export default function OwnerWaitlistPage() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();
  const [waitlists, setWaitlists] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', search: '', preferredDate: '' });
  const [confirming, setConfirming] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [ownerNote, setOwnerNote] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await getOwnerWaitlistStats({ restaurantId: selectedRestaurantId });
      if (res.success) setStats(res.data);
    } catch (error) {
      console.error('Cannot fetch waitlist stats:', error);
    }
  }, [selectedRestaurantId]);

  const fetchWaitlists = useCallback(async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await getOwnerWaitlists({
        restaurantId: selectedRestaurantId,
        status: filters.status || undefined,
        search: filters.search || undefined,
        preferredDate: filters.preferredDate || undefined,
        page: 1,
        limit: 50,
      });
      if (res.success) setWaitlists(res.data.waitlists || []);
      else toast.error(res.message || 'Khong the tai danh sach cho');
    } catch (error) {
      toast.error(error.message || 'Khong the tai danh sach cho');
    } finally {
      setLoading(false);
    }
  }, [filters.preferredDate, filters.search, filters.status, selectedRestaurantId]);

  useEffect(() => {
    if (isRestaurantReady) {
      fetchWaitlists();
      fetchStats();
    } else {
      setWaitlists([]);
      setStats(null);
    }
  }, [fetchStats, fetchWaitlists, isRestaurantReady]);

  useEffect(() => {
    const handler = (event) => {
      const eventRestaurantId = event.detail?.payload?.restaurantId?.toString?.() || event.detail?.payload?.restaurantId;
      if (eventRestaurantId && eventRestaurantId !== selectedRestaurantId) return;
      fetchWaitlists();
      fetchStats();
    };
    window.addEventListener('bookeat:waitlist-event', handler);
    return () => window.removeEventListener('bookeat:waitlist-event', handler);
  }, [fetchStats, fetchWaitlists, selectedRestaurantId]);

  const openConfirmModal = async (waitlist) => {
    setConfirming(waitlist);
    setAvailableTables([]);
    setSelectedTableIds([]);
    setOwnerNote('');
    setModalLoading(true);
    try {
      const res = await getAvailableTablesForWaitlist(waitlist.id);
      if (res.success) setAvailableTables(res.data.tables || []);
    } catch (error) {
      toast.error(error.message || 'Khong the tai ban trong');
    } finally {
      setModalLoading(false);
    }
  };

  const toggleTable = (tableId) => {
    setSelectedTableIds((current) => (
      current.includes(tableId)
        ? current.filter((id) => id !== tableId)
        : [...current, tableId]
    ));
  };

  const handleConfirm = async () => {
    if (!confirming || selectedTableIds.length === 0) {
      toast.error('Vui long chon it nhat mot ban');
      return;
    }
    setModalLoading(true);
    try {
      const res = await confirmWaitlist(confirming.id, selectedTableIds, ownerNote);
      if (res.success) {
        toast.success('Da xac nhan waitlist va tao booking');
        setConfirming(null);
        fetchWaitlists();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Khong the xac nhan waitlist');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancel = async (waitlist) => {
    const reason = window.prompt('Ly do huy danh sach cho?', 'Nha hang chua the sap xep ban phu hop');
    if (reason === null) return;
    try {
      const res = await ownerCancelWaitlist(waitlist.id, reason);
      if (res.success) {
        toast.success('Da huy waitlist');
        fetchWaitlists();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Khong the huy waitlist');
    }
  };

  const handleExpire = async (waitlist) => {
    const reason = window.prompt('Ly do danh dau het han?', 'Qua thoi gian cho toi da');
    if (reason === null) return;
    try {
      const res = await expireWaitlist(waitlist.id, reason);
      if (res.success) {
        toast.success('Da danh dau het han');
        fetchWaitlists();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Khong the cap nhat waitlist');
    }
  };

  const handlePriority = async (waitlist) => {
    const value = window.prompt('Nhap diem uu tien moi (0-100)', waitlist.priorityNumber || 0);
    if (value === null) return;
    try {
      const res = await updateWaitlistPriority(waitlist.id, Number(value), 'Owner cap nhat uu tien');
      if (res.success) {
        toast.success('Da cap nhat uu tien');
        fetchWaitlists();
      }
    } catch (error) {
      toast.error(error.message || 'Khong the cap nhat uu tien');
    }
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Danh sach cho" subtitle="Duyet khach cho ban va chuyen thanh booking">
        <div className="owner-waitlist-empty">Vui long chon nha hang de quan ly danh sach cho.</div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Danh sach cho" subtitle="Duyet waitlist, gan ban trong va thong bao realtime cho khach">
      {stats && (
        <section className="owner-waitlist-stats">
          <div><span>{stats.total}</span><small>Tong</small></div>
          <div className="pending"><span>{stats.pending}</span><small>Dang cho</small></div>
          <div className="confirmed"><span>{stats.confirmed}</span><small>Da xac nhan</small></div>
          <div className="expired"><span>{stats.expiringSoon}</span><small>Sap het han</small></div>
        </section>
      )}

      <section className="owner-waitlist-toolbar">
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          aria-label="Loc trang thai"
        >
          {STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <input
          type="date"
          value={filters.preferredDate}
          onChange={(event) => setFilters((current) => ({ ...current, preferredDate: event.target.value }))}
          aria-label="Loc ngay mong muon"
        />
        <div className="owner-waitlist-search">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Tim ten, SDT, email..."
            aria-label="Tim waitlist"
          />
        </div>
        <button type="button" onClick={() => { fetchWaitlists(); fetchStats(); }} aria-label="Lam moi">
          <RefreshCw size={16} /> Lam moi
        </button>
      </section>

      <section className="owner-waitlist-table-wrap">
        {loading ? (
          <div className="owner-waitlist-empty">Dang tai danh sach cho...</div>
        ) : waitlists.length === 0 ? (
          <div className="owner-waitlist-empty">Chua co yeu cau danh sach cho phu hop.</div>
        ) : (
          <table className="owner-waitlist-table">
            <thead>
              <tr>
                <th>Khach hang</th>
                <th>Thoi gian</th>
                <th>So khach</th>
                <th>Chon truoc</th>
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
                  <td data-label="Thoi gian">
                    <strong>{item.preferredTime}</strong>
                    <span>{formatDate(item.preferredDate)}</span>
                  </td>
                  <td data-label="So khach">
                    <span className="owner-waitlist-guests"><Users size={15} /> {item.numberOfGuests}</span>
                  </td>
                  <td data-label="Chon truoc">
                    <span>{item.dishes?.length || 0} mon</span>
                    <span>{item.services?.length || 0} dich vu</span>
                  </td>
                  <td data-label="Hang cho">
                    <span>#{item.queuePositionSnapshot || '-'}</span>
                    <span>{item.estimatedWaitMinutes || 0} phut</span>
                  </td>
                  <td data-label="Trang thai"><WaitlistStatusBadge status={item.status} /></td>
                  <td data-label="Hanh dong">
                    <div className="owner-waitlist-actions">
                      {item.status === 'pending' && (
                        <>
                          <button type="button" className="confirm" onClick={() => openConfirmModal(item)}>
                            <CheckCircle size={15} /> Duyet
                          </button>
                          <button type="button" onClick={() => handlePriority(item)}>
                            <Clock size={15} /> Uu tien
                          </button>
                          <button type="button" className="danger" onClick={() => handleCancel(item)}>
                            <XCircle size={15} /> Huy
                          </button>
                          <button type="button" onClick={() => handleExpire(item)}>
                            Het han
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {confirming && (
        <div className="owner-waitlist-modal-backdrop" role="presentation" onClick={() => setConfirming(null)}>
          <div className="owner-waitlist-modal" role="dialog" aria-modal="true" aria-label="Xac nhan waitlist" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <p>Duyet danh sach cho</p>
                <h2>{confirming.customerName} · {confirming.numberOfGuests} khach</h2>
              </div>
              <button type="button" onClick={() => setConfirming(null)} aria-label="Dong modal">×</button>
            </header>
            <section>
              {modalLoading ? (
                <div className="owner-waitlist-empty">Dang tai ban trong...</div>
              ) : availableTables.length === 0 ? (
                <div className="owner-waitlist-empty">Chua co ban trong phu hop voi khung gio nay.</div>
              ) : (
                <div className="owner-waitlist-modal-tables">
                  {availableTables.map((table) => (
                    <button
                      type="button"
                      key={table.id}
                      className={selectedTableIds.includes(table.id) ? 'selected' : ''}
                      onClick={() => toggleTable(table.id)}
                      aria-pressed={selectedTableIds.includes(table.id)}
                    >
                      <strong>Ban {table.tableNumber}</strong>
                      <span>{table.capacity} cho · {table.zone || 'Khu chung'}</span>
                    </button>
                  ))}
                </div>
              )}
              <label className="owner-waitlist-note">
                Ghi chu cho khach / lich su xu ly
                <textarea rows="3" value={ownerNote} onChange={(event) => setOwnerNote(event.target.value)} />
              </label>
            </section>
            <footer>
              <button type="button" onClick={() => setConfirming(null)} disabled={modalLoading}>Huy</button>
              <button type="button" className="primary" onClick={handleConfirm} disabled={modalLoading || selectedTableIds.length === 0}>
                Xac nhan va tao booking
              </button>
            </footer>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
