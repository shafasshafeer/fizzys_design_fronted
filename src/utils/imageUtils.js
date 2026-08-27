const BACKEND_URL = 'https://fizzys-design-backend.onrender.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';

export const getImageUrl = (imagePath) => {
  console.log('🔍 getImageUrl called with:', imagePath);
  
  // Handle null/undefined
  if (!imagePath) {
    return FALLBACK_IMAGE;
  }
  
  // If it's already a full URL (Cloudinary or any HTTP/HTTPS)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a base64 data URL - use directly
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }
  
  // If it's a local path from backend
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // If it's just a filename
  if (!imagePath.includes('/')) {
    return `${BACKEND_URL}/uploads/${imagePath}`;
  }
  
  return FALLBACK_IMAGE;
};

export default getImageUrl;