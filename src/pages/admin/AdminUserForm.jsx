import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import './AdminUsers.css';

export default function AdminUserForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      adminApi
        .getUserById(id)
        .then((res) => {
          reset({
            username:    res.data.username,
            email:       res.data.email,
            fullName:    res.data.fullName,
            phoneNumber: res.data.phoneNumber || '',
            address:     res.data.address || '',
            role:        res.data.role,
            active:      res.data.active,
          });
        })
        .catch((err) => {
          toast.error(err.message || 'Không tìm thấy user');
          navigate('/admin/users');
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        const res = await adminApi.updateUser(id, {
          fullName:    data.fullName,
          phoneNumber: data.phoneNumber || null,
          address:     data.address || null,
          role:        data.role,
          active:      data.active === 'true' || data.active === true,
        });
        toast.success(res.message || 'Cập nhật thành công');
      } else {
        const res = await adminApi.createUser({
          username:    data.username,
          email:       data.email,
          password:    data.password,
          fullName:    data.fullName,
          phoneNumber: data.phoneNumber || null,
          address:     data.address || null,
          role:        data.role || 'customer',
        });
        toast.success(res.message || 'Tạo thành công');
      }
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout title={isEdit ? 'Chỉnh sửa User' : 'Thêm User mới'}>
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? 'Chỉnh sửa User' : 'Thêm User mới'}
      subtitle={isEdit ? 'Cập nhật thông tin người dùng' : 'Tạo tài khoản mới trong hệ thống'}
    >
      <button className="btn-back" onClick={() => navigate('/admin/users')}>
        <ArrowLeft size={16} /> Quay lại
      </button>

      <form className="user-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          {/* Username */}
          <div className="form-group">
            <label>Username *</label>
            <input
              {...register('username', {
                required: 'Username là bắt buộc',
                minLength: { value: 3, message: 'Ít nhất 3 ký tự' },
              })}
              disabled={isEdit}
              placeholder="Nhập username"
            />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
              })}
              disabled={isEdit}
              placeholder="Nhập email"
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          {/* Password (only for create) */}
          {!isEdit && (
            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: { value: 8, message: 'Ít nhất 8 ký tự' },
                })}
                placeholder="Ít nhất 8 ký tự"
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>
          )}

          {/* Full Name */}
          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              {...register('fullName', { required: 'Họ tên là bắt buộc' })}
              placeholder="Nhập họ và tên"
            />
            {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              {...register('phoneNumber')}
              placeholder="VD: 0901234567"
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label>Địa chỉ</label>
            <input
              {...register('address')}
              placeholder="Nhập địa chỉ"
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label>Role *</label>
            <select {...register('role', { required: 'Chọn role' })}>
              <option value="customer">Khách hàng</option>
              <option value="restaurant_owner">Chủ nhà hàng</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <span className="form-error">{errors.role.message}</span>}
          </div>

          {/* Active (only for edit) */}
          {isEdit && (
            <div className="form-group">
              <label>Trạng thái</label>
              <select {...register('active')}>
                <option value="true">Đang hoạt động</option>
                <option value="false">Vô hiệu hóa</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin/users')}>
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Save size={16} />
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo user'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
