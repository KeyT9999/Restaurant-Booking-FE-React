import axiosInstance from './axiosInstance';

/**
 * Upload ảnh lên Cloudinary
 * POST /api/v1/upload/image
 */
const normalizeUploadResponse = (response) => {
  const body = response?.data?.success !== undefined ? response.data : response;
  const uploadData = body?.data && typeof body.data === 'object' ? body.data : {};

  if (body?.success !== undefined && uploadData.url) {
    return {
      ...body,
      data: {
        ...uploadData,
        success: body.success,
        message: body.message,
        data: uploadData,
      },
    };
  }

  return body;
};

export const uploadImage = async (formData) => {
  const response = await axiosInstance.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return normalizeUploadResponse(response);
};
