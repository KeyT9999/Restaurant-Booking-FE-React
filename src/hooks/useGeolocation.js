import { useState, useEffect, useCallback } from 'react';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

// Reverse geocoding using multiple sources for better accuracy
const getAddressFromCoords = async (latitude, longitude) => {
  try {
    // Try Nominatim first - zoom 17 for street-level detail
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=17&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'vi,en',
          'User-Agent': 'BookEat App',
        },
      }
    );
    const data = await response.json();
    
    if (data.address) {
      const addr = data.address;
      
      // Build detailed address
      const parts = [];
      
      // House number and road
      if (addr.house_number) parts.push(addr.house_number);
      if (addr.road) parts.push(addr.road);
      
      // Neighborhood, suburb, quarter
      if (addr.neighbourhood) parts.push(addr.neighbourhood);
      else if (addr.suburb) parts.push(addr.suburb);
      else if (addr.quarter) parts.push(addr.quarter);
      else if (addr.residential) parts.push(addr.residential);
      
      // District
      if (addr.district) parts.push(addr.district);
      
      // City/Province
      if (addr.city || addr.county || addr.city_district) {
        parts.push(addr.city || addr.county || addr.city_district);
      }
      
      if (parts.length >= 2) {
        return parts.join(', ');
      }
      
      // Fallback to display_name if we can't build a good address
      if (data.display_name) {
        const components = data.display_name.split(',').slice(0, 3);
        return components.map(s => s.trim()).join(', ');
      }
    }
    
    return 'Vị trí của bạn';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Vị trí của bạn';
  }
};

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  const checkPermission = useCallback(async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch {
      return 'prompt';
    }
  }, []);

  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ định vị.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Bạn đã từ chối quyền truy cập vị trí.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Không thể xác định vị trí của bạn.'));
              break;
            case error.TIMEOUT:
              reject(new Error('Yêu cầu vị trí đã hết thời gian.'));
              break;
            default:
              reject(new Error('Đã xảy ra lỗi khi lấy vị trí.'));
          }
        },
        GEOLOCATION_OPTIONS
      );
    });
  }, []);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const permission = await checkPermission();
      setPermissionStatus(permission);

      if (permission === 'denied') {
        throw new Error('Quyền truy cập vị trí đã bị từ chối. Vui lòng bật định vị trong cài đặt trình duyệt.');
      }

      const position = await getCurrentPosition();
      setLocation(position);
      return position;
    } catch (err) {
      const errorMessage = err.message || 'Không thể lấy vị trí của bạn.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkPermission, getCurrentPosition]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  useEffect(() => {
    const initPermission = async () => {
      const status = await checkPermission();
      setPermissionStatus(status);
    };
    initPermission();
  }, [checkPermission]);

  // Reverse geocode when location changes
  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    getAddressFromCoords(location.latitude, location.longitude).then((address) => {
      if (!cancelled) {
        setLocation((prev) => ({ ...prev, address }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude]);

  return {
    location,
    error,
    loading,
    permissionStatus,
    requestLocation,
    clearLocation,
    hasLocation: !!location,
    canRequestLocation: permissionStatus !== 'denied',
  };
};

export default useGeolocation;
