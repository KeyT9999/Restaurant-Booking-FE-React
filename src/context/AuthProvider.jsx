import { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import AuthContext from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getStoredUser());
  const [loading, setLoading] = useState(() => authApi.hasToken());

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      if (!authApi.hasToken()) {
        return;
      }

      try {
        const currentUser = await authApi.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        authApi.clearSession();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username, password) => {
    const loggedInUser = await authApi.login({ username, password });
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser || loggedInUser);
    return currentUser || loggedInUser;
  };

  /**
   * Được gọi từ GoogleCallback sau khi nhận token từ URL.
   * Lưu token, fetch profile, rồi cập nhật state.
   */
  const loginWithToken = async (token) => {
    const currentUser = await authApi.loginWithToken(token);
    setUser(currentUser);
    return currentUser;
  };

  /** Redirect trình duyệt đến Google OAuth (BE xử lý toàn bộ flow) */
  const loginWithGoogle = () => {
    authApi.redirectToGoogle();
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    loginWithToken,
    loginWithGoogle,
    logout,
    register: (data) => authApi.register(data),
    registerRestaurantOwner: (data) => authApi.registerRestaurantOwner(data),
    isAuthenticated: !loading && Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
