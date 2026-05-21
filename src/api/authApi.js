import axiosInstance from './axiosInstance';

const TOKEN_KEY = 'bookeat_token';
const USER_KEY = 'bookeat_user';

const persistSession = (data) => {
  if (data?.access_token) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
  }

  if (data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const authApi = {
  async login(credentials) {
    const response = await axiosInstance.post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
    });

    persistSession(response);
    return response.user;
  },

  async register(data) {
    return axiosInstance.post('/auth/register', data);
  },

  async registerRestaurantOwner(data) {
    return axiosInstance.post('/auth/register-restaurant', data);
  },

  async getCurrentUser() {
    const response = await axiosInstance.get('/auth/profile');
    const user = response.user || response;

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return user;
  },

  async logout() {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      clearSession();
    }
  },

  /**
   * Lưu JWT token nhận từ Google OAuth callback,
   * sau đó fetch profile để có đầy đủ thông tin user.
   */
  async loginWithToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
    try {
      const user = await this.getCurrentUser();
      return user;
    } catch {
      clearSession();
      throw new Error('Không thể lấy thông tin người dùng');
    }
  },

  /**
   * Redirect trình duyệt sang Google để đăng nhập.
   * BE sẽ xử lý OAuth flow rồi callback về FE.
   */
  redirectToGoogle() {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    // Đổi /api/v1 => gốc BE rồi ghép path
    const backendBase = apiBase.startsWith('http')
      ? apiBase.replace(/\/api\/v1\/?$/, '')
      : window.location.origin;
    window.location.href = `${backendBase}/api/v1/auth/google`;
  },

  getStoredUser() {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      clearSession();
      return null;
    }
  },

  hasToken() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  /** Xác minh email bằng token từ URL */
  async verifyEmail(token) {
    return axiosInstance.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },

  /** Gửi lại email xác minh */
  async resendVerification(email) {
    return axiosInstance.post('/auth/resend-verification', { email });
  },

  /** Yêu cầu đặt lại mật khẩu — gửi email với link reset */
  async forgotPassword(email) {
    return axiosInstance.post('/auth/forgot-password', { email });
  },

  /** Đặt lại mật khẩu bằng token từ email */
  async resetPassword(token, password, confirmPassword) {
    return axiosInstance.post('/auth/reset-password', { token, password, confirmPassword });
  },

  clearSession,
};

