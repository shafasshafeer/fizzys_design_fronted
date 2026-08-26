import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import './AddProduct.css';

const AddProduct = ({ fetchProducts }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    sizes: [],
    image: null,
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
  // Handle Main Image Upload
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
      setFormData({
        ...formData,
        image: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = { url: reader.result, file };
        setPreviewImages(prev => {
          const newPreviews = [preview, ...prev.filter((_, i) => i > 0)];
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // Handle Additional Images Upload
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
    const currentCount = previewImages.length - (formData.image ? 1 : 0);
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
          resolve({ url: reader.result, file });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then((previews) => {
      setPreviewImages(prev => {
        const mainImage = prev.length > 0 ? prev[0] : null;
        const additional = [...prev.slice(1), ...previews].slice(0, 3);
        return mainImage ? [mainImage, ...additional] : additional;
      });
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...filesToAdd].slice(0, 3)
      }));
    });
  };

  // ============================================
  // Remove Image
  // ============================================
  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setFormData(prev => ({ ...prev, image: null }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index - 1)
      }));
    }
  };

  // ============================================
  // Handle Submit - Sends to Cloudinary
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || formData.sizes.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!formData.image) {
      toast.error('Please upload a main image');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', String(formData.stock));
      formDataToSend.append('isNew', String(formData.isNew));
      formDataToSend.append('isBestseller', String(formData.isBestseller));
      
      // ✅ Send image files for Cloudinary upload
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((img) => {
          formDataToSend.append('images', img);
        });
      }

      const response = await axios.post('/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Product added successfully!');
        if (fetchProducts) fetchProducts();
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product">
      <div className="container">
        <h1>👗 Add New Product</h1>
        
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

          {/* Image Upload Section */}
          <div className="form-group image-upload-section">
            <label>Product Images</label>
            <p className="image-helper">Upload 1 main image + up to 3 additional images</p>
            
            <div className="image-upload-grid">
              {/* Main Image Upload */}
              <div className="image-upload-box main-image-box">
                {previewImages[0] ? (
                  <div className="image-preview">
                    <img src={previewImages[0].url} alt="Main" />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeImage(0)}
                    >
                      <FiX />
                    </button>
                    <span className="image-label">Main</span>
                  </div>
                ) : (
                  <label className="upload-label">
                    <FiImage />
                    <span>Main Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      required
                    />
                  </label>
                )}
              </div>

              {/* Additional Images Upload */}
              {[1, 2, 3].map((index) => (
                <div className="image-upload-box" key={index}>
                  {previewImages[index] ? (
                    <div className="image-preview">
                      <img src={previewImages[index].url} alt={`Additional ${index}`} />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <FiX />
                      </button>
                      <span className="image-label">#{index}</span>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <FiUpload />
                      <span>Add Image {index}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdditionalImagesUpload}
                        multiple={index === 1}
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

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;