import axiosInstance from './axiosInstance';

export const getPublicServices = (restaurantId, params = {}) =>
  axiosInstance.get(`/restaurants/${restaurantId}/services`, { params });

export const getOwnerServices = (restaurantId, params = {}) =>
  axiosInstance.get(`/owner/restaurants/${restaurantId}/services`, { params });

export const createRestaurantService = (restaurantId, data) =>
  axiosInstance.post(`/owner/restaurants/${restaurantId}/services`, data);

export const updateRestaurantService = (serviceId, data) =>
  axiosInstance.put(`/owner/services/${serviceId}`, data);

export const deleteRestaurantService = (serviceId) =>
  axiosInstance.delete(`/owner/services/${serviceId}`);

export const toggleRestaurantServiceAvailability = (serviceId, isAvailable) =>
  axiosInstance.patch(`/owner/services/${serviceId}/availability`, { isAvailable });
