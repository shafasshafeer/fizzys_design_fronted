import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';
import './ProductDetails.css';

const ProductDetails = ({ products, addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const productList = Array.isArray(products) ? products : [];

  // ✅ Helper: Get stock for a specific size
  const getSizeStock = (product, size) => {
    if (product?.sizeStock && typeof product.sizeStock === 'object') {
      return product.sizeStock[size] || 0;
    }
    // Fallback to total stock
    return product?.stock || 0;
  };

  // ✅ Helper: Check if a size is in stock
  const isSizeInStock = (product, size) => {
    return getSizeStock(product, size) > 0;
  };

  // ✅ Helper: Get total available stock across all sizes
  const getTotalStock = (product) => {
    if (product?.sizeStock && typeof product.sizeStock === 'object') {
      let total = 0;
      for (const size in product.sizeStock) {
        total += product.sizeStock[size] || 0;
      }
      return total;
    }
    return product?.stock || 0;
  };

  useEffect(() => {
    const found = productList.find(p => p._id === id);
    if (found) {
      setProduct(found);
      const related = productList
        .filter(p => p._id !== id)
        .slice(0, 4);
      setRelatedProducts(related);
      setCurrentImageIndex(0);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, productList]);

  const getAllImages = () => {
    const images = [];
    if (product) {
      if (product.image) images.push(product.image);
      if (product.images && Array.isArray(product.images)) {
        images.push(...product.images);
      }
    }
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=700&fit=crop');
      images.push('https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=700&fit=crop');
      images.push('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=700&fit=crop');
    }
    return images;
  };

  const allImages = getAllImages();

  // ✅ Updated: Check stock for selected size
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    const sizeStock = getSizeStock(product, selectedSize);
    if (sizeStock <= 0) {
      toast.error(`${selectedSize} size is out of stock`);
      return;
    }
    
    if (quantity > sizeStock) {
      toast.error(`Only ${sizeStock} items available in ${selectedSize} size`);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    toast.success(`${product.name} (${selectedSize}) added to cart!`);
  };

  // ✅ Updated: Check stock for selected size
  const handleOrderNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    const sizeStock = getSizeStock(product, selectedSize);
    if (sizeStock <= 0) {
      toast.error(`${selectedSize} size is out of stock`);
      return;
    }
    
    if (quantity > sizeStock) {
      toast.error(`Only ${sizeStock} items available in ${selectedSize} size`);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    navigate('/cart');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const totalStock = product ? getTotalStock(product) : 0;
  const isInStock = totalStock > 0;
  
  // ✅ Get stock for selected size
  const selectedSizeStock = selectedSize ? getSizeStock(product, selectedSize) : 0;
  const isSelectedSizeInStock = selectedSize ? selectedSizeStock > 0 : false;

  const stockStatus = totalStock > 10 ? 'In Stock' : 
                       totalStock > 0 ? `Only ${totalStock} left` : 
                       'Out of Stock';
  const stockClass = totalStock > 10 ? 'in-stock' : 
                      totalStock > 0 ? 'low-stock' : 
                      'out-of-stock';

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="container">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-loading">
        <div className="container">
          <p>Product not found</p>
          <button onClick={() => navigate('/products')}>Back to Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </div>

        <div className="product-details-grid">
          <div className="product-image-section">
            <div className="main-image-wrapper">
              <div className="main-image" onClick={() => setIsImageModalOpen(true)}>
                <img 
                  src={getImageUrl(allImages[currentImageIndex])} 
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  width="600"
                  height="700"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=700&fit=crop';
                  }}
                />
                {product.isNew && <span className="badge new">NEW</span>}
                {product.isBestseller && <span className="badge bestseller">BESTSELLER</span>}
                
                <div className={`stock-badge ${stockClass}`}>
                  {stockStatus}
                </div>
                
                {allImages.length > 1 && (
                  <>
                    <button className="image-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                      <FiChevronLeft />
                    </button>
                    <button className="image-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                      <FiChevronRight />
                    </button>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="thumbnail-images">
                {allImages.map((img, index) => (
                  <img 
                    key={index}
                    src={getImageUrl(img)} 
                    alt={`${product.name} ${index + 1}`}
                    className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info-section">
            <h1 className="product-name">{product.name}</h1>
            <p className="product-price">₹{product.price?.toLocaleString() || product.price}</p>
            
            <div className={`stock-status ${stockClass}`}>
              <span className="stock-dot"></span>
              <span className="stock-text">{stockStatus}</span>
              {isInStock && <span className="stock-quantity">({totalStock} units available across all sizes)</span>}
            </div>
            
            <div className="product-rating">
              <span className="stars">★★★★★</span>
              <span className="rating-text">(24 reviews)</span>
            </div>

            <div className="product-description">
              <h4>Description</h4>
              <p>{product.description || 'This exquisite piece is crafted with premium quality fabric and impeccable stitching. Perfect for any occasion, this design reflects elegance and timeless beauty.'}</p>
            </div>

            {/* ✅ Updated: Size selection with stock info */}
            <div className="size-selection">
              <div className="size-header">
                <h4>Select Size</h4>
                <button className="size-guide-btn">Size Guide</button>
              </div>
              <div className="size-options">
                {product.sizes && product.sizes.map((size) => {
                  const sizeStock = getSizeStock(product, size);
                  const inStock = sizeStock > 0;
                  const isSelected = selectedSize === size;
                  
                  return (
                    <button
                      key={size}
                      className={`size-option ${isSelected ? 'active' : ''} ${!inStock ? 'out-of-stock' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      disabled={!inStock}
                      title={inStock ? `${sizeStock} available` : 'Out of stock'}
                    >
                      {size}
                      {inStock && sizeStock <= 3 && (
                        <span className="size-stock-low"> ({sizeStock} left)</span>
                      )}
                      {!inStock && (
                        <span className="size-stock-out"> 🔴</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedSize && (
                <div className="selected-size-stock">
                  <span className="stock-label">Available stock for {selectedSize}:</span>
                  <span className={`stock-value ${selectedSizeStock <= 3 ? 'low' : ''}`}>
                    {selectedSizeStock} units
                  </span>
                </div>
              )}
            </div>

            {/* ✅ Updated: Quantity with size-specific stock */}
            <div className="quantity-selection">
              <h4>Quantity</h4>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                  disabled={!isSelectedSizeInStock}
                >
                  -
                </button>
                <span className="qty-number">{quantity}</span>
                <button 
                  onClick={() => {
                    if (selectedSize && quantity < selectedSizeStock) {
                      setQuantity(quantity + 1);
                    } else if (!selectedSize) {
                      toast.error('Please select a size first');
                    } else {
                      toast.error(`Only ${selectedSizeStock} items available in ${selectedSize} size`);
                    }
                  }}
                  className="qty-btn"
                  disabled={!isSelectedSizeInStock || quantity >= selectedSizeStock}
                >
                  +
                </button>
              </div>
              {selectedSize && quantity > selectedSizeStock && (
                <p className="stock-warning">Only {selectedSizeStock} items available in {selectedSize}</p>
              )}
              {!selectedSize && (
                <p className="stock-warning">Please select a size to see available quantity</p>
              )}
            </div>

            <div className="action-buttons">
              <button 
                className={`add-to-cart-btn-details ${!isSelectedSizeInStock ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={!isSelectedSizeInStock}
              >
                <FiShoppingCart /> 
                {isSelectedSizeInStock ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>
              <button 
                className={`order-now-btn ${!isSelectedSizeInStock ? 'disabled' : ''}`}
                onClick={handleOrderNow}
                disabled={!isSelectedSizeInStock}
              >
                {isSelectedSizeInStock ? 'ORDER NOW' : 'NOT AVAILABLE'}
              </button>
            </div>

            <div className="product-meta">
              <button className="meta-btn"><FiHeart /> Wishlist</button>
              <button className="meta-btn"><FiShare2 /> Share</button>
            </div>

            <div className="delivery-info">
              <div className="delivery-item">
                <span>🚚</span>
                <div>
                  <strong>Free Shipping</strong>
                  <p>On orders above ₹999</p>
                </div>
              </div>
              <div className="delivery-item">
                <span>↩️</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>Hassle free returns within 7 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2 className="section-title">Related Products</h2>
            <div className="related-grid">
              {relatedProducts.map((related) => {
                const relatedTotalStock = getTotalStock(related);
                return (
                  <Link to={`/product/${related._id}`} key={related._id} className="related-card">
                    <div className="related-image">
                      <img 
                        src={getImageUrl(related.image)} 
                        alt={related.name}
                        loading="lazy"
                        decoding="async"
                        width="300"
                        height="400"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&h=400&fit=crop';
                        }}
                      />
                      {relatedTotalStock <= 0 && (
                        <span className="out-of-stock-badge">Out of Stock</span>
                      )}
                      {relatedTotalStock > 0 && relatedTotalStock <= 5 && (
                        <span className="low-stock-badge">Only {relatedTotalStock} left</span>
                      )}
                    </div>
                    <h4>{related.name}</h4>
                    <p>₹{related.price?.toLocaleString() || related.price}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isImageModalOpen && (
        <div className="image-modal-overlay" onClick={() => setIsImageModalOpen(false)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setIsImageModalOpen(false)}>
              <FiX />
            </button>
            <div className="image-modal-content">
              <img 
                src={getImageUrl(allImages[currentImageIndex])} 
                alt={product.name}
                loading="eager"
                decoding="async"
                width="800"
                height="900"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=700&fit=crop';
                }}
              />
              {allImages.length > 1 && (
                <>
                  <button className="image-modal-nav prev" onClick={prevImage}>
                    <FiChevronLeft />
                  </button>
                  <button className="image-modal-nav next" onClick={nextImage}>
                    <FiChevronRight />
                  </button>
                  <div className="image-modal-counter">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
            <div className="image-modal-thumbnails">
              {allImages.map((img, index) => (
                <img 
                  key={index}
                  src={getImageUrl(img)} 
                  alt={`Thumbnail ${index + 1}`}
                  className={currentImageIndex === index ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                  loading="lazy"
                  decoding="async"
                  width="80"
                  height="80"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;