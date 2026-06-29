import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Calendar,
  CalendarOff,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import * as blockedSlotApi from '../../api/blockedSlotApi';
import * as tableApi from '../../api/tableApi';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../components/ui/utils';

export default function OwnerBlockedSlotsPage() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();

  const [blockedSlots, setBlockedSlots] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [date, setDate] = useState('');
  const [slotType, setSlotType] = useState('full_day'); // full_day, time_range
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');
  const [selectedTables, setSelectedTables] = useState([]);
  const [reason, setReason] = useState('');

  const fetchBlockedSlots = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await blockedSlotApi.getBlockedSlots(selectedRestaurantId);
      setBlockedSlots(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải danh sách khung giờ chặn.');
    }
  }, [selectedRestaurantId]);

  const fetchTables = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      const res = await tableApi.getTables(selectedRestaurantId);
      setTables(res.data?.tables || res.tables || []);
    } catch (err) {
      console.error(err);
    }
  }, [selectedRestaurantId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchBlockedSlots(), fetchTables()]);
    setLoading(false);
  }, [fetchBlockedSlots, fetchTables]);

  useEffect(() => {
    if (isRestaurantReady) {
      fetchData();
    } else {
      setBlockedSlots([]);
      setTables([]);
      setLoading(false);
    }
  }, [isRestaurantReady, fetchData]);

  const handleToggleTable = (tableNumber) => {
    setSelectedTables((prev) =>
      prev.includes(tableNumber)
        ? prev.filter((num) => num !== tableNumber)
        : [...prev, tableNumber]
    );
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId) return;
    if (!date) {
      toast.error('Vui lòng chọn ngày chặn.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date,
        slotType,
        startTime: slotType === 'time_range' ? startTime : null,
        endTime: slotType === 'time_range' ? endTime : null,
        tableNumbers: selectedTables,
        reason: reason.trim() || null,
      };

      const res = await blockedSlotApi.createBlockedSlot(selectedRestaurantId, payload);
      if (res.success) {
        toast.success('Chặn khung giờ đặt thành công.');
        // Reset form
        setDate('');
        setSlotType('full_day');
        setSelectedTables([]);
        setReason('');
        fetchBlockedSlots();
      } else {
        toast.error(res.message || 'Lỗi khi chặn khung giờ.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy chặn khung giờ này không?')) return;
    try {
      const res = await blockedSlotApi.deleteBlockedSlot(selectedRestaurantId, id);
      if (res.success) {
        toast.success('Hủy chặn thành công.');
        fetchBlockedSlots();
      } else {
        toast.error(res.message || 'Lỗi khi hủy chặn.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra.');
    }
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Chặn Khung Giờ Đặt" subtitle="Quản lý lịch tạm ngưng nhận bàn">
        <Card className="mx-auto max-w-2xl border-dashed border-border bg-card/70 p-8 text-center">
          <CalendarOff className="mx-auto h-12 w-12 text-primary" />
          <h2 className="font-serif text-3xl font-bold text-white">Chọn nhà hàng</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Vui lòng chọn một nhà hàng trong danh sách trước khi quản lý chặn khung giờ đặt bàn.
          </p>
        </Card>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Chặn Khung Giờ Đặt" subtitle="Tạm ngưng nhận khách theo ngày, giờ hoặc theo bàn cụ thể">
      <div className="grid gap-7 xl:grid-cols-[380px_minmax(0,1fr)] text-left">
        {/* Form chặn khung giờ */}
        <Card className="border-border bg-card p-6">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Plus size={18} className="text-primary" /> Chặn lịch mới
          </h2>

          <form onSubmit={handleCreateBlock} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="block-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày chặn</label>
              <Input
                id="block-date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-secondary/40 border-border text-white text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Hình thức chặn</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSlotType('full_day')}
                  className={cn(
                    'h-10 rounded-lg border text-xs font-bold transition-all',
                    slotType === 'full_day'
                      ? 'bg-primary text-background border-primary'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:text-white'
                  )}
                >
                  Cả ngày
                </button>
                <button
                  type="button"
                  onClick={() => setSlotType('time_range')}
                  className={cn(
                    'h-10 rounded-lg border text-xs font-bold transition-all',
                    slotType === 'time_range'
                      ? 'bg-primary text-background border-primary'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:text-white'
                  )}
                >
                  Khung giờ
                </button>
              </div>
            </div>

            {slotType === 'time_range' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/20 rounded-xl border border-border/40">
                <div className="space-y-1">
                  <label htmlFor="start-time" className="text-[10px] font-semibold text-muted-foreground uppercase">Từ giờ</label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-9 bg-secondary/60 border-border text-white text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="end-time" className="text-[10px] font-semibold text-muted-foreground uppercase">Đến giờ</label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-9 bg-secondary/60 border-border text-white text-xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Table Selection (Optional) */}
            <div className="space-y-1.5 border-t border-border/50 pt-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Áp dụng cho bàn (Tùy chọn)</label>
                <span className="text-[10px] text-muted-foreground">Bỏ trống = Chặn cả nhà hàng</span>
              </div>

              {tables.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Nhà hàng chưa cấu hình sơ đồ bàn.</p>
              ) : (
                <div className="max-h-36 overflow-y-auto grid grid-cols-2 gap-1.5 p-2 bg-secondary/15 rounded-lg border border-border/30">
                  {tables.map((table) => {
                    const isSelected = selectedTables.includes(table.tableNumber);
                    return (
                      <button
                        type="button"
                        key={table._id || table.tableNumber}
                        onClick={() => handleToggleTable(table.tableNumber)}
                        className={cn(
                          'flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-left border border-transparent transition-all',
                          isSelected
                            ? 'bg-primary/10 text-primary border-primary/20 font-semibold'
                            : 'text-muted-foreground hover:bg-secondary/40 hover:text-white'
                        )}
                      >
                        {isSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                        <span>Bàn {table.tableNumber}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1.5 border-t border-border/50 pt-4">
              <label htmlFor="block-reason" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lý do chặn</label>
              <textarea
                id="block-reason"
                rows="2"
                placeholder="Ví dụ: Đặt tiệc đám cưới, bảo trì điện..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-secondary/40 border border-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-primary text-background font-bold hover:bg-primary/95 text-xs uppercase tracking-wider"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Đang thiết lập...
                </>
              ) : (
                'Chặn đặt bàn'
              )}
            </Button>
          </form>
        </Card>

        {/* Danh sách khung giờ chặn */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Khung giờ đang bị chặn</h2>
              <p className="mt-1 text-sm text-muted-foreground">Danh sách lịch chặn và trạng thái áp dụng đặt bàn.</p>
            </div>
            <Badge className="bg-primary/15 text-primary border-primary/25 rounded-md px-3 py-1 font-bold text-xs">
              {blockedSlots.length} Lịch chặn
            </Badge>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-300">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Đang tải danh sách...</span>
            </div>
          ) : blockedSlots.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/20 px-6 text-center">
              <Calendar className="h-10 w-10 text-primary" />
              <h3 className="mt-4 font-serif text-xl font-bold text-white">Chưa có lịch chặn nào</h3>
              <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
                Nhà hàng của bạn hiện đang mở nhận khách cho toàn bộ các ngày và bàn trống theo lịch hoạt động.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {blockedSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="p-5 border border-border/80 bg-secondary/20 rounded-xl relative hover:border-border transition flex flex-col justify-between gap-4 text-left"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-primary font-bold">{formatDate(slot.date)}</span>
                        <h4 className="font-bold text-white text-base">
                          {slot.slotType === 'full_day' ? (
                            <span className="flex items-center gap-1.5 text-rose-400">
                              <CalendarOff size={15} /> Chặn cả ngày
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-amber-400">
                              <Clock size={15} /> Chặn: {slot.startTime} - {slot.endTime}
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                      <span className="flex items-start gap-1 w-full">
                        <span className="font-semibold text-white shrink-0">Lý do:</span>
                        <span className="italic">{slot.reason || 'Không có lý do chi tiết'}</span>
                      </span>
                      <span className="flex flex-col gap-1 w-full mt-1.5">
                        <span className="font-semibold text-white">Phạm vi áp dụng:</span>
                        {slot.tableNumbers && slot.tableNumbers.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {slot.tableNumbers.map((num, i) => (
                              <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                Bàn {num}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] w-fit">
                            Toàn bộ nhà hàng
                          </Badge>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2 pt-2 border-t border-border/30">
                    <button
                      onClick={() => handleDeleteBlock(slot._id)}
                      className="p-2 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} /> Hủy chặn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </OwnerLayout>
  );
}
