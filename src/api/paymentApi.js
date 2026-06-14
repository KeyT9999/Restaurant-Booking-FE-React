import axiosInstance from './axiosInstance';

// ─── Payment APIs ───
export const createPayment = (data) =>
  axiosInstance.post('/payments/create', data);

export const getMyPayments = (params) =>
  axiosInstance.get('/payments/my', { params });

export const getPaymentById = (id) =>
  axiosInstance.get(`/payments/${id}`);

export const checkPaymentStatus = (orderCode) =>
  axiosInstance.get(`/payments/check-status/${orderCode}`);

export const cancelPayment = (id) =>
  axiosInstance.post(`/payments/${id}/cancel`);

// ─── Refund APIs ───
export const createRefundRequest = (data) =>
  axiosInstance.post('/refunds/request', data);

// ─── Owner Billing APIs ───
export const getCurrentSubscription = () =>
  axiosInstance.get('/owner/billing/current');

export const getBillingHistory = (params) =>
  axiosInstance.get('/owner/billing/history', { params });

// ─── Admin Payment APIs ───
export const adminGetPayments = (params) =>
  axiosInstance.get('/admin/payments', { params });

export const adminGetTransactions = (params) =>
  axiosInstance.get('/admin/transactions', { params });

export const adminGetRevenue = (params) =>
  axiosInstance.get('/admin/revenue', { params });

export const adminGetRefunds = (params) =>
  axiosInstance.get('/admin/refunds', { params });

export const adminApproveRefund = (id, data) =>
  axiosInstance.patch(`/admin/refunds/${id}/approve`, data);

export const adminRejectRefund = (id, data) =>
  axiosInstance.patch(`/admin/refunds/${id}/reject`, data);

export const adminProcessRefund = (id, data) =>
  axiosInstance.post(`/admin/refunds/${id}/process`, data);

export const adminGetWebhookLogs = (params) =>
  axiosInstance.get('/admin/webhook-logs', { params });
