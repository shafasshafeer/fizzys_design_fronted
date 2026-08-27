import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiShoppingCart, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AllProducts.css';

const AllProducts = ({ products, addToCart, loading }) => {
  const { category } = useParams();
  const [selectedSize, setSelectedSize] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sizeFilter, setSizeFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const categoryOptions = [
    'All',
    '2-Piece Cord Sets',
    '3-Piece Readymade Sets',
    '3-Piece Unstitched Sets',
    'Short Kurtis',
    'Sarees',
    'Nightwear',
    'Bottom Wear',
    'Crop Tops',
    'ethnic',
    'western',
    'fusion',
    'festive'
  ];

  const productList = Array.isArray(products) ? products : [];

  useEffect(() => {
    let filtered = [...productList];

    if (category === 'new-arrivals') {
      filtered = filtered.filter(p => p.isNew);
    } else if (category === 'bestsellers') {
      filtered = filtered.filter(p => p.isBestseller);
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (sizeFilter) {
      filtered = filtered.filter(p => p.sizes && p.sizes.includes(sizeFilter));
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredProducts(filtered);
  }, [productList, category, categoryFilter, sizeFilter, sortBy]);

  const handleAddToCart = (product) => {
    const size = selectedSize[product._id];
    if (!size) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, size);
    toast.success(`${product.name} added to cart!`);
  };

  // ✅ DIRECT FALLBACK IMAGE
  const IMAGE_URL = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';

  if (loading) {
    return (
      <div className="all-products">
        <div className="container">
          <div className="loading-spinner">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-products">
      <div className="container">
        <div className="page-header">
          <h1>
            {category === 'new-arrivals' && '✨ New Arrivals'}
            {category === 'bestsellers' && '🔥 Bestsellers'}
            {!category && '🛍️ All Products'}
          </h1>
          <p className="product-count">{filteredProducts.length} products</p>
        </div>

        <div className="filter-bar">
          <div className="filter-left">
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Filters
            </button>
            <div className="view-toggle">
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
            </div>
          </div>

          <div className={`filters ${showFilters ? 'active' : ''}`}>
            <div className="filter-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category:</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Size:</label>
              <select value={sizeFilter || ''} onChange={(e) => setSizeFilter(e.target.value || null)}>
                <option value="">All Sizes</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="3XL">3XL</option>
                <option value="4XL">4XL</option>
              </select>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found matching your criteria.</p>
            <button 
              className="reset-btn"
              onClick={() => {
                setCategoryFilter('All');
                setSizeFilter(null);
                setSortBy('newest');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredProducts.map((product) => (
              <div className={`product-card ${viewMode === 'list' ? 'list-card' : ''}`} key={product._id}>
                <Link to={`/product/${product._id}`} className="product-link">
                  <div className="product-image">
                    <img 
                      src={IMAGE_URL} 
                      alt={product.name}
                    />
                    {product.isNew && <span className="product-badge new">NEW</span>}
                    {product.isBestseller && <span className="product-badge bestseller">BESTSELLER</span>}
                    {product.stock <= 0 && <span className="product-badge out-of-stock">OUT OF STOCK</span>}
                    {product.category && <span className="product-category-tag">{product.category}</span>}
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
      </div>
    </div>
  );
};

export default AllProducts;