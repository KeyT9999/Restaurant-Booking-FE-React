import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import RestaurantStatsCards from '../../components/admin/RestaurantStatsCards';
import {
  Users, UserCheck, UserX,
  MailCheck, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';

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
    <AdminLayout title="Tổng quan" subtitle="Hệ thống báo cáo và hoạt động BookEat">
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Đang tải dữ liệu tổng quan...</span>
        </div>
      )}

      {error && (
        <div className="p-8 text-center max-w-md mx-auto my-10 border border-destructive/20 bg-destructive/10 rounded-2xl">
          <p className="text-sm text-destructive font-medium mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            className="border-destructive/35 text-destructive hover:bg-destructive/10 text-xs gap-1.5"
          >
            <RefreshCw size={14} /> Thử lại
          </Button>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer text-left"
              onClick={() => navigate('/admin/users')}
            >
              <div className="w-11 h-11 rounded-lg bg-blue-500/12 text-blue-400 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">{data.overview.totalUsers}</span>
                <span className="text-xs text-muted-foreground mt-0.5">Tổng người dùng</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-emerald-500/35 transition-all text-left">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/12 text-emerald-400 flex items-center justify-center shrink-0">
                <UserCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-400">{data.overview.activeUsers}</span>
                <span className="text-xs text-muted-foreground mt-0.5">Đang hoạt động</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-rose-500/35 transition-all text-left">
              <div className="w-11 h-11 rounded-lg bg-rose-500/12 text-rose-450 flex items-center justify-center shrink-0">
                <UserX size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-rose-450">{data.overview.inactiveUsers}</span>
                <span className="text-xs text-muted-foreground mt-0.5">Đã vô hiệu hóa</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-amber-500/35 transition-all text-left">
              <div className="w-11 h-11 rounded-lg bg-amber-550/12 text-primary flex items-center justify-center shrink-0">
                <MailCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">{data.overview.verifiedUsers}</span>
                <span className="text-xs text-muted-foreground mt-0.5">Đã xác minh email</span>
              </div>
            </div>
          </div>

          {/* Restaurant Stats */}
          <div>
            <h3 className="font-serif text-base font-bold text-white mb-4 text-left">Thống kê trạng thái nhà hàng</h3>
            <RestaurantStatsCards stats={data.restaurantStats} />
          </div>

          {/* Role Distribution & Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phân bố theo Role */}
            <div className="bg-card border border-border rounded-xl p-6 text-left">
              <h3 className="font-serif text-base font-bold text-white mb-6">Phân bố vai trò (Role)</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Khách hàng</span>
                    <span className="font-bold text-white">{data.overview.totalCustomers}</span>
                  </div>
                  <div className="h-2 bg-[#0F1115] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                      style={{ width: `${data.overview.totalUsers > 0 ? (data.overview.totalCustomers / data.overview.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Chủ nhà hàng</span>
                    <span className="font-bold text-white">{data.overview.totalOwners}</span>
                  </div>
                  <div className="h-2 bg-[#0F1115] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                      style={{ width: `${data.overview.totalUsers > 0 ? (data.overview.totalOwners / data.overview.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Quản trị viên (Admin)</span>
                    <span className="font-bold text-white">{data.overview.totalAdmins}</span>
                  </div>
                  <div className="h-2 bg-[#0F1115] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                      style={{ width: `${data.overview.totalUsers > 0 ? (data.overview.totalAdmins / data.overview.totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Trend */}
            <div className="bg-card border border-border rounded-xl p-6 text-left">
              <h3 className="font-serif text-base font-bold text-white mb-6">Đăng ký mới 7 ngày qua</h3>
              {data.registrationTrend.length === 0 ? (
                <div className="p-10 text-center text-xs text-muted-foreground">Chưa có dữ liệu thống kê</div>
              ) : (
                <div className="flex items-end gap-2.5 h-[140px] pt-2">
                  {data.registrationTrend.map((item) => {
                    const max = Math.max(...data.registrationTrend.map((i) => i.count), 1);
                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                        <div className="flex-1 w-full flex items-end bg-[#0F1115]/40 rounded-t-md overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-md min-h-[4px]"
                            style={{ height: `${(item.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-white">{item.count}</span>
                        <span className="text-[9px] text-muted-foreground/80">
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
          <div className="bg-card border border-border rounded-xl p-6 text-left shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-base font-bold text-white">Thành viên mới nhất</h3>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/admin/users')}
                className="text-primary hover:underline hover:text-primary/90 p-0 h-auto"
              >
                Xem tất cả →
              </Button>
            </div>
            {data.recentUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Chưa có người dùng nào đăng ký mới.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-[#0F1115]/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Vai trò (Role)</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Ngày tham gia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {data.recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {user.fullName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate max-w-xs">{user.fullName}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            user.role === 'admin' 
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                              : user.role === 'restaurant_owner' 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : user.role === 'restaurant_owner' ? 'Chủ nhà hàng' : 'Khách hàng'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            user.active ? 'text-emerald-400' : 'text-rose-450'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {user.active ? 'Hoạt động' : 'Vô hiệu'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
