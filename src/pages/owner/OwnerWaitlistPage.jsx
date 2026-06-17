import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, RefreshCw, Search, Users, XCircle, Calendar, Hash, FileText } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import { Button } from '../../components/ui/button';
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

const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '--';

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Đang chờ bàn' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'expired', label: 'Hết hạn' },
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
      else toast.error(res.message || 'Không thể tải danh sách chờ');
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách chờ');
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
      toast.error(error.message || 'Không thể tải bàn trống');
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
      toast.error('Vui lòng chọn ít nhất một bàn');
      return;
    }
    setModalLoading(true);
    try {
      const res = await confirmWaitlist(confirming.id, selectedTableIds, ownerNote);
      if (res.success) {
        toast.success('Đã xác nhận waitlist và tạo đặt bàn thành công!');
        setConfirming(null);
        fetchWaitlists();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Không thể xác nhận waitlist');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancel = async (waitlist) => {
    const reason = window.prompt('Lý do hủy danh sách chờ?', 'Nhà hàng chưa thể sắp xếp bàn phù hợp');
    if (reason === null) return;
    try {
      const res = await ownerCancelWaitlist(waitlist.id, reason);
      if (res.success) {
        toast.success('Đã hủy yêu cầu danh sách chờ');
        fetchWaitlists();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Không thể hủy waitlist');
    }
  };

  const handleExpire = async (waitlist) => {
    const reason = window.prompt('Lý do đánh dấu hết hạn?', 'Quá thời gian chờ tối đa');
    if (reason === null) return;
    try {
      const res = await expireWaitlist(waitlist.id, reason);
      if (res.success) {
        toast.success('Đã đánh dấu hết hạn');
        fetchWaitlists();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật waitlist');
    }
  };

  const handlePriority = async (waitlist) => {
    const value = window.prompt('Nhập điểm ưu tiên mới (0-100)', waitlist.priorityNumber || 0);
    if (value === null) return;
    try {
      const res = await updateWaitlistPriority(waitlist.id, Number(value), 'Chủ nhà hàng cập nhật ưu tiên');
      if (res.success) {
        toast.success('Đã cập nhật điểm ưu tiên');
        fetchWaitlists();
      }
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật ưu tiên');
    }
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Danh sách chờ" subtitle="Duyệt khách chờ bàn và chuyển thành booking">
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <p className="text-sm text-muted-foreground">Vui lòng chọn nhà hàng ở thanh bên để quản lý danh sách chờ.</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Danh sách chờ" subtitle="Duyệt waitlist, gán bàn trống và thông báo realtime cho khách">
      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tổng yêu cầu</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-white">{stats.total}</span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Users size={16} /></span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đang chờ bàn</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-amber-500">{stats.pending}</span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><Clock size={16} /></span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đã xác nhận</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-500">{stats.confirmed}</span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle size={16} /></span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sắp hết hạn</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-rose-500">{stats.expiringSoon}</span>
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500"><XCircle size={16} /></span>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar Section */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full min-w-[150px]"
            aria-label="Lọc trạng thái"
          >
            {STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input
            type="date"
            value={filters.preferredDate}
            onChange={(event) => setFilters((current) => ({ ...current, preferredDate: event.target.value }))}
            className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full min-w-[150px]"
            aria-label="Lọc ngày mong muốn"
          />
          <div className="relative w-full min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Tìm tên, SĐT, email..."
              className="bg-[#0F1115] border border-border text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full"
              aria-label="Tìm waitlist"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { fetchWaitlists(); fetchStats(); }}
          className="w-full md:w-auto shrink-0 border-border hover:bg-secondary/40 text-xs gap-1.5 h-9"
        >
          <RefreshCw size={14} /> Làm mới
        </Button>
      </div>

      {/* Main Waitlist Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Đang tải danh sách chờ...</div>
        ) : waitlists.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Chưa có yêu cầu danh sách chờ phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-[#0F1115]/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Số khách</th>
                  <th className="p-4">Chọn trước</th>
                  <th className="p-4">Hàng chờ</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {waitlists.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{item.customerName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.customerPhone}</div>
                      <div className="text-[11px] text-muted-foreground/85">{item.customerEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{item.preferredTime}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar size={12} className="shrink-0" />
                        {formatDate(item.preferredDate)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1 text-white font-medium">
                        <Users size={14} className="text-muted-foreground" />
                        {item.numberOfGuests}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span>🍳 {item.dishes?.length || 0} món ăn</span>
                        <span>🏷️ {item.services?.length || 0} dịch vụ</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-white flex items-center gap-0.5">
                          <Hash size={12} className="text-primary" />{item.queuePositionSnapshot || '-'}
                        </span>
                        <span>⌛ ~{item.estimatedWaitMinutes || 0} phút</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <WaitlistStatusBadge status={item.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        {item.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openConfirmModal(item)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 text-xs h-8 px-2.5"
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePriority(item)}
                              className="border-border hover:bg-secondary/40 text-xs h-8 px-2.5"
                            >
                              Ưu tiên
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancel(item)}
                              className="text-xs h-8 px-2.5"
                            >
                              Hủy
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExpire(item)}
                              className="text-xs text-muted-foreground hover:text-white h-8 px-2.5"
                            >
                              Hết hạn
                            </Button>
                          </>
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

      {/* Confirmation Modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setConfirming(null)}>
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Duyệt danh sách chờ"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Duyệt danh sách chờ</p>
                <h2 className="text-lg font-bold text-white mt-1">
                  {confirming.customerName} · {confirming.numberOfGuests} khách
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="text-muted-foreground hover:text-white transition rounded-lg p-1 hover:bg-secondary/40"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Bàn trống khả dụng (Chọn ít nhất 1 bàn)
                </h3>
                {modalLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Đang tìm bàn trống phù hợp...</div>
                ) : availableTables.length === 0 ? (
                  <div className="p-8 text-center text-sm text-amber-500/80 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    Chưa có bàn trống phù hợp với khung giờ này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTables.map((table) => {
                      const isSelected = selectedTableIds.includes(table.id);
                      return (
                        <button
                          type="button"
                          key={table.id}
                          onClick={() => toggleTable(table.id)}
                          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-white ring-1 ring-primary'
                              : 'border-border bg-[#0F1115] text-muted-foreground hover:border-border/80 hover:text-white'
                          }`}
                          aria-pressed={isSelected}
                        >
                          <span className="font-semibold text-sm text-white">Bàn {table.tableNumber}</span>
                          <span className="text-xs mt-1">{table.capacity} chỗ · {table.zone || 'Khu chung'}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Ghi chú cho khách / lịch sử xử lý
                </label>
                <textarea
                  rows="3"
                  value={ownerNote}
                  onChange={(event) => setOwnerNote(event.target.value)}
                  placeholder="Nhập ghi chú cho khách hàng hoặc ghi chú nội bộ khi tạo đặt bàn..."
                  className="w-full bg-[#0F1115] border border-border text-white text-sm rounded-xl p-3 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border p-5 bg-[#0F1115]/20">
              <Button
                variant="outline"
                onClick={() => setConfirming(null)}
                disabled={modalLoading}
                className="border-border hover:bg-secondary/40 text-xs h-9"
              >
                Hủy
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={modalLoading || selectedTableIds.length === 0}
                className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-9"
              >
                Xác nhận & Tạo đặt bàn
              </Button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
