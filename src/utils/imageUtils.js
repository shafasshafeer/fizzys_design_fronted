// client/src/utils/imageUtils.js

const BACKEND_URL = 'https://fizzys-design-backend.onrender.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';

export const getImageUrl = (imagePath) => {
  // If no image, return fallback
  if (!imagePath) {
    return FALLBACK_IMAGE;
  }
  
  // If it's already a full URL (http/https), use it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /uploads/, use full backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // If it's just a filename (no /), use full backend URL with /uploads/
  if (!imagePath.includes('/')) {
    return `${BACKEND_URL}/uploads/${imagePath}`;
  }
  
  // Fallback
  return FALLBACK_IMAGE;
};

export default getImageUrl;