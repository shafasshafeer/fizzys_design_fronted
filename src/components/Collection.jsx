import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Collection.css';

const Collection = ({ products, addToCart, loading, showViewAll = false }) => {
  const [selectedSize, setSelectedSize] = useState({});
  const navigate = useNavigate();

  // Ensure products is always an array
  const productList = Array.isArray(products) ? products : [];

  const handleAddToCart = (product) => {
    const size = selectedSize[product._id];
    if (!size) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, size);
    toast.success(`${product.name} added to cart!`);
  };

  const getBadge = (product) => {
    if (product.isNew) return 'NEW';
    if (product.isBestseller) return 'BESTSELLER';
    return null;
  };

  const handleViewAll = () => {
    navigate('/products');
  };

  // ============================================
  // Get image URL with fallback
  // ============================================
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';
    }
    // If it's already a full URL (Cloudinary, etc.)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // For local uploads
    if (imagePath.startsWith('/uploads')) {
      return imagePath;
    }
    return 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';
  };

  if (loading) {
    return (
      <section className="collection">
        <div className="container">
          <div className="collection-header">
            <h2 className="section-title">OUR COLLECTION</h2>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (productList.length === 0) {
    return (
      <section className="collection">
        <div className="container">
          <div className="collection-header">
            <h2 className="section-title">OUR COLLECTION</h2>
          </div>
          <div className="no-products">
            <p>No products available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="collection">
      <div className="container">
        <div className="collection-header">
          <div className="header-left">
            <h2 className="section-title">OUR COLLECTION</h2>
            {showViewAll && (
              <span className="product-count">{productList.length} products</span>
            )}
          </div>
          {showViewAll && (
            <button className="view-all-btn" onClick={handleViewAll}>
              View All Products <FiArrowRight />
            </button>
          )}
        </div>

        <div className="product-grid">
          {productList.map((product) => (
            <div className="product-card" key={product._id}>
              <Link to={`/product/${product._id}`} className="product-link">
                <div className="product-image">
                  <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';
                    }}
                  />
                  {getBadge(product) && (
                    <span className={`product-badge ${product.isNew ? 'new' : 'bestseller'}`}>
                      {getBadge(product)}
                    </span>
                  )}
                  {product.stock <= 0 && (
                    <span className="product-badge out-of-stock">OUT OF STOCK</span>
                  )}
                </div>
              </Link>
              
              <div className="product-info">
                <Link to={`/product/${product._id}`} className="product-link">
                  <h3 className="product-name">{product.name}</h3>
                </Link>
                <p className="product-price">₹{product.price?.toLocaleString() || product.price}</p>
                
                {/* ✅ SHOW ALL SIZES */}
                <div className="product-sizes">
                  {product.sizes && product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize[product._id] === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize({ ...selectedSize, [product._id]: size })}
                      disabled={product.stock <= 0}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <button 
                  className={`add-to-cart-btn ${product.stock <= 0 ? 'disabled' : ''}`}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                >
                  <FiShoppingCart /> {product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom View All Button */}
        {showViewAll && productList.length > 0 && (
          <div className="collection-bottom">
            <button className="view-all-bottom-btn" onClick={handleViewAll}>
              View All Products <FiArrowRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Collection;