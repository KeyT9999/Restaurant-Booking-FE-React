import axiosInstance from './axiosInstance';

export const getLocationRecommendations = async (params) => {
  const { latitude, longitude, category, maxDistance, minimumRating, limit } = params;

  const queryParams = new URLSearchParams();
  
  queryParams.append('latitude', latitude.toString());
  queryParams.append('longitude', longitude.toString());
  
  if (category) {
    queryParams.append('category', category);
  }
  
  if (maxDistance) {
    queryParams.append('maxDistance', maxDistance.toString());
  }
  
  if (minimumRating !== undefined && minimumRating !== null) {
    queryParams.append('minimumRating', minimumRating.toString());
  }
  
  if (limit) {
    queryParams.append('limit', limit.toString());
  }

  return axiosInstance.get(`/nearby/recommend?${queryParams.toString()}`);
};
