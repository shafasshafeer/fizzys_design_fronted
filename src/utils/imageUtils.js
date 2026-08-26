// client/src/utils/imageUtils.js

const BACKEND_URL = 'https://fizzys-design-backend.onrender.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';

export const getImageUrl = (imagePath) => {
  // No image? Use fallback.
  if (!imagePath) {
    return FALLBACK_IMAGE;
  }

  // If it's already an absolute URL, use it as-is.
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ✅ KEY FIX: For any relative path (e.g., "product-xxx.png" or "/uploads/product-xxx.png"),
  // build the full URL to your backend.
  // This ensures ALL product images are loaded from your Render server.
  return `${BACKEND_URL}/uploads/${imagePath.replace(/^\/uploads\//, '')}`;
};

export default getImageUrl;