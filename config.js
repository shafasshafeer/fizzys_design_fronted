// client/config.js
const API_URL = import.meta.env.VITE_API_URL || '';

export const config = {
  apiUrl: API_URL,
  endpoints: {
    products: `${API_URL}/api/products`,
    orders: `${API_URL}/api/orders`,
    admin: `${API_URL}/api/admin`,
    login: `${API_URL}/api/admin/login`,
    health: `${API_URL}/api/health`
  }
};

export default config;