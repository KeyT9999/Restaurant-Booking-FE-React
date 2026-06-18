const DEFAULT_DEV_SOCKET_URL = 'http://localhost:3001';

export const getSocketUrl = () => {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (explicitSocketUrl) return explicitSocketUrl.replace(/\/$/, '');

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  // Absolute URL → derive socket origin from it
  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    return apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  }

  // Relative path (e.g. "/api/v1") → use current origin (Vite proxy handles forwarding)
  if (apiBase && apiBase.startsWith('/')) {
    return window.location.origin;
  }

  if (import.meta.env.DEV) return DEFAULT_DEV_SOCKET_URL;

  return window.location.origin;
};
