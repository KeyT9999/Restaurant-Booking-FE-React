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
};
