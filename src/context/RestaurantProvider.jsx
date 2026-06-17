import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyRestaurants } from '../api/restaurantApi';
import RestaurantContext from './RestaurantContext';

const STORAGE_KEY = 'bookeat_selected_restaurant_id';

export function RestaurantProvider({ children }) {
  const [, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantIdState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || null,
    [restaurants, selectedRestaurantId]
  );

  const syncRestaurantId = useCallback((restaurantId) => {
    const normalizedId = restaurantId || null;
    setSelectedRestaurantIdState(normalizedId);

    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (normalizedId) {
        localStorage.setItem(STORAGE_KEY, normalizedId);
        nextParams.set('restaurantId', normalizedId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        nextParams.delete('restaurantId');
      }
      return nextParams;
    }, { replace: true });
  }, [setSearchParams]);

  const refreshRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyRestaurants({ page: 1, limit: 100 });
      const list = response.data?.restaurants || [];
      setRestaurants(list);

      const queryId = new URLSearchParams(window.location.search).get('restaurantId');
      const savedId = localStorage.getItem(STORAGE_KEY);
      const validQueryId = list.some((restaurant) => restaurant.id === queryId) ? queryId : null;
      const validSavedId = list.some((restaurant) => restaurant.id === savedId) ? savedId : null;

      if (list.length === 1) {
        syncRestaurantId(list[0].id);
      } else if (validQueryId) {
        syncRestaurantId(validQueryId);
      } else if (validSavedId) {
        syncRestaurantId(validSavedId);
      } else if (list.length > 0) {
        syncRestaurantId(list[0].id);
      } else {
        syncRestaurantId(null);
      }
    } catch (err) {
      setError(err.message || 'Khong the tai danh sach nha hang');
    } finally {
      setLoading(false);
    }
  }, [syncRestaurantId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refreshRestaurants();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshRestaurants]);

  const value = useMemo(() => ({
    restaurants,
    selectedRestaurantId,
    selectedRestaurant,
    loading,
    error,
    isRestaurantReady: !loading && Boolean(selectedRestaurantId),
    setSelectedRestaurantId: syncRestaurantId,
    refreshRestaurants,
  }), [
    restaurants,
    selectedRestaurantId,
    selectedRestaurant,
    loading,
    error,
    syncRestaurantId,
    refreshRestaurants,
  ]);

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}
