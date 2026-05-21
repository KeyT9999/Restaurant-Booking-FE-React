import axiosInstance from './axiosInstance';

/**
 * Profile API Service — BookEat
 *
 * Tất cả request đều yêu cầu JWT token (tự động đính kèm bởi axiosInstance interceptor).
 * userId luôn lấy từ token phía backend — không bao giờ truyền userId trong body/URL.
 */
export const profileApi = {
  /**
   * Lấy thông tin profile của user đang đăng nhập.
   * GET /api/v1/users/me
   */
  async getMyProfile() {
    const response = await axiosInstance.get('/users/me');
    return response.user || response;
  },

  /**
   * Cập nhật thông tin cá nhân (fullName, phoneNumber, address).
   * PUT /api/v1/users/me
   * @param {Object} data - { fullName?, phoneNumber?, address? }
   */
  async updateMyProfile(data) {
    const response = await axiosInstance.put('/users/me', data);
    return response;
  },

  /**
   * Đổi mật khẩu.
   * PUT /api/v1/users/me/password
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   */
  async changeMyPassword(data) {
    const response = await axiosInstance.put('/users/me/password', data);
    return response;
  },

  // TODO: Upload avatar — cần backend hỗ trợ multer
  // async uploadAvatar(file) {
  //   const formData = new FormData();
  //   formData.append('avatar', file);
  //   return axiosInstance.post('/users/me/avatar', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' },
  //   });
  // },

  // TODO: Lịch sử đặt bàn — cần backend có model Booking
  // async getMyBookings() {
  //   return axiosInstance.get('/users/me/bookings');
  // },
};
