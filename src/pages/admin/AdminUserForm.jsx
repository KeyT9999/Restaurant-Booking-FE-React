import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminApi } from '../../api/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3 bg-[#1A1D24] border border-zinc-800 rounded-xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? 'Chỉnh sửa User' : 'Thêm User mới'}
      subtitle={isEdit ? 'Cập nhật thông tin người dùng' : 'Tạo tài khoản mới trong hệ thống'}
    >
      <button 
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition duration-150 mb-6" 
        onClick={() => navigate('/admin/users')}
      >
        <ArrowLeft size={14} /> Quay lại
      </button>

      <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl p-6 shadow-xl max-w-3xl">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Username *</label>
              <input
                {...register('username', {
                  required: 'Username là bắt buộc',
                  minLength: { value: 3, message: 'Ít nhất 3 ký tự' },
                })}
                disabled={isEdit}
                placeholder="Nhập username"
                className="bg-[#13161C] border border-zinc-800 text-zinc-250 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
              />
              {errors.username && <span className="text-xs text-rose-400">{errors.username.message}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Email *</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
                })}
                disabled={isEdit}
                placeholder="Nhập email"
                className="bg-[#13161C] border border-zinc-800 text-zinc-250 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
              />
              {errors.email && <span className="text-xs text-rose-400">{errors.email.message}</span>}
            </div>

            {/* Password (only for create) */}
            {!isEdit && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Mật khẩu *</label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: { value: 8, message: 'Ít nhất 8 ký tự' },
                  })}
                  placeholder="Ít nhất 8 ký tự"
                  className="bg-[#13161C] border border-zinc-800 text-zinc-250 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
                {errors.password && <span className="text-xs text-rose-400">{errors.password.message}</span>}
              </div>
            )}

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Họ và tên *</label>
              <input
                {...register('fullName', { required: 'Họ tên là bắt buộc' })}
                placeholder="Nhập họ và tên"
                className="bg-[#13161C] border border-zinc-800 text-zinc-250 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
              {errors.fullName && <span className="text-xs text-rose-400">{errors.fullName.message}</span>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Số điện thoại</label>
              <input
                {...register('phoneNumber')}
                placeholder="VD: 0901234567"
                className="bg-[#13161C] border border-zinc-800 text-zinc-250 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Địa chỉ</label>
              <input
                {...register('address')}
                placeholder="Nhập địa chỉ"
                className="bg-[#13161C] border border-zinc-800 text-zinc-250 placeholder-zinc-650 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Role *</label>
              <select 
                {...register('role', { required: 'Chọn role' })}
                className="bg-[#13161C] border border-zinc-800 text-zinc-350 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="customer">Khách hàng</option>
                <option value="restaurant_owner">Chủ nhà hàng</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <span className="text-xs text-rose-400">{errors.role.message}</span>}
            </div>

            {/* Active (only for edit) */}
            {isEdit && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Trạng thái</label>
                <select 
                  {...register('active')}
                  className="bg-[#13161C] border border-zinc-800 text-zinc-355 rounded-lg text-sm px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Vô hiệu hóa</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button 
              type="button" 
              className="px-4 py-2 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs rounded-lg transition duration-150" 
              onClick={() => navigate('/admin/users')}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold text-xs rounded-lg transition duration-150 shadow-lg shadow-amber-500/10" 
              disabled={loading}
            >
              <Save size={14} />
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo user'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
