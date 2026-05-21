import axios from 'axios';

// ─────────────────────────────────────────────
// Axios Instance — Kết nối với BookEat Backend
// ─────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials không cần thiết khi dùng Vite proxy trong development
});

// ─────────────────────────────────────────────
// Request Interceptor — Tự động đính kèm JWT Token
// ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bookeat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// Response Interceptor — Xử lý lỗi toàn cục
// ─────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response.data, // Tự động unwrap data
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';

    // 401 — Token hết hạn, chuyển về trang login
    if (status === 401) {
      localStorage.removeItem('bookeat_token');
      localStorage.removeItem('bookeat_user');
      if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }

    // 403 — Không có quyền truy cập
    if (status === 403) {
      console.warn('⛔ Không có quyền truy cập');
    }

    // 500 — Lỗi server
    if (status >= 500) {
      console.error('💥 Server error:', message);
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default axiosInstance;
