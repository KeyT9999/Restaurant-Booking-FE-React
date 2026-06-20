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
export const getOwnerBillingPlans = () =>
  axiosInstance.get('/owner/billing/plans');

export const getCurrentSubscription = (params) =>
  axiosInstance.get('/owner/billing/current-subscription', { params });

export const checkoutOwnerSubscription = (data) =>
  axiosInstance.post('/owner/billing/subscription/checkout', data);

export const getBillingHistory = (params) =>
  axiosInstance.get('/owner/billing/transactions', { params });

export const getOwnerBillingTransaction = (id) =>
  axiosInstance.get(`/owner/billing/transactions/${id}`);

export const getFeaturedPackages = () =>
  axiosInstance.get('/owner/monetization/featured/packages');

export const checkoutFeaturedPlacement = (data) =>
  axiosInstance.post('/owner/monetization/featured/checkout', data);

export const getOwnerFeaturedPlacements = (params) =>
  axiosInstance.get('/owner/monetization/featured', { params });

export const getVoucherCampaignPackages = () =>
  axiosInstance.get('/owner/monetization/voucher-campaign/packages');

export const checkoutVoucherCampaign = (data) =>
  axiosInstance.post('/owner/monetization/voucher-campaign/checkout', data);

export const getOwnerVoucherCampaigns = (params) =>
  axiosInstance.get('/owner/monetization/voucher-campaigns', { params });

export const getOwnerBookingCommissions = (params) =>
  axiosInstance.get('/owner/monetization/booking-commissions', { params });

// ─── Admin Payment APIs ───
export const adminGetPayments = (params) =>
  axiosInstance.get('/admin/payments', { params });

export const adminGetTransactions = (params) =>
  axiosInstance.get('/admin/transactions', { params });

export const adminGetRevenue = (params) =>
  axiosInstance.get('/admin/revenue', { params });

export const adminGetMonetizationSummary = (params) =>
  axiosInstance.get('/admin/monetization/summary', { params });

export const adminGetMonetizationPayments = (params) =>
  axiosInstance.get('/admin/monetization/payments', { params });

export const adminGetBookingCommissions = (params) =>
  axiosInstance.get('/admin/monetization/booking-commissions', { params });

export const adminGetTopMonetizationOwners = (params) =>
  axiosInstance.get('/admin/monetization/top-owners', { params });

export const adminGetTopMonetizationRestaurants = (params) =>
  axiosInstance.get('/admin/monetization/top-restaurants', { params });

export const adminGetMonetizationPaymentHealth = (params) =>
  axiosInstance.get('/admin/monetization/payment-health', { params });

export const adminGetSettlementReadiness = (params) =>
  axiosInstance.get('/admin/monetization/settlement-readiness', { params });

export const adminExportMonetizationCsv = (params) =>
  axiosInstance.get('/admin/monetization/export.csv', { params, responseType: 'blob' });

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
