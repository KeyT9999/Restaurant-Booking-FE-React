import { ChevronDown, Store } from 'lucide-react';
import { useState } from 'react';
import { useRestaurantContext } from '../../context/useRestaurantContext';

export default function RestaurantSwitcher() {
  const {
    restaurants,
    selectedRestaurant,
    selectedRestaurantId,
    setSelectedRestaurantId,
    loading,
  } = useRestaurantContext();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="restaurant-switcher loading">Đang tải nhà hàng...</div>;
  }

  if (restaurants.length === 0) {
    return <div className="restaurant-switcher empty">Chưa có nhà hàng</div>;
  }

  const current = selectedRestaurant || restaurants[0];

  return (
    <div className="restaurant-switcher">
      <button
        type="button"
        className="switcher-trigger"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="switcher-avatar">
          {current?.logo ? <img src={current.logo} alt={current.name} /> : <Store size={18} />}
        </span>
        <span className="switcher-copy">
          <span className="switcher-label">Đang quản lý</span>
          <span className="switcher-name">{current?.name || 'Chọn nhà hàng'}</span>
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="switcher-menu">
          {restaurants.map((restaurant) => (
            <button
              type="button"
              key={restaurant.id}
              className={`switcher-item ${restaurant.id === selectedRestaurantId ? 'active' : ''}`}
              onClick={() => {
                setSelectedRestaurantId(restaurant.id);
                setOpen(false);
              }}
            >
              <span className="switcher-avatar small">
                {restaurant.logo ? <img src={restaurant.logo} alt={restaurant.name} /> : <Store size={15} />}
              </span>
              <span>
                <strong>{restaurant.name}</strong>
                <small>{restaurant.approvalStatus || 'pending'}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
