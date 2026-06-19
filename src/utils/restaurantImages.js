export const getImageUrl = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'object') {
    return getImageUrl(value.url || value.secureUrl || value.imageUrl || value.coverImageUrl);
  }
  return null;
};

const uniqueUrls = (values = []) => {
  const seen = new Set();
  return values
    .map(getImageUrl)
    .filter(Boolean)
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
};

export const getRestaurantGalleryImages = (restaurant = {}) => {
  const explicitGallery = Array.isArray(restaurant.galleryImages)
    ? uniqueUrls(restaurant.galleryImages)
    : [];
  if (explicitGallery.length > 0) return explicitGallery;

  return Array.isArray(restaurant.images) ? uniqueUrls(restaurant.images) : [];
};

export const getRestaurantCoverImage = (restaurant = {}) => {
  const galleryImages = getRestaurantGalleryImages(restaurant);
  return getImageUrl(restaurant.coverImage)
    || getImageUrl(restaurant.coverImageUrl)
    || galleryImages[0]
    || getImageUrl(restaurant.primaryImage)
    || getImageUrl(restaurant.logo)
    || null;
};

export const getRestaurantLogoImage = (restaurant = {}) => (
  getImageUrl(restaurant.logo)
  || getImageUrl(restaurant.primaryImage)
  || getRestaurantCoverImage(restaurant)
);

export const getRestaurantCardImage = (restaurant = {}) => (
  getRestaurantCoverImage(restaurant)
  || getRestaurantLogoImage(restaurant)
);
