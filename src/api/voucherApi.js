import axiosInstance from './axiosInstance';

// ─── Customer / Public Voucher APIs ───
export const validateVoucherForBooking = (data) =>
  axiosInstance.post('/vouchers/validate', data);

export const saveVoucher = (data) =>
  axiosInstance.post('/vouchers/save', data);

export const getMyVouchers = (params) =>
  axiosInstance.get('/vouchers/my-vouchers', { params });

export const getRestaurantVouchers = (restaurantId) =>
  axiosInstance.get(`/vouchers/restaurant/${restaurantId}`);

export const getHomepageVoucherCampaigns = (params) =>
  axiosInstance.get('/vouchers/campaigns/homepage', { params });

// ─── Owner Voucher APIs ───
export const getOwnerVouchers = (params) =>
  axiosInstance.get('/vouchers/owner/list', { params });

export const createVoucher = (data) =>
  axiosInstance.post('/vouchers', data);

export const updateVoucher = (id, data) =>
  axiosInstance.put(`/vouchers/${id}`, data);

export const deleteVoucher = (id) =>
  axiosInstance.delete(`/vouchers/${id}`);

export const getVoucherStats = (id) =>
  axiosInstance.get(`/vouchers/${id}/stats`);

// ─── Admin Voucher APIs ───
export const getAdminVouchers = () =>
  axiosInstance.get('/vouchers/admin/list');
