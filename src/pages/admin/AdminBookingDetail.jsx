import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CalendarDays, Clock, Users, User, Store,
  MapPin, Phone, Mail, Save,
} from 'lucide-react';

const STATUSES = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'no_show', label: 'Khách không đến' },
];

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status edit state
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookingById(id);
      setBooking(res.data);
      setStatus(res.data.status);
      setInternalNotes(res.data.internalNotes || '');
    } catch (err) {
      toast.error(err.message || 'Không thể tải chi tiết đặt bàn');
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);


  const handleUpdateStatus = async () => {
    if (status === booking.status && internalNotes === (booking.internalNotes || '')) {
      toast('Không có thay đổi nào', { icon: 'ℹ️' });
      return;
    }

    setSaving(true);
    try {
      const res = await adminApi.updateBookingStatus(id, { status, note, internalNotes });
      toast.success(res.message);
      setBooking(res.data);
      setNote(''); // reset note input after success
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết Đặt bàn">
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải thông tin...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) return null;

  const getStatusBadge = (s) => {
    switch (s) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Chờ xác nhận</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-450 border border-blue-500/20">Đã xác nhận</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">Hoàn thành</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-450 border border-rose-500/20">Đã hủy</span>;
      case 'no_show':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-550/20">Không đến</span>;
    }
  };

  return (
    <AdminLayout title="Chi tiết Đặt bàn" subtitle={`Mã: ${booking.id.substring(0, 8).toUpperCase()}`}>
      <div className="mb-6">
        <button 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition duration-150" 
          onClick={() => navigate('/admin/bookings')}
        >
          <ArrowLeft size={14} /> Quay lại danh sách
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info */}
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Thông tin Đặt bàn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><CalendarDays size={12} /> Ngày đặt</span>
                <span className="text-sm font-semibold text-zinc-200">
                  {new Date(booking.bookingDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock size={12} /> Giờ đặt</span>
                <span className="text-sm font-semibold text-amber-500 font-mono">{booking.bookingTime}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><Users size={12} /> Số lượng khách</span>
                <span className="text-sm text-zinc-200 font-medium">{booking.numberOfGuests} người</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">Dịp đặc biệt (Occasion)</span>
                <span className="text-sm text-zinc-200 font-medium capitalize">{booking.occasion || 'Không có'}</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs text-zinc-500">Yêu cầu đặc biệt</span>
                <span className="text-xs text-zinc-400 bg-zinc-900/40 border border-zinc-805 p-2.5 rounded-lg leading-relaxed">
                  {booking.specialRequests || 'Không có yêu cầu đặc biệt'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Thông tin Khách hàng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><User size={12} /> Tên khách hàng</span>
                <span className="text-sm font-bold text-zinc-200">{booking.customerName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><Phone size={12} /> Điện thoại</span>
                <span className="text-sm font-mono text-zinc-200">{booking.customerPhone}</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><Mail size={12} /> Email</span>
                <span className="text-sm text-zinc-300">{booking.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Nhà hàng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><Store size={12} /> Tên nhà hàng</span>
                <span className="text-sm font-bold text-amber-500">{booking.restaurantId?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><MapPin size={12} /> Địa chỉ</span>
                <span className="text-sm text-zinc-300 leading-relaxed">
                  {booking.restaurantId?.address?.fullAddress || 
                   `${booking.restaurantId?.address?.street || ''}, ${booking.restaurantId?.address?.district || ''}, ${booking.restaurantId?.address?.city || ''}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Trạng thái & Cập nhật</h3>
            
            <div className="flex flex-col gap-1 mb-5">
              <span className="text-xs text-zinc-500">Trạng thái hiện tại:</span>
              <span className="mt-1">
                {getStatusBadge(booking.status)}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Cập nhật trạng thái:</label>
              <select
                className="bg-[#13161C] border border-zinc-800 text-zinc-300 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {status !== booking.status && (
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Ghi chú đổi trạng thái (Gửi cho khách/nhà hàng):</label>
                <input
                  type="text"
                  className="bg-[#13161C] border border-zinc-800 text-zinc-200 placeholder-zinc-600 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Vd: Quá giờ, Khách yêu cầu hủy..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Ghi chú nội bộ (Chỉ Admin xem):</label>
              <textarea
                className="bg-[#13161C] border border-zinc-800 text-zinc-200 placeholder-zinc-600 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                rows={3}
                placeholder="Ghi chú nội bộ cho quản trị viên..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>

            <button
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-bold text-xs rounded-lg transition shadow-lg shadow-amber-500/10 disabled:opacity-50"
              onClick={handleUpdateStatus}
              disabled={saving}
            >
              <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>

          {/* Status History */}
          {booking.statusHistory && booking.statusHistory.length > 0 && (
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Lịch sử trạng thái</h3>
              <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-5">
                {booking.statusHistory.slice().reverse().map((hist, idx) => (
                  <div key={idx} className="relative">
                    {/* Dot marker */}
                    <div className="absolute -left-[30px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 border border-black shadow" />
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(hist.status)}
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(hist.changedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {hist.note && (
                        <div className="text-xs text-zinc-400 italic bg-zinc-900/40 p-2 rounded border border-zinc-805 mt-1">
                          <strong>Ghi chú:</strong> {hist.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
