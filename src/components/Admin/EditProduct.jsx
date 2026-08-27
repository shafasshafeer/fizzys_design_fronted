import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiImage, FiSave, FiArrowLeft } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils';  // ✅ ADDED
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

  // Fetch Product Data
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
          
          // Set preview images
          const previews = [];
          if (product.image) {
            previews.push({ url: product.image, isMain: true, isExisting: true });
          }
          if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
              previews.push({ url: img, isMain: false, isExisting: true });
            });
          }
          setPreviewImages(previews);
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

  // ... rest of your code (handleChange, handleSizeToggle, etc.)

  // In the image preview section (inside return):
  return (
    <div className="edit-product">
      <div className="container">
        {/* ... header ... */}
        
        <form onSubmit={handleSubmit} className="product-form">
          {/* ... other form fields ... */}
          
          {/* Image Upload Section */}
          <div className="form-group image-upload-section">
            <label>Product Images</label>
            <div className="image-upload-grid">
              {[0, 1, 2, 3].map((index) => (
                <div className={`image-upload-box ${index === 0 ? 'main-image-box' : ''}`} key={index}>
                  {previewImages[index] ? (
                    <div className="image-preview">
                      {/* ✅ FIXED: Using getImageUrl */}
                      <img 
                        src={getImageUrl(previewImages[index].url)} 
                        alt={index === 0 ? 'Main' : `Additional ${index}`} 
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
          
          {/* ... rest of form ... */}
        </form>
      </div>
    </div>
  );
};

export default EditProduct;