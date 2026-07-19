import axiosInstance from './axiosInstance';

export const getMyWallet = () => axiosInstance.get('/wallet');

export const getMyWalletTransactions = (params = {}) =>
  axiosInstance.get('/wallet/transactions', { params });
