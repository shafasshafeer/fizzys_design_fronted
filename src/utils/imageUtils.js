// client/src/utils/imageUtils.js

// ✅ HARDCODE the backend URL - this MUST be correct
const BACKEND_URL = 'https://fizzys-design-backend.onrender.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';

export const getImageUrl = (imagePath) => {
  console.log('🔍 getImageUrl called with:', imagePath);
  
  // If no image, return fallback
  if (!imagePath) {
    console.log('⚠️ No image path, using fallback');
    return FALLBACK_IMAGE;
  }
  
  // If it's already a full URL (http/https), use it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ Already full URL:', imagePath);
    return imagePath;
  }
  
  // ✅ FORCE: Always use backend URL with /uploads/
  // Remove any leading slashes or /uploads/ prefix
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.replace('/uploads/', '');
  }
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  // If it contains /uploads/ anywhere, remove it
  if (cleanPath.includes('/uploads/')) {
    cleanPath = cleanPath.replace('/uploads/', '');
  }
  
  const fullUrl = `${BACKEND_URL}/uploads/${cleanPath}`;
  console.log('✅ Generated URL:', fullUrl);
  return fullUrl;
};

export default getImageUrl;