import { useContext } from 'react';
import RestaurantContext from './RestaurantContext';

export function useRestaurantContext() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurantContext must be used within RestaurantProvider');
  }
  return context;
}
