import axiosInstance from './axiosInstance';

const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_RECOMMENDATION_TIMEOUT_MS) || 8000;

const PRICE_RANGE_LABELS = Object.freeze({
  budget: 'Bình dân',
  moderate: 'Tầm trung',
  expensive: 'Cao cấp',
  luxury: 'Sang trọng',
  low: 'Bình dân',
  medium: 'Tầm trung',
  high: 'Cao cấp',
});

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const normalizeReasons = (reasons) => normalizeArray(reasons)
  .filter((reason) => typeof reason === 'string')
  .map((reason) => reason.trim())
  .filter(Boolean)
  .slice(0, 3);

const toPriceRangeLabel = (value, fallbackLabel = null) => {
  if (typeof fallbackLabel === 'string' && fallbackLabel.trim()) return fallbackLabel.trim();
  if (typeof value !== 'string') return null;
  return PRICE_RANGE_LABELS[value] || value;
};

const normalizeRestaurantRecommendation = (item = {}) => {
  const restaurantId = item.restaurantId || item.id || null;
  return {
    id: restaurantId,
    restaurantId,
    name: item.name || 'Nhà hàng BookEat',
    image: item.image || null,
    ratingAverage: Number(item.ratingAverage || 0) || 0,
    priceRange: toPriceRangeLabel(item.priceRange, item.priceRangeLabel),
    cuisineTypes: normalizeArray(item.cuisineTypes).filter(Boolean),
    reasons: normalizeReasons(item.reasons),
    featured: item.featured === true,
    voucherActive: item.voucherActive === true,
    detailUrl: restaurantId ? `/restaurants/${restaurantId}` : '/restaurants',
    bookingUrl: restaurantId ? `/restaurants/${restaurantId}/booking` : '/restaurants',
  };
};

const normalizeMenuItemRecommendation = (item = {}) => {
  const menuItemId = item.menuItemId || item.id || null;
  const restaurantId = item.restaurantId || null;
  return {
    id: menuItemId,
    menuItemId,
    restaurantId,
    name: item.name || 'Món ăn gợi ý',
    image: item.image || null,
    restaurantName: item.restaurantName || 'Nhà hàng BookEat',
    categoryName: item.categoryName || null,
    cuisineTypes: normalizeArray(item.cuisineTypes).filter(Boolean),
    tags: normalizeArray(item.tags).filter(Boolean),
    price: Number(item.price || 0) || 0,
    priceRange: toPriceRangeLabel(item.priceRange, item.priceRangeLabel),
    reasons: normalizeReasons(item.reasons),
    detailUrl: restaurantId ? `/restaurants/${restaurantId}` : '/restaurants',
    menuUrl: restaurantId ? `/restaurants/${restaurantId}#menu` : '/restaurants',
    bookingUrl: restaurantId ? `/restaurants/${restaurantId}/booking` : '/restaurants',
  };
};

const normalizeHomeRecommendationPayload = (response = {}) => {
  const payload = response?.data || {};

  return {
    success: response?.success !== false,
    algorithm: payload.algorithm || 'hybrid_v1',
    type: payload.type || 'home_recommendations',
    version: payload.version || 1,
    personalized: payload.personalized === true,
    fallbackUsed: payload.fallbackUsed === true,
    fallbackReason: payload.fallbackReason || null,
    generatedAt: payload.generatedAt || null,
    restaurantsForYou: normalizeArray(payload.restaurantsForYou).map(normalizeRestaurantRecommendation),
    menuItemsForYou: normalizeArray(payload.menuItemsForYou).map(normalizeMenuItemRecommendation),
    popularRestaurants: normalizeArray(payload.popularRestaurants).map(normalizeRestaurantRecommendation),
  };
};

const normalizeListRecommendationPayload = (response = {}, itemNormalizer) => {
  const payload = response?.data || {};

  return {
    success: response?.success !== false,
    algorithm: payload.algorithm || 'hybrid_v1',
    type: payload.type || null,
    version: payload.version || 1,
    personalized: payload.personalized === true,
    fallbackUsed: payload.fallbackUsed === true,
    fallbackReason: payload.fallbackReason || null,
    generatedAt: payload.generatedAt || null,
    items: normalizeArray(payload.items).map(itemNormalizer),
  };
};

const requestConfig = (params = {}) => ({
  params,
  timeout: REQUEST_TIMEOUT_MS,
});

export const getHomeRecommendations = async (params = {}) => {
  const response = await axiosInstance.get('/recommendations/home', requestConfig(params));
  return normalizeHomeRecommendationPayload(response);
};

export const getRestaurantRecommendations = async (params = {}) => {
  const response = await axiosInstance.get('/recommendations/restaurants', requestConfig(params));
  return normalizeListRecommendationPayload(response, normalizeRestaurantRecommendation);
};

export const getMenuItemRecommendations = async (params = {}) => {
  const response = await axiosInstance.get('/recommendations/menu-items', requestConfig(params));
  return normalizeListRecommendationPayload(response, normalizeMenuItemRecommendation);
};
