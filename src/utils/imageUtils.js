// client/src/utils/imageUtils.js

const BACKEND_URL = 'https://fizzys-design-backend.onrender.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return FALLBACK_IMAGE;
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  if (!imagePath.includes('/')) {
    return `${BACKEND_URL}/uploads/${imagePath}`;
  }
  
  return FALLBACK_IMAGE;
};

export default getImageUrl;