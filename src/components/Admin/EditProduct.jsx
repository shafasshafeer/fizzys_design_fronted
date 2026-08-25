import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage, FiSave, FiArrowLeft } from 'react-icons/fi';
import './EditProduct.css';

const EditProduct = ({ fetchProducts }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
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
    'ethnic',
    'western', 
    'fusion', 
    'festive',
    '2-Piece Cord Sets',
    '3-Piece Readymade Sets',
    '3-Piece Unstitched Sets',
    'Short Kurtis',
    'Sarees',
    'Nightwear',
    'Bottom Wear',
    'Crop Tops'
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
          
          // Set existing images for display
          const existing = [];
          if (product.image) existing.push({ url: product.image, isMain: true });
          if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
              existing.push({ url: img, isMain: false });
            });
          }
          setExistingImages(existing);
          
          // Set preview images from existing
          setPreviewImages(existing.map(img => ({ url: img.url, isExisting: true })));
        }
        setLoading(false);
      } catch (error) {
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
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => {
          // Remove old main image if exists
          const filtered = prev.filter(p => !p.isMain);
          return [{ url: reader.result, file, isMain: true, isNew: true }, ...filtered];
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
          resolve({ url: reader.result, file, isMain: false, isNew: true });
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
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================
  // Handle Submit
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || formData.sizes.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('isNew', formData.isNew);
      formDataToSend.append('isBestseller', formData.isBestseller);
      
      // Handle images - only send new ones
      const newImages = previewImages.filter(p => p.isNew);
      newImages.forEach((img) => {
        if (img.file) {
          formDataToSend.append(img.isMain ? 'image' : 'images', img.file);
        }
      });

      const response = await axios.put(`/api/products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Product updated successfully!');
        if (fetchProducts) fetchProducts();
        navigate('/admin');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
      console.error('Error:', error);
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

          {/* ============================================
              IMAGE UPLOAD SECTION
          ============================================ */}
          <div className="form-group image-upload-section">
            <label>Product Images</label>
            <p className="image-helper">
              Main image + up to 3 additional images. Click on images to replace.
            </p>
            
            <div className="image-upload-grid">
              {[0, 1, 2, 3].map((index) => (
                <div className={`image-upload-box ${index === 0 ? 'main-image-box' : ''}`} key={index}>
                  {previewImages[index] ? (
                    <div className="image-preview">
                      <img src={previewImages[index].url} alt={index === 0 ? 'Main' : `Additional ${index}`} />
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

          {/* ============================================
              SIZES SELECTION
          ============================================ */}
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

          {/* ============================================
              STATUS CHECKBOXES
          ============================================ */}
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