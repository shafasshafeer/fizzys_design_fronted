import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import config from './config';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SizeGuide from './components/SizeGuide';
import HomeCollection from './components/HomeCollection';
import Footer from './components/Footer';
import AboutUs from './components/AboutUs';
import AdminPanel from './components/Admin/AdminPanel';
import AdminLogin from './components/Admin/AdminLogin';
import AddProduct from './components/Admin/AddProduct';
import EditProduct from './components/Admin/EditProduct';
import Cart from './components/Cart';
import ProductDetails from './components/ProductDetails';
import AllProducts from './components/AllProducts';
import './App.css';

// Set base URL for all axios requests
axios.defaults.baseURL = config.apiUrl;

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      let productData = [];
      if (response.data && response.data.products) {
        productData = response.data.products;
      } else if (Array.isArray(response.data)) {
        productData = response.data;
      }
      setProducts(productData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      setProducts([]);
    }
  };

  const addToCart = (product, size) => {
    const existing = cart.find(item => item._id === product._id && item.size === size);
    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        toast.error(`Only ${product.stock} items available`);
        return;
      }
      setCart(cart.map(item => 
        item._id === product._id && item.size === size 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, size, quantity: 1 }]);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            }
          }}
        />
        <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <SizeGuide />
              <HomeCollection 
                products={products} 
                addToCart={addToCart} 
                loading={loading}
              />
            </>
          } />
          
          <Route path="/about" element={<AboutUs />} />
          
          <Route path="/products" element={
            <AllProducts products={products} addToCart={addToCart} loading={loading} />
          } />
          
          <Route path="/product/:id" element={
            <ProductDetails products={products} addToCart={addToCart} />
          } />
          
          <Route path="/collections/new-arrivals" element={
            <AllProducts products={products} addToCart={addToCart} loading={loading} />
          } />
          <Route path="/collections/bestsellers" element={
            <AllProducts products={products} addToCart={addToCart} loading={loading} />
          } />
          
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin/add" element={
            <ProtectedRoute>
              <AddProduct fetchProducts={fetchProducts} />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit/:id" element={
            <ProtectedRoute>
              <EditProduct fetchProducts={fetchProducts} />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;