import { useEffect, useState } from 'react';
import ChatWorkspace from '../../components/chat/ChatWorkspace';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../api/adminApi';

export default function AdminChatPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [restaurantError, setRestaurantError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingRestaurants(true);
        setRestaurantError(null);
        const response = await adminApi.getRestaurants({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' });
        if (!ignore) {
          setRestaurants(response.data?.restaurants || []);
        }
      } catch (error) {
        if (!ignore) {
          setRestaurantError(error.message || 'Không thể tải danh sách nhà hàng');
        }
      } finally {
        if (!ignore) {
          setLoadingRestaurants(false);
        }
      }
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AdminLayout title="Quản lý Chat" subtitle="Quản lý hội thoại theo từng nhà hàng">
      {restaurantError && <div className="chat-error">{restaurantError}</div>}
      <ChatWorkspace
        mode="admin"
        adminRestaurants={restaurants}
        adminRestaurantsLoading={loadingRestaurants}
      />
    </AdminLayout>
  );
}
