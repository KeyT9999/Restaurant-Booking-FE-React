import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  Search, Plus, Edit3, Trash2, ShieldCheck, ShieldOff,
  RefreshCw, ChevronLeft, ChevronRight, Key,
} from 'lucide-react';
import './AdminUsers.css';

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
    const map = {
      admin: { label: 'Admin', cls: 'admin' },
      customer: { label: 'Khách hàng', cls: 'customer' },
      restaurant_owner: { label: 'Chủ NH', cls: 'restaurant_owner' },
    };
    const r = map[role] || { label: role, cls: '' };
    return <span className={`role-badge ${r.cls}`}>{r.label}</span>;
  };

  return (
    <AdminLayout title="Quản lý Users" subtitle={`Tổng cộng ${pagination.total} người dùng`}>
      {/* Toolbar */}
      <div className="users-toolbar">
        <form onSubmit={handleSearch} className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm username, email, tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <select
            value={filters.role}
            onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary" onClick={() => navigate('/admin/users/create')}>
          <Plus size={16} /> Thêm user
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <p>Không tìm thấy user nào</p>
          <button onClick={() => { setFilters({ search: '', role: '', status: '' }); setSearchInput(''); }}>
            <RefreshCw size={14} /> Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Email verified</th>
                  <th>Đăng nhập cuối</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" />
                          ) : (
                            user.fullName?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div>
                          <div className="user-cell-name">{user.fullName}</div>
                          <div className="user-cell-email">{user.email}</div>
                          <div className="user-cell-username">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      <span className={`status-dot ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${user.emailVerified ? 'active' : 'inactive'}`}>
                        {user.emailVerified ? 'Đã xác minh' : 'Chưa'}
                      </span>
                    </td>
                    <td className="date-cell">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="date-cell">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn edit"
                          title="Chỉnh sửa"
                          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="action-btn key"
                          title="Đặt lại mật khẩu"
                          onClick={() => setResetPwModal(user)}
                        >
                          <Key size={14} />
                        </button>
                        <button
                          className={`action-btn ${user.active ? 'deactivate' : 'activate'}`}
                          title={user.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            className="action-btn delete"
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-info">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa user <strong>{confirmDelete.fullName}</strong>?</p>
            <p className="modal-hint">Tài khoản sẽ bị vô hiệu hóa (soft delete).</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="btn-danger" onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwModal && (
        <div className="modal-overlay" onClick={() => { setResetPwModal(null); setNewPassword(''); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Đặt lại mật khẩu</h3>
            <p>Đặt mật khẩu mới cho <strong>{resetPwModal.fullName}</strong></p>
            <input
              type="password"
              className="modal-input"
              placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setResetPwModal(null); setNewPassword(''); }}>Hủy</button>
              <button className="btn-primary" onClick={handleResetPassword} disabled={newPassword.length < 8}>
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
