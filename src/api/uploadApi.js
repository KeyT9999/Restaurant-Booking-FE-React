import axiosInstance from './axiosInstance';

/**
 * Upload ảnh lên Cloudinary
 * POST /api/v1/upload/image
 */
export const uploadImage = (formData) => {
  return axiosInstance.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
