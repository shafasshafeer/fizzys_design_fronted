import React, { useState } from 'react';
import { FiTrash2, FiPlus, FiMinus, FiCreditCard, FiUser, FiPhone, FiMapPin, FiMail, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import './Cart.css';

const Cart = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    notes: ''
  });

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const updateQuantity = (id, size, change) => {
    setCart(cart.map(item => {
      if (item._id === id && item.size === size) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        if (newQuantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock`);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id, size) => {
    setCart(cart.filter(item => !(item._id === id && item.size === size)));
    toast.success('Item removed from cart');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number (10 digits)');
      return false;
    }
    if (!formData.whatsapp.trim() || formData.whatsapp.length < 10) {
      toast.error('Please enter a valid WhatsApp number (10 digits)');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.address.street.trim()) {
      toast.error('Please enter your street address');
      return false;
    }
    if (!formData.address.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!formData.address.state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    if (!formData.address.pincode.trim() || formData.address.pincode.length < 6) {
      toast.error('Please enter a valid pincode (6 digits)');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    for (const item of cart) {
      if (item.stock <= 0) {
        toast.error(`${item.name} is out of stock`);
        return;
      }
      if (item.quantity > item.stock) {
        toast.error(`Only ${item.stock} ${item.name} available`);
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
          image: item.image
        })),
        total: total,
        subtotal: total,
        shippingCharge: 0,
        discount: 0,
        paymentMethod: 'upi',
        paymentStatus: 'pending',
        customer: {
          ...formData,
          whatsapp: formData.whatsapp
        },
        status: 'pending',
        notes: formData.notes || ''
      };

      const response = await axios.post('/api/orders', orderData);
      
      if (response.data.success) {
        setOrderId(response.data.order._id);
        setShowQR(true);
        toast.success('Order created! Please complete payment.');
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const submitOrder = async () => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        status: 'pending_verification',
        paymentStatus: 'pending',
        userConfirmedPayment: true,
        userConfirmedAt: new Date()
      });
      
      toast.success('✅ Order submitted successfully!');
      
      const whatsappNumber = formData.whatsapp;
      
      toast.success(
        `📱 Order confirmation will be sent to your WhatsApp: ${whatsappNumber}`,
        { duration: 8000 }
      );
      
      setCart([]);
      localStorage.removeItem('cart');
      
      setTimeout(() => {
        setStep(1);
        setShowQR(false);
        setOrderId(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          whatsapp: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          notes: ''
        });
        navigate('/');
      }, 4000);
      
    } catch (error) {
      toast.error('Failed to submit order. Please try again.');
    }
  };

  if (cart.length === 0 && step === 1) {
    return (
      <div className="cart-empty">
        <div className="container">
          <div className="cart-empty-content">
            <h2>🛒 Your Cart is Empty</h2>
            <p>Start shopping to add items to your cart</p>
            <button onClick={() => window.location.href = '/'}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3 && showQR) {
    return (
      <div className="cart-page payment-page">
        <div className="container">
          <div className="payment-container">
            <div className="payment-header">
              <h2>💳 Complete Your Payment</h2>
              <p>Scan the QR code below to pay with GPay / UPI</p>
            </div>

            <div className="payment-warning">
              <h4>📱 Order Confirmation on WhatsApp</h4>
              <ul>
                <li>✅ After payment, click <strong>"Submit Order"</strong></li>
                <li>📱 Order confirmation will be sent to your WhatsApp</li>
                <li>⏳ Our team will verify and confirm within 24 hours</li>
                <li>📞 For support: +919876543210</li>
              </ul>
            </div>

            <div className="payment-content">
              <div className="qr-section">
                <div className="qr-code">
                  <img 
                    src="/images/qr-code.png" 
                    alt="UPI QR Code"
                    loading="lazy"
                    decoding="async"
                    width="300"
                    height="300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=fizzysdesigns@upi&pn=Fizzys%20Designs&am=1000&cu=INR';
                    }}
                  />
                </div>
                
                <div className="payment-details">
                  <div className="payment-amount">
                    <span>Amount to Pay</span>
                    <h3>₹{total.toLocaleString()}</h3>
                  </div>
                  <div className="upi-details">
                    <p><strong>UPI ID:</strong> fizzysdesigns@upi</p>
                    <p><strong>Payee:</strong> Fizzys Designs</p>
                    <p><strong>Order ID:</strong> #{orderId?.slice(-8) || 'N/A'}</p>
                  </div>
                  
                  <button 
                    className="submit-order-btn"
                    onClick={submitOrder}
                  >
                    ✅ Submit Order
                  </button>
                  
                  <p className="payment-note">
                    📱 After clicking submit, order confirmation will be sent to your WhatsApp
                    <br />
                    <strong>{formData.whatsapp}</strong>
                  </p>
                </div>
              </div>

              <div className="payment-instructions">
                <h4>How to Order:</h4>
                <ol>
                  <li>Scan the QR code with GPay / PhonePe</li>
                  <li>Pay the exact amount: <strong>₹{total.toLocaleString()}</strong></li>
                  <li>Click <strong>"Submit Order"</strong> button</li>
                  <li>📱 Order confirmation will be sent to your WhatsApp</li>
                  <li>⏳ Our team will verify and confirm within 24 hours</li>
                </ol>
              </div>
            </div>

            <button 
              className="back-to-cart-btn"
              onClick={() => {
                if (window.confirm('Go back to cart? Your order will be cancelled.')) {
                  setStep(1);
                  setShowQR(false);
                }
              }}
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="cart-page checkout-page">
        <div className="container">
          <h2 className="cart-title">Checkout</h2>
          
          <div className="checkout-grid">
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <div className="checkout-items">
                {cart.map((item) => (
                  <div className="checkout-item" key={`${item._id}-${item.size}`}>
                    {/* ✅ OPTIMIZED CHECKOUT IMAGE */}
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      width="80"
                      height="100"
                    />
                    <div className="checkout-item-info">
                      <h4>{item.name}</h4>
                      <p>Size: {item.size} × {item.quantity}</p>
                      <span>₹{item.price?.toLocaleString()}</span>
                      {item.stock <= 5 && item.stock > 0 && (
                        <span className="stock-warning-small">⚠️ Only {item.stock} left</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="checkout-total">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="checkout-total-row total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="checkout-form">
              <h3>Delivery Details</h3>
              
              <div className="form-group">
                <label><FiUser /> Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label><FiPhone /> Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label><FiMessageCircle /> WhatsApp Number *</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Enter 10-digit WhatsApp number"
                  required
                />
                <small className="form-helper">📱 Order confirmation will be sent here</small>
              </div>

              <div className="form-group">
                <label><FiMail /> Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label><FiMapPin /> Street Address *</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="House number, street name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for delivery"
                  rows="2"
                />
              </div>

              <div className="checkout-actions">
                <button 
                  className="back-btn"
                  onClick={() => setStep(1)}
                >
                  ← Back to Cart
                </button>
                <button 
                  className="place-order-btn"
                  onClick={placeOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h2 className="cart-title">🛒 Shopping Cart</h2>
        
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={`${item._id}-${item.size}`}>
                {/* ✅ OPTIMIZED CART IMAGE */}
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="150"
                />
                
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-size">Size: {item.size}</p>
                  <p className="cart-item-price">₹{item.price?.toLocaleString() || item.price}</p>
                  {item.stock <= 5 && item.stock > 0 && (
                    <p className="stock-warning-small">⚠️ Only {item.stock} left in stock</p>
                  )}
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button 
                      onClick={() => updateQuantity(item._id, item.size, -1)}
                    >
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.size, 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item._id, item.size)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button 
              className="checkout-btn"
              onClick={() => setStep(2)}
              disabled={cart.length === 0}
            >
              <FiCreditCard /> Proceed to Checkout
            </button>
            <p className="payment-info">
              💳 Secure UPI / GPay payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;