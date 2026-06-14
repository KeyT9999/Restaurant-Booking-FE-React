import { useEffect, useState } from 'react';
import { TrendingUp, CreditCard, RefreshCcw, Users, ArrowUpRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetRevenue, adminGetPayments } from '../../api/paymentApi';
import './AdminRevenue.css';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export default function AdminRevenue() {
  const [revenue, setRevenue] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

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

  return (
    <AdminLayout>
      <div className="admin-revenue">
        <div className="admin-revenue__header">
          <h1 className="admin-revenue__title">Doanh thu</h1>
          <button className="admin-revenue__refresh" onClick={loadData} disabled={loading}>
            <RefreshCcw size={16} /> Làm mới
          </button>
        </div>

        {loading && <div className="admin-revenue__loading">Đang tải dữ liệu...</div>}

        {revenue && (
          <>
            {/* KPI Cards */}
            <div className="revenue-kpi-grid">
              <article className="revenue-kpi-card">
                <div className="revenue-kpi-card__icon"><TrendingUp size={20} /></div>
                <span className="revenue-kpi-card__label">TỔNG DOANH THU</span>
                <strong className="revenue-kpi-card__value">{formatMoney(revenue.totalRevenue)}</strong>
              </article>
              <article className="revenue-kpi-card">
                <div className="revenue-kpi-card__icon"><CreditCard size={20} /></div>
                <span className="revenue-kpi-card__label">DOANH THU GÓI</span>
                <strong className="revenue-kpi-card__value">{formatMoney(revenue.subscriptionRevenue?.total)}</strong>
                <small>{revenue.subscriptionRevenue?.count || 0} giao dịch</small>
              </article>
              <article className="revenue-kpi-card">
                <div className="revenue-kpi-card__icon"><ArrowUpRight size={20} /></div>
                <span className="revenue-kpi-card__label">DOANH THU ĐẶT CỌC</span>
                <strong className="revenue-kpi-card__value">{formatMoney(revenue.bookingRevenue?.total)}</strong>
                <small>{revenue.bookingRevenue?.count || 0} giao dịch</small>
              </article>
              <article className="revenue-kpi-card revenue-kpi-card--refund">
                <div className="revenue-kpi-card__icon"><RefreshCcw size={20} /></div>
                <span className="revenue-kpi-card__label">ĐÃ HOÀN TIỀN</span>
                <strong className="revenue-kpi-card__value">{formatMoney(revenue.refundTotal?.total)}</strong>
                <small>{revenue.refundTotal?.count || 0} giao dịch</small>
              </article>
            </div>

            {/* Net Revenue Summary */}
            <div className="revenue-net-summary">
              <span>Doanh thu thuần:</span>
              <strong>{formatMoney(revenue.netRevenue)}</strong>
              <span className="revenue-net-summary__subs">
                <Users size={14} /> {revenue.activeSubscriptions || 0} gói đang hoạt động
              </span>
            </div>

            {/* Daily Revenue Chart (simplified bar chart) */}
            {revenue.dailyRevenue && revenue.dailyRevenue.length > 0 && (
              <section className="revenue-chart-section">
                <h3 className="revenue-chart-title">Doanh thu 30 ngày gần đây</h3>
                <div className="revenue-chart">
                  {revenue.dailyRevenue.map((day) => {
                    const maxVal = Math.max(...revenue.dailyRevenue.map(d => d.total));
                    const height = maxVal > 0 ? (day.total / maxVal) * 100 : 0;
                    return (
                      <div key={day._id} className="revenue-chart__bar-wrap" title={`${day._id}: ${formatMoney(day.total)}`}>
                        <div className="revenue-chart__bar" style={{ height: `${Math.max(height, 4)}%` }} />
                        <span className="revenue-chart__label">{day._id.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recent Transactions */}
            <section className="revenue-recent">
              <h3 className="revenue-chart-title">Giao dịch gần đây</h3>
              {recentPayments.length === 0 ? (
                <p className="revenue-empty">Chưa có giao dịch nào.</p>
              ) : (
                <div className="revenue-table-wrap">
                  <table className="revenue-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Loại</th>
                        <th>Người thanh toán</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((p) => (
                        <tr key={p._id}>
                          <td>{formatDate(p.paidAt || p.createdAt)}</td>
                          <td>
                            <span className={`revenue-type revenue-type--${p.targetType}`}>
                              {p.targetType === 'subscription' ? 'Gói dịch vụ' : 'Đặt cọc'}
                            </span>
                          </td>
                          <td>{p.userId?.fullName || '—'}</td>
                          <td className="revenue-td-amount">{formatMoney(p.amount)}</td>
                          <td><span className={`billing-status billing-status--${p.status}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
