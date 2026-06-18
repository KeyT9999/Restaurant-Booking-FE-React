import axiosInstance from './axiosInstance';

// ─── Owner Withdrawal APIs ───
export const createWithdrawal = (data) =>
  axiosInstance.post('/owner/withdrawals', data);

export const getMyWithdrawals = (params) =>
  axiosInstance.get('/owner/withdrawals', { params });

export const getWithdrawalById = (id) =>
  axiosInstance.get(`/owner/withdrawals/${id}`);

// ─── Admin Withdrawal APIs ───
export const adminGetWithdrawals = (params) =>
  axiosInstance.get('/admin/withdrawals', { params });

export const adminApproveWithdrawal = (id, data) =>
  axiosInstance.patch(`/admin/withdrawals/${id}/approve`, data);

export const adminRejectWithdrawal = (id, data) =>
  axiosInstance.patch(`/admin/withdrawals/${id}/reject`, data);

export const adminCompleteWithdrawal = (id, data) =>
  axiosInstance.patch(`/admin/withdrawals/${id}/complete`, data);
