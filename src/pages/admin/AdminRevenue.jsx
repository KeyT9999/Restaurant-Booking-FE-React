import { useEffect, useState } from 'react';
import { TrendingUp, RefreshCcw, Users } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetRevenue, adminGetPayments } from '../../api/paymentApi';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export default function AdminRevenue() {
  const [revenue, setRevenue] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, payRes] = await Promise.all([
        adminGetRevenue(),
        adminGetPayments({ limit: 8, status: 'paid' }),
      ]);
      setRevenue(revRes.data);
      setRecentPayments(payRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);


  return (
    <AdminLayout title="Doanh thu" subtitle="Quản lý dòng tiền và doanh thu toàn sàn BookEat">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
        <h1 className="text-xl font-extrabold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
          <TrendingUp className="text-amber-500" /> Báo cáo doanh thu
        </h1>
        <button 
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition disabled:opacity-50" 
          onClick={loadData} 
          disabled={loading}
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl mb-6">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      )}

      {revenue && !loading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-amber-500">
              <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold">Tổng doanh thu</span>
              <strong className="text-2xl font-black text-amber-500 mt-1">{formatMoney(revenue.totalRevenue)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">Tính cả đăng ký & cọc bàn</span>
            </div>
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-blue-500">
              <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold">Doanh thu gói</span>
              <strong className="text-2xl font-black text-blue-400 mt-1">{formatMoney(revenue.subscriptionRevenue?.total)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">{revenue.subscriptionRevenue?.count || 0} giao dịch</span>
            </div>
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-emerald-500">
              <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold">Doanh thu đặt cọc</span>
              <strong className="text-2xl font-black text-emerald-400 mt-1">{formatMoney(revenue.bookingRevenue?.total)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">{revenue.bookingRevenue?.count || 0} giao dịch</span>
            </div>
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col justify-between border-l-4 border-l-rose-500">
              <span className="text-xs text-zinc-550 uppercase tracking-wide font-semibold">Đã hoàn tiền</span>
              <strong className="text-2xl font-black text-rose-400 mt-1">{formatMoney(revenue.refundTotal?.total)}</strong>
              <span className="text-[10px] text-zinc-500 mt-2 font-mono">{revenue.refundTotal?.count || 0} giao dịch</span>
            </div>
          </div>

          {/* Net Revenue Summary */}
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 font-medium">Doanh thu thực nhận (Net Revenue):</span>
              <strong className="text-xl font-black text-emerald-450">{formatMoney(revenue.netRevenue)}</strong>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#13161C] border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300">
              <Users size={14} className="text-amber-500" /> {revenue.activeSubscriptions || 0} gói đang hoạt động
            </span>
          </div>

          {/* Daily Revenue Chart */}
          {revenue.dailyRevenue && revenue.dailyRevenue.length > 0 && (
            <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg mb-6">
              <h3 className="text-sm font-bold text-zinc-200 mb-6 pb-2 border-b border-zinc-805 uppercase tracking-wide">Doanh thu 30 ngày gần đây</h3>
              <div className="flex items-end justify-between h-48 pt-4 gap-1.5 overflow-x-auto scrollbar-none">
                {revenue.dailyRevenue.map((day) => {
                  const maxVal = Math.max(...revenue.dailyRevenue.map(d => d.total));
                  const height = maxVal > 0 ? (day.total / maxVal) * 100 : 0;
                  return (
                    <div key={day._id} className="flex flex-col items-center flex-1 min-w-[32px] group" title={`${day._id}: ${formatMoney(day.total)}`}>
                      <div className="w-full relative flex flex-col justify-end h-32">
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 px-2 py-0.5 rounded whitespace-nowrap shadow-md z-10">
                          {formatMoney(day.total)}
                        </div>
                        <div 
                          className="w-full bg-amber-500/80 hover:bg-amber-500 rounded-t-sm transition-all duration-300" 
                          style={{ height: `${Math.max(height, 4)}%` }} 
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-2 font-mono">{day._id.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-805 uppercase tracking-wide">Giao dịch gần đây</h3>
            {recentPayments.length === 0 ? (
              <p className="text-xs text-zinc-550 italic py-4 text-center">Chưa có giao dịch nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-zinc-350 text-sm">
                  <thead>
                    <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-455 font-medium">
                      <th className="p-4">Ngày</th>
                      <th className="p-4">Loại</th>
                      <th className="p-4">Người thanh toán</th>
                      <th className="p-4">Số tiền</th>
                      <th className="p-4 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-805">
                    {recentPayments.map((p) => (
                      <tr key={p._id} className="hover:bg-zinc-850/30 transition-colors">
                        <td className="p-4 text-xs text-zinc-400 font-mono">{formatDate(p.paidAt || p.createdAt)}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                            p.targetType === 'subscription' 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {p.targetType === 'subscription' ? 'Gói dịch vụ' : 'Đặt cọc'}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-zinc-300">{p.userId?.fullName || '—'}</td>
                        <td className="p-4 font-bold text-zinc-200 font-mono">{formatMoney(p.amount)}</td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
