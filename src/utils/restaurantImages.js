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

export const getRestaurantGalleryImages = (restaurant) => {
  const r = restaurant || {};
  const explicitGallery = Array.isArray(r.galleryImages)
    ? uniqueUrls(r.galleryImages)
    : [];
  if (explicitGallery.length > 0) return explicitGallery;

  return Array.isArray(r.images) ? uniqueUrls(r.images) : [];
};

export const getRestaurantCoverImage = (restaurant) => {
  const r = restaurant || {};
  const galleryImages = getRestaurantGalleryImages(r);
  return getImageUrl(r.coverImage)
    || getImageUrl(r.coverImageUrl)
    || galleryImages[0]
    || getImageUrl(r.primaryImage)
    || getImageUrl(r.logo)
    || null;
};

export const getRestaurantLogoImage = (restaurant) => {
  const r = restaurant || {};
  return (
    getImageUrl(r.logo)
    || getImageUrl(r.primaryImage)
    || getRestaurantCoverImage(r)
  );
};

export const getRestaurantCardImage = (restaurant) => {
  const r = restaurant || {};
  return (
    getRestaurantCoverImage(r)
    || getRestaurantLogoImage(r)
  );
};
