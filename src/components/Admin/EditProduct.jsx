import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage, FiSave, FiArrowLeft } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils';
import './EditProduct.css';

const EditProduct = ({ fetchProducts }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    sizes: [],
    image: '',
    images: [],
    isNew: false,
    isBestseller: false,
    stock: 10,
    category: 'ethnic'
  });

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
  
  const categoryOptions = [
    'ethnic', 'western', 'fusion', 'festive',
    '2-Piece Cord Sets', '3-Piece Readymade Sets',
    '3-Piece Unstitched Sets', 'Short Kurtis', 'Sarees',
    'Nightwear', 'Bottom Wear', 'Crop Tops'
  ];

  // ============================================
  // Fetch Product Data
  // ============================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        if (response.data.success) {
          const product = response.data.product;
          setFormData({
            name: product.name || '',
            price: product.price || '',
            description: product.description || '',
            sizes: product.sizes || [],
            image: product.image || '',
            images: product.images || [],
            isNew: product.isNew || false,
            isBestseller: product.isBestseller || false,
            stock: product.stock || 10,
            category: product.category || 'ethnic'
          });
          
          // Set preview images - store URLs as-is, don't convert to base64
          const previews = [];
          if (product.image) {
            previews.push({ 
              url: product.image, 
              isMain: true, 
              isExisting: true,
              isNew: false,
              file: null
            });
          }
          if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
              previews.push({ 
                url: img, 
                isMain: false, 
                isExisting: true,
                isNew: false,
                file: null
              });
            });
          }
          setPreviewImages(previews);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/admin');
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  // ============================================
  // Handle Form Changes
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSizeToggle = (size) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.includes(size)
        ? formData.sizes.filter(s => s !== size)
        : [...formData.sizes, size]
    });
  };

  // ============================================
  // Handle New Main Image Upload
  // ============================================
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Read file for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => {
          // Remove existing main image
          const filtered = prev.filter(p => !p.isMain);
          // Add new main image with file reference
          return [{ 
            url: reader.result, 
            file: file,
            isMain: true, 
            isNew: true,
            isExisting: false
          }, ...filtered];
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // Handle New Additional Images Upload
  // ============================================
  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    const maxImages = 3;
    const currentCount = previewImages.filter(p => !p.isMain).length;
    const availableSlots = maxImages - currentCount;
    const filesToAdd = validFiles.slice(0, availableSlots);

    if (filesToAdd.length === 0) {
      toast.error('Maximum 3 additional images allowed');
      return;
    }

    const newPreviews = filesToAdd.map(file => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({ 
            url: reader.result, 
            file: file,
            isMain: false, 
            isNew: true,
            isExisting: false
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then((previews) => {
      setPreviewImages(prev => {
        const main = prev.find(p => p.isMain);
        const additional = [...prev.filter(p => !p.isMain), ...previews].slice(0, 3);
        return main ? [main, ...additional] : additional;
      });
    });
  };

  // ============================================
  // Remove Image
  // ============================================
  const removeImage = (index) => {
    setPreviewImages(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // If we removed the main image and there are others, make the first one main
      const hasMain = newPreviews.some(p => p.isMain);
      if (!hasMain && newPreviews.length > 0) {
        newPreviews[0].isMain = true;
      }
      return newPreviews;
    });
  };

  // ============================================
  // Handle Submit - Save Product
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || formData.sizes.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    // Check if we have at least one image (either existing or new)
    if (previewImages.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      
      // Basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', String(formData.stock));
      formDataToSend.append('isNew', String(formData.isNew));
      formDataToSend.append('isBestseller', String(formData.isBestseller));
      
      // Log what we're sending
      console.log('📤 Sending update for product:', id);
      console.log('📋 Form data:', {
        name: formData.name,
        price: formData.price,
        category: formData.category,
        sizes: formData.sizes
      });
      
      // Handle images - ONLY send NEW images that have actual files
      const newImages = previewImages.filter(p => p.isNew && p.file);
      console.log('📸 New images to upload:', newImages.length);
      
      // Main image
      const mainImage = newImages.find(p => p.isMain);
      if (mainImage && mainImage.file) {
        formDataToSend.append('image', mainImage.file);
        console.log('📸 Uploading new main image');
      }
      
      // Additional images
      const additionalImages = newImages.filter(p => !p.isMain);
      additionalImages.forEach((img) => {
        if (img.file) {
          formDataToSend.append('images', img.file);
          console.log('📸 Uploading additional image');
        }
      });

      // If there are existing images and no new ones, we keep them
      // The backend will keep the existing image URLs if no new files are uploaded
      const hasExistingMain = previewImages.some(p => p.isMain && p.isExisting);
      const hasExistingAdditional = previewImages.some(p => !p.isMain && p.isExisting);
      
      console.log('📸 Existing images:', {
        main: hasExistingMain,
        additional: hasExistingAdditional
      });

      const response = await axios.put(`/api/products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Product updated successfully! 🎉');
        if (fetchProducts) fetchProducts();
        navigate('/admin');
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      console.error('❌ Response data:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-product">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product">
      <div className="container">
        <div className="edit-header">
          <button className="back-btn" onClick={() => navigate('/admin')}>
            <FiArrowLeft /> Back
          </button>
          <h1>✏️ Edit Product</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          {/* Product Name */}
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Price and Stock */}
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="3"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload Section */}
          <div className="form-group image-upload-section">
            <label>Product Images</label>
            <p className="image-helper">Main image + up to 3 additional images</p>
            
            <div className="image-upload-grid">
              {[0, 1, 2, 3].map((index) => (
                <div className={`image-upload-box ${index === 0 ? 'main-image-box' : ''}`} key={index}>
                  {previewImages[index] ? (
                    <div className="image-preview">
                      <img 
                        src={getImageUrl(previewImages[index].url)} 
                        alt={index === 0 ? 'Main' : `Additional ${index}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop';
                        }}
                      />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <FiX />
                      </button>
                      <span className="image-label">{index === 0 ? 'Main' : `#${index}`}</span>
                      {previewImages[index].isNew && (
                        <span className="image-badge-new">New</span>
                      )}
                      {previewImages[index].isExisting && (
                        <span className="image-badge-existing">Saved</span>
                      )}
                    </div>
                  ) : (
                    <label className="upload-label">
                      {index === 0 ? <FiImage /> : <FiUpload />}
                      <span>{index === 0 ? 'Main Image' : `Add Image ${index}`}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={index === 0 ? handleMainImageUpload : handleAdditionalImagesUpload}
                        multiple={index > 0}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sizes Selection */}
          <div className="form-group">
            <label>Available Sizes *</label>
            <div className="size-checkboxes">
              {sizeOptions.map((size) => (
                <label key={size} className="size-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.sizes.includes(size)}
                    onChange={() => handleSizeToggle(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleChange}
              />
              ⭐ Mark as New Arrival
            </label>
            <label>
              <input
                type="checkbox"
                name="isBestseller"
                checked={formData.isBestseller}
                onChange={handleChange}
              />
              🔥 Mark as Bestseller
            </label>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;