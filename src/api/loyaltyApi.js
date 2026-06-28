import axiosInstance from './axiosInstance';

export const loyaltyApi = {
  /**
   * Lấy tóm tắt ví xu và lịch sử giao dịch.
   * GET /api/v1/loyalty/summary
   */
  async getLoyaltySummary() {
    const response = await axiosInstance.get('/loyalty/summary');
    return response.data || response;
  },

  /**
   * Giả lập tích lũy Coins (dành cho kiểm thử/simulation).
   * POST /api/v1/loyalty/simulate
   * @param {Object} data - { amount, source: 'deposit' | 'completed' }
   */
  async simulateEarn(data) {
    const response = await axiosInstance.post('/loyalty/simulate', data);
    return response;
  },
};
