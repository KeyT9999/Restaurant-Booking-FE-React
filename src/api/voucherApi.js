import axiosInstance from './axiosInstance';

// ─── Customer / Public Voucher APIs ───
export const validateVoucherForBooking = (data) =>
  axiosInstance.post('/vouchers/validate', data);

export const saveVoucher = (data) =>
  axiosInstance.post('/vouchers/save', data);

export const unsaveVoucher = (voucherId) =>
  axiosInstance.delete(`/vouchers/unsave/${voucherId}`);

export const getMyVouchers = (params) =>
  axiosInstance.get('/vouchers/my-vouchers', { params });

export const getMyVouchersHistory = (params) =>
  axiosInstance.get('/vouchers/my-history', { params });

export const getRestaurantVouchers = (restaurantId) =>
  axiosInstance.get(`/vouchers/restaurant/${restaurantId}`);

export const getHomepageVoucherCampaigns = (params) =>
  axiosInstance.get('/vouchers/campaigns/homepage', { params });

export const getPlatformVouchers = (params) =>
  axiosInstance.get('/vouchers/platform', { params });

export const getVoucherById = (id) =>
  axiosInstance.get(`/vouchers/${id}`);

// ─── Owner Voucher APIs ───
export const getOwnerVouchers = (params) =>
  axiosInstance.get('/vouchers/owner/list', { params });

export const createOwnerVoucher = (data) =>
  axiosInstance.post('/vouchers/owner/vouchers', data);

export const updateOwnerVoucher = (id, data) =>
  axiosInstance.put(`/vouchers/owner/vouchers/${id}`, data);

export const changeOwnerVoucherStatus = (id, status) =>
  axiosInstance.patch(`/vouchers/owner/vouchers/${id}/status`, { status });

export const deleteOwnerVoucher = (id) =>
  axiosInstance.delete(`/vouchers/owner/vouchers/${id}`);

export const getOwnerVoucherStats = (id) =>
  axiosInstance.get(`/vouchers/owner/vouchers/${id}/stats`);

export const getOwnerVoucherRedemptions = (id, params) =>
  axiosInstance.get(`/vouchers/owner/vouchers/${id}/redemptions`, { params });

export const getOwnerRestaurantRedemptions = (params) =>
  axiosInstance.get('/vouchers/owner/vouchers/redemptions', { params });

export const getOwnerVouchersAnalytics = (params) =>
  axiosInstance.get('/vouchers/owner/vouchers/analytics', { params });

// ─── Admin Voucher APIs ───
export const getAdminVouchers = (params) =>
  axiosInstance.get('/vouchers/admin/list', { params });

export const createPlatformVoucher = (data) =>
  axiosInstance.post('/vouchers/admin/vouchers', data);

export const updateAdminVoucher = (id, data) =>
  axiosInstance.put(`/vouchers/admin/vouchers/${id}`, data);

export const changeAdminVoucherStatus = (id, status) =>
  axiosInstance.patch(`/vouchers/admin/vouchers/${id}/status`, { status });

export const deleteAdminVoucher = (id, force = false) =>
  axiosInstance.delete(`/vouchers/admin/vouchers/${id}?force=${force}`);

export const getAdminVouchersAnalytics = (params) =>
  axiosInstance.get('/vouchers/admin/vouchers/analytics', { params });

export const getAdminVouchersFraudReport = () =>
  axiosInstance.get('/vouchers/admin/vouchers/fraud-report');

export const resetAdminVoucherUsage = (id, count) =>
  axiosInstance.post(`/vouchers/admin/vouchers/${id}/reset-usage`, { count });

export const issueAdminVoucherCompensation = (data) =>
  axiosInstance.post('/vouchers/admin/vouchers/compensation', data);

// ─── Admin Campaigns APIs ───
export const createAdminCampaign = (data) =>
  axiosInstance.post('/vouchers/admin/campaigns', data);

export const getAdminCampaigns = () =>
  axiosInstance.get('/vouchers/admin/campaigns');

export const updateAdminCampaign = (id, data) =>
  axiosInstance.put(`/vouchers/admin/campaigns/${id}`, data);
