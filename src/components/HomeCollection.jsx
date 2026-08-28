import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowRight, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';
import './HomeCollection.css';

const HomeCollection = ({ products, addToCart, loading }) => {
  const [selectedSize, setSelectedSize] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Products', icon: '✦' },
    { id: '2-Piece Cord Sets', label: '2-Piece Cord Sets', icon: '👗' },
    { id: '3-Piece Readymade Sets', label: '3-Piece Readymade Sets', icon: '👘' },
    { id: '3-Piece Unstitched Sets', label: '3-Piece Unstitched Sets', icon: '🧵' },
    { id: 'Short Kurtis', label: 'Short Kurtis', icon: '👚' },
    { id: 'Sarees', label: 'Sarees', icon: '💃' },
    { id: 'Nightwear', label: 'Nightwear', icon: '🌙' },
    { id: 'Bottom Wear', label: 'Bottom Wear', icon: '👖' },
    { id: 'Crop Tops', label: 'Crop Tops', icon: '👕' },
  ];

  const productList = Array.isArray(products) ? products : [];

  useEffect(() => {
    let filtered = [...productList];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, productList]);

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

  if (loading) {
    return (
      <section className="home-collection">
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

  return (
    <section className="home-collection">
      <div className="container">
        <div className="collection-header">
          <div className="header-left">
            <h2 className="section-title">OUR COLLECTION</h2>
            <span className="product-count">{filteredProducts.length} products</span>
          </div>
          <div className="header-actions">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FiList />
            </button>
            <button className="view-all-btn" onClick={handleViewAll}>
              View All <FiArrowRight />
            </button>
          </div>
        </div>

        <div className="category-filter">
          <div className="category-scroll">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found in this category</p>
            <button onClick={() => setSelectedCategory('all')} className="reset-btn">
              View All Products
            </button>
          </div>
        ) : (
          <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredProducts.map((product) => (
              <div className={`product-card ${viewMode === 'list' ? 'list-card' : ''}`} key={product._id}>
                <Link to={`/product/${product._id}`} className="product-link">
                  <div className="product-image">
                    {/* ✅ OPTIMIZED IMAGE */}
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="500"
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
                    {product.category && (
                      <span className="product-category-tag">{product.category}</span>
                    )}
                  </div>
                </Link>
                
                <div className="product-info">
                  <Link to={`/product/${product._id}`} className="product-link">
                    <h3 className="product-name">{product.name}</h3>
                  </Link>
                  <p className="product-price">₹{product.price?.toLocaleString() || product.price}</p>
                  
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
        )}

        {filteredProducts.length > 0 && (
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

export default HomeCollection;