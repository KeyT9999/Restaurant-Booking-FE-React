import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * ProtectedRoute — Bảo vệ route cần đăng nhập.
 *
 * - Nếu auth đang load: hiển thị loading spinner
 * - Nếu chưa đăng nhập: redirect về /auth/login?redirect=<currentPath>
 * - Nếu đã đăng nhập: render children
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'var(--color-faded-stone)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '2px solid rgba(216,203,184,0.15)',
              borderTopColor: 'var(--color-amber-glow)',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <span style={{ fontSize: '13px', letterSpacing: '-0.01em' }}>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
}
