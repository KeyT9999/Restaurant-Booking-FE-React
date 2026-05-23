import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

/**
 * OwnerProtectedRoute — Bảo vệ route owner.
 * - Loading: spinner
 * - Chưa đăng nhập: redirect → /auth/login
 * - Đã đăng nhập nhưng không phải restaurant_owner: redirect → /
 * - Owner: render children
 */
export default function OwnerProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
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
          <span style={{ fontSize: '13px' }}>Đang tải...</span>
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

  if (user?.role !== 'restaurant_owner') {
    return <Navigate to="/" replace />;
  }

  return children;
}
