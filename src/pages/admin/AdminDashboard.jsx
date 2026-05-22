import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Users, UserCheck, UserX, ShieldCheck, TrendingUp,
  MailCheck, RefreshCw,
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <AdminLayout title="Dashboard" subtitle="Tổng quan hệ thống BookEat">
      {loading && (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={fetchDashboard}>
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card" onClick={() => navigate('/admin/users')}>
              <div className="kpi-icon-wrap blue">
                <Users size={20} />
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{data.overview.totalUsers}</span>
                <span className="kpi-label">Tổng users</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap green">
                <UserCheck size={20} />
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{data.overview.activeUsers}</span>
                <span className="kpi-label">Đang hoạt động</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap red">
                <UserX size={20} />
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{data.overview.inactiveUsers}</span>
                <span className="kpi-label">Đã vô hiệu hóa</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap amber">
                <MailCheck size={20} />
              </div>
              <div className="kpi-body">
                <span className="kpi-value">{data.overview.verifiedUsers}</span>
                <span className="kpi-label">Đã xác minh email</span>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="stats-grid">
            <div className="stats-card">
              <h3 className="stats-title">Phân bố theo Role</h3>
              <div className="role-bars">
                <div className="role-bar-item">
                  <div className="role-bar-header">
                    <span>Khách hàng</span>
                    <span className="role-count">{data.overview.totalCustomers}</span>
                  </div>
                  <div className="role-bar-track">
                    <div
                      className="role-bar-fill blue"
                      style={{ width: `${data.overview.totalUsers > 0 ? (data.overview.totalCustomers / data.overview.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="role-bar-item">
                  <div className="role-bar-header">
                    <span>Chủ nhà hàng</span>
                    <span className="role-count">{data.overview.totalOwners}</span>
                  </div>
                  <div className="role-bar-track">
                    <div
                      className="role-bar-fill green"
                      style={{ width: `${data.overview.totalUsers > 0 ? (data.overview.totalOwners / data.overview.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="role-bar-item">
                  <div className="role-bar-header">
                    <span>Quản trị viên</span>
                    <span className="role-count">{data.overview.totalAdmins}</span>
                  </div>
                  <div className="role-bar-track">
                    <div
                      className="role-bar-fill amber"
                      style={{ width: `${data.overview.totalUsers > 0 ? (data.overview.totalAdmins / data.overview.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Trend */}
            <div className="stats-card">
              <h3 className="stats-title">Đăng ký 7 ngày qua</h3>
              {data.registrationTrend.length === 0 ? (
                <div className="stats-empty">Chưa có dữ liệu</div>
              ) : (
                <div className="trend-chart">
                  {data.registrationTrend.map((item) => {
                    const max = Math.max(...data.registrationTrend.map((i) => i.count), 1);
                    return (
                      <div key={item.date} className="trend-bar-item">
                        <div className="trend-bar-wrapper">
                          <div
                            className="trend-bar-fill"
                            style={{ height: `${(item.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="trend-count">{item.count}</span>
                        <span className="trend-date">
                          {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="recent-card">
            <div className="recent-header">
              <h3 className="stats-title">Users mới nhất</h3>
              <button className="btn-link" onClick={() => navigate('/admin/users')}>
                Xem tất cả →
              </button>
            </div>
            {data.recentUsers.length === 0 ? (
              <div className="stats-empty">Chưa có user nào</div>
            ) : (
              <div className="recent-table-wrap">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-cell-avatar">
                              {user.fullName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="user-cell-name">{user.fullName}</div>
                              <div className="user-cell-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? 'Admin' :
                             user.role === 'restaurant_owner' ? 'Chủ NH' : 'Khách hàng'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-dot ${user.active ? 'active' : 'inactive'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="date-cell">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
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
