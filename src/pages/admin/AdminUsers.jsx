import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  Search, Plus, Edit3, Trash2, ShieldCheck, ShieldOff,
  RefreshCw, ChevronLeft, ChevronRight, Key,
} from 'lucide-react';

const ROLES = [
  { value: '', label: 'Tất cả role' },
  { value: 'customer', label: 'Khách hàng' },
  { value: 'restaurant_owner', label: 'Chủ nhà hàng' },
  { value: 'admin', label: 'Admin' },
];

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã vô hiệu hóa' },
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [searchInput, setSearchInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [resetPwModal, setResetPwModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, limit: 20, ...filters });
      setUsers(res.data.users);
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
      });
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await adminApi.toggleUserStatus(user.id, !user.active);
      toast.success(res.message);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await adminApi.deleteUser(confirmDelete.id);
      toast.success(res.message);
      setConfirmDelete(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Không thể xóa');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwModal || !newPassword) return;
    try {
      const res = await adminApi.resetUserPassword(resetPwModal.id, newPassword);
      toast.success(res.message);
      setResetPwModal(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Không thể đặt lại mật khẩu');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Admin</span>;
      case 'restaurant_owner':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Chủ NH</span>;
      case 'customer':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Khách hàng</span>;
    }
  };

  return (
    <AdminLayout title="Quản lý Users" subtitle={`Tổng cộng ${pagination.total} người dùng`}>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm username, email, tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1A1D24] border border-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg text-sm pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.role}
            onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
            className="bg-[#1A1D24] border border-zinc-800 text-zinc-300 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="bg-[#1A1D24] border border-zinc-800 text-zinc-300 rounded-lg text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold text-sm rounded-lg transition duration-150 shadow-lg shadow-amber-500/10" 
            onClick={() => navigate('/admin/users/create')}
          >
            <Plus size={16} /> Thêm user
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <p className="text-sm">Không tìm thấy user nào</p>
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg transition duration-150"
            onClick={() => { setFilters({ search: '', role: '', status: '' }); setSearchInput(''); }}
          >
            <RefreshCw size={14} /> Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-zinc-300 text-sm">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-450 font-medium">
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Email verified</th>
                    <th className="p-4">Đăng nhập cuối</th>
                    <th className="p-4">Ngày tạo</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-850/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-sm font-semibold text-amber-500">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              user.fullName?.[0]?.toUpperCase() || '?'
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-200">{user.fullName}</div>
                            <div className="text-xs text-zinc-400">{user.email}</div>
                            <div className="text-xs text-zinc-500 font-mono">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(user.role)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          user.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-550/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          user.emailVerified 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                        }`}>
                          {user.emailVerified ? 'Đã xác minh' : 'Chưa'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-zinc-400 font-mono">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="p-4 text-xs text-zinc-400 font-mono">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-lg transition"
                            title="Chỉnh sửa"
                            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 rounded-lg transition"
                            title="Đặt lại mật khẩu"
                            onClick={() => setResetPwModal(user)}
                          >
                            <Key size={14} />
                          </button>
                          <button
                            className={`p-1.5 hover:bg-zinc-800 rounded-lg transition ${
                              user.active ? 'text-zinc-400 hover:text-rose-500' : 'text-zinc-400 hover:text-emerald-500'
                            }`}
                            title={user.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              className="p-1.5 hover:bg-zinc-850/80 text-zinc-400 hover:text-rose-500 rounded-lg transition"
                              title="Xóa"
                              onClick={() => setConfirmDelete(user)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1)}
                className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-zinc-400">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.page + 1)}
                className="p-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 rounded-lg transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-zinc-150 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-zinc-400 mb-2">Bạn có chắc muốn xóa user <strong className="text-zinc-200">{confirmDelete.fullName}</strong>?</p>
            <p className="text-xs text-rose-400 mb-4">Tài khoản sẽ bị vô hiệu hóa (soft delete).</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-medium text-xs rounded-lg transition duration-150" 
                onClick={() => setConfirmDelete(null)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition duration-150 shadow-lg shadow-rose-600/10" 
                onClick={handleDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => { setResetPwModal(null); setNewPassword(''); }}>
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-zinc-150 mb-2">Đặt lại mật khẩu</h3>
            <p className="text-sm text-zinc-400 mb-4">Đặt mật khẩu mới cho <strong className="text-zinc-250">{resetPwModal.fullName}</strong></p>
            <input
              type="password"
              className="w-full bg-[#13161C] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 mb-4"
              placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
            />
            <div className="flex items-center justify-end gap-3">
              <button 
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-medium text-xs rounded-lg transition duration-150" 
                onClick={() => { setResetPwModal(null); setNewPassword(''); }}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold text-xs rounded-lg transition duration-150 shadow-lg shadow-amber-500/10 disabled:opacity-50" 
                onClick={handleResetPassword} 
                disabled={newPassword.length < 8}
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
