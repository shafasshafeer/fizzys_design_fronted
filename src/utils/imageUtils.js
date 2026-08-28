// client/src/utils/imageUtils.js

const BACKEND_URL = 'https://fizzys-design-backend.onrender.com';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566174053879-1684a4d3b2f8?w=400&h=500&fit=crop';

export const getImageUrl = (imagePath) => {
  console.log('🔍 getImageUrl called with:', typeof imagePath, imagePath?.substring?.(0, 50));
  
  // Handle null/undefined
  if (!imagePath) {
    return FALLBACK_IMAGE;
  }
  
  // ✅ If it's a base64 data URL - return it directly
  if (typeof imagePath === 'string' && imagePath.startsWith('data:image')) {
    console.log('✅ Using base64 data URL directly');
    return imagePath;
  }
  
  // ✅ If it's a Cloudinary URL - add optimization parameters
  if (typeof imagePath === 'string' && imagePath.includes('cloudinary.com')) {
    // Check if it already has parameters
    if (imagePath.includes('?')) {
      return imagePath;
    }
    // Add optimization parameters for faster loading
    const optimizedUrl = `${imagePath}?w=400&h=500&c=limit&q=auto:low&f=auto`;
    console.log('✅ Optimized Cloudinary URL:', optimizedUrl);
    return optimizedUrl;
  }
  
  // If it's already a full URL (non-Cloudinary)
  if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  
  // If it's a local path from backend
  if (typeof imagePath === 'string' && imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // If it's just a filename
  if (typeof imagePath === 'string' && !imagePath.includes('/')) {
    return `${BACKEND_URL}/uploads/${imagePath}`;
  }
  
  return FALLBACK_IMAGE;
};

export default getImageUrl;