import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiTrash2, FiLogOut, FiShoppingBag, FiDollarSign, 
  FiPackage, FiEye, FiCheckCircle, FiTruck, FiClock, FiXCircle,
  FiUsers, FiCalendar, FiSearch, FiFilter, FiDownload,
  FiCreditCard, FiMapPin, FiPhone, FiMail, FiUser, FiMessageCircle,
  FiEdit
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalCustomers: 0
  });
  const [dtdcTracking, setDtdcTracking] = useState('');

  // ============================================
  // Fetch Data on Mount
  // ============================================
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchStats();
  }, []);

  // ============================================
  // Filter Orders
  // ============================================
  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(o => o.paymentStatus === paymentFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.customer?.name?.toLowerCase().includes(term) ||
        o.customer?.email?.toLowerCase().includes(term) ||
        o.customer?.phone?.includes(term) ||
        o.customer?.whatsapp?.includes(term) ||
        o.orderNumber?.toLowerCase().includes(term) ||
        o._id?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, paymentFilter, searchTerm]);

  // ============================================
  // Fetch Functions
  // ============================================
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
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setFilteredOrders(response.data.orders || []);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
        setFilteredOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ============================================
  // Delete Product
  // ============================================
  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // ============================================
  // Delete Order (Only for delivered/cancelled)
  // ============================================
  const deleteOrder = async (orderId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this order?\n\nThis action cannot be undone!')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order deleted successfully');
      fetchOrders();
      fetchStats();
      setShowOrderModal(false);
    } catch (error) {
      toast.error('Failed to delete order');
      console.error('Delete error:', error);
    }
  };

  // ============================================
  // Update Order Status
  // ============================================
  const updateOrderStatus = async (orderId, status, paymentStatus = null) => {
    try {
      const token = localStorage.getItem('adminToken');
      const updateData = { status };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      
      await axios.put(`/api/orders/${orderId}/status`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Order ${status.toUpperCase()} successfully!`);
      fetchOrders();
      fetchStats();
      setShowOrderModal(false);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // ============================================
  // Update DTDC Tracking
  // ============================================
  const updateTracking = async (orderId, trackingNumber) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/orders/${orderId}`, 
        { dtdcTrackingNumber: trackingNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Tracking number updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update tracking');
    }
  };

  // ============================================
  // Logout
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  // ============================================
  // Helper Functions
  // ============================================
  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getPaymentBadgeClass = (status) => {
    return `payment-badge payment-${status}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const pendingVerification = orders.filter(o => o.status === 'pending_verification').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const paid = orders.filter(o => o.paymentStatus === 'paid').length;
    const unpaid = orders.filter(o => o.paymentStatus === 'pending').length;

    return { total, pending, pendingVerification, confirmed, shipped, delivered, cancelled, paid, unpaid };
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  const orderStats = getOrderStats();

  return (
    <div className="admin-panel">
      <div className="container">

        {/* ============================================
            HEADER
        ============================================ */}
        <div className="admin-header">
          <div>
            <h1>🛍️ Admin Panel</h1>
            <p className="admin-subtitle">Manage your store, orders, and products</p>
          </div>
          <div className="admin-actions">
            <button 
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FiPackage /> Dashboard
            </button>
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FiShoppingBag /> Orders ({orderStats.pending + orderStats.pendingVerification})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <FiShoppingBag /> Products
            </button>
            <Link to="/admin/add" className="add-product-btn">
              <FiPlus /> Add Product
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* ============================================
            DASHBOARD TAB
        ============================================ */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple">
                  <FiPackage />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">
                  <FiShoppingBag />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">
                  <FiDollarSign />
                </div>
                <div className="stat-info">
                  <h3>₹{stats.totalRevenue?.toLocaleString() || 0}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange">
                  <FiClock />
                </div>
                <div className="stat-info">
                  <h3>{orderStats.pending + orderStats.pendingVerification}</h3>
                  <p>Pending Orders</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{orderStats.total}</span>
              </div>
              <div className="quick-stat pending">
                <span className="stat-label">🟡 Pending</span>
                <span className="stat-value">{orderStats.pending}</span>
              </div>
              <div className="quick-stat pending">
                <span className="stat-label">🟠 Verification</span>
                <span className="stat-value">{orderStats.pendingVerification}</span>
              </div>
              <div className="quick-stat confirmed">
                <span className="stat-label">🔵 Confirmed</span>
                <span className="stat-value">{orderStats.confirmed}</span>
              </div>
              <div className="quick-stat shipped">
                <span className="stat-label">🟢 Shipped</span>
                <span className="stat-value">{orderStats.shipped}</span>
              </div>
              <div className="quick-stat delivered">
                <span className="stat-label">✅ Delivered</span>
                <span className="stat-value">{orderStats.delivered}</span>
              </div>
              <div className="quick-stat cancelled">
                <span className="stat-label">❌ Cancelled</span>
                <span className="stat-value">{orderStats.cancelled}</span>
              </div>
              <div className="quick-stat paid">
                <span className="stat-label">💰 Paid</span>
                <span className="stat-value">{orderStats.paid}</span>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-table-wrapper">
              <h3 className="table-title">📋 Recent Orders</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order._id}>
                      <td>#{order.orderNumber || order._id.slice(-6)}</td>
                      <td>
                        <div>
                          <strong>{order.customer?.name || 'Guest'}</strong>
                          <br />
                          <small>{order.customer?.phone || ''}</small>
                        </div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td>₹{order.total?.toLocaleString() || 0}</td>
                      <td>
                        <span className={getPaymentBadgeClass(order.paymentStatus)}>
                          {order.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <button 
                          className="action-btn view"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ============================================
            ORDERS TAB
        ============================================ */}
        {activeTab === 'orders' && (
          <div className="admin-table-wrapper">
            <div className="orders-header">
              <h3 className="table-title">📦 All Orders</h3>
              <div className="orders-controls">
                <div className="search-box">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="refresh-btn" onClick={fetchOrders}>
                  🔄 Refresh
                </button>
              </div>
            </div>

            <div className="order-filters">
              <button 
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({orders.length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                🟡 Pending ({orders.filter(o => o.status === 'pending').length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'pending_verification' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending_verification')}
              >
                🟠 Verification ({orders.filter(o => o.status === 'pending_verification').length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('confirmed')}
              >
                🔵 Confirmed ({orders.filter(o => o.status === 'confirmed').length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'shipped' ? 'active' : ''}`}
                onClick={() => setStatusFilter('shipped')}
              >
                🟢 Shipped ({orders.filter(o => o.status === 'shipped').length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setStatusFilter('delivered')}
              >
                ✅ Delivered ({orders.filter(o => o.status === 'delivered').length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setStatusFilter('cancelled')}
              >
                ❌ Cancelled ({orders.filter(o => o.status === 'cancelled').length})
              </button>
              <select 
                className="payment-filter"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="paid">💰 Paid</option>
                <option value="pending">💳 Pending</option>
              </select>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer / WhatsApp</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">No orders found</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order.orderNumber || order._id.slice(-6)}</td>
                      <td>
                        <div>
                          <strong>{order.customer?.name || 'Guest'}</strong>
                          <br />
                          <small>📱 {order.customer?.whatsapp || order.customer?.phone || ''}</small>
                        </div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td>₹{order.total?.toLocaleString() || 0}</td>
                      <td>
                        <span className={getPaymentBadgeClass(order.paymentStatus)}>
                          {order.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <button 
                          className="action-btn view"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================
            PRODUCTS TAB
        ============================================ */}
        {activeTab === 'products' && (
          <div className="admin-table-wrapper">
            <div className="products-header">
              <h3 className="table-title">👗 All Products</h3>
              <Link to="/admin/add" className="add-product-small-btn">
                <FiPlus /> Add New
              </Link>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Sizes</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">No products found</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img src={product.image || 'https://via.placeholder.com/50x50'} alt={product.name} className="admin-product-img" />
                      </td>
                      <td><strong>{product.name}</strong></td>
                      <td>₹{product.price?.toLocaleString() || product.price}</td>
                      <td>{product.sizes?.join(', ') || 'N/A'}</td>
                      <td>
                        <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td>{product.category || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${product.isNew ? 'new' : ''} ${product.isBestseller ? 'bestseller' : ''}`}>
                          {product.isNew ? 'New' : product.isBestseller ? 'Bestseller' : 'Regular'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/admin/edit/${product._id}`} className="action-btn edit" title="Edit Product">
                            <FiEdit />
                          </Link>
                          <button className="action-btn delete" onClick={() => deleteProduct(product._id)} title="Delete Product">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================
          ORDER DETAILS MODAL
      ============================================ */}
      {showOrderModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>📋 Order Details</h2>
              <button className="close-modal" onClick={() => setShowOrderModal(false)}>×</button>
            </div>
            
            <div className="order-modal-body">
              {/* Order Info */}
              <div className="order-info-grid">
                <div className="order-info-item">
                  <label>Order #</label>
                  <p>#{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</p>
                </div>
                <div className="order-info-item">
                  <label>Date</label>
                  <p>{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="order-info-item">
                  <label>Status</label>
                  <span className={getStatusBadgeClass(selectedOrder.status)}>
                    {selectedOrder.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div className="order-info-item">
                  <label>Payment</label>
                  <span className={getPaymentBadgeClass(selectedOrder.paymentStatus)}>
                    {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div className="order-info-item">
                  <label>Total</label>
                  <p className="order-total">₹{selectedOrder.total?.toLocaleString() || 0}</p>
                </div>
                <div className="order-info-item">
                  <label>Payment Method</label>
                  <p>{selectedOrder.paymentMethod?.toUpperCase() || 'UPI'}</p>
                </div>
              </div>

              {/* Customer Details with WhatsApp */}
              <div className="order-customer-info">
                <h4><FiUser /> Customer Details</h4>
                <div className="customer-grid">
                  <div>
                    <label><FiUser /> Name</label>
                    <p>{selectedOrder.customer?.name || 'Guest'}</p>
                  </div>
                  <div>
                    <label><FiMail /> Email</label>
                    <p>{selectedOrder.customer?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label><FiPhone /> Phone</label>
                    <p>{selectedOrder.customer?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label><FiMessageCircle /> WhatsApp</label>
                    <p className="whatsapp-number">{selectedOrder.customer?.whatsapp || selectedOrder.customer?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label><FiMapPin /> Address</label>
                    <p>
                      {selectedOrder.customer?.address?.street || ''}
                      {selectedOrder.customer?.address?.city && `, ${selectedOrder.customer?.address?.city}`}
                      {selectedOrder.customer?.address?.state && `, ${selectedOrder.customer?.address?.state}`}
                      {selectedOrder.customer?.address?.pincode && ` - ${selectedOrder.customer?.address?.pincode}`}
                    </p>
                  </div>
                  {selectedOrder.transactionReference && (
                    <div>
                      <label>📋 Transaction Ref</label>
                      <p className="transaction-ref">{selectedOrder.transactionReference}</p>
                    </div>
                  )}
                </div>
                {selectedOrder.notes && (
                  <div className="order-notes">
                    <label>📝 Order Notes</label>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="order-items">
                <h4>🛒 Order Items</h4>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="order-item-product">
                            {item.image && <img src={item.image} alt={item.name} className="order-item-img" />}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.size}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="text-right"><strong>Subtotal</strong></td>
                      <td><strong>₹{selectedOrder.subtotal?.toLocaleString() || 0}</strong></td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="text-right"><strong>Shipping</strong></td>
                      <td><strong>₹{selectedOrder.shippingCharge || 0}</strong></td>
                    </tr>
                    <tr className="total-row">
                      <td colSpan="4" className="text-right"><strong>Total</strong></td>
                      <td><strong>₹{selectedOrder.total?.toLocaleString() || 0}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* DTDC Tracking */}
              <div className="dtdc-section">
                <h4>📦 DTDC Tracking</h4>
                <div className="dtdc-form">
                  <div className="form-group">
                    <label>Tracking Number</label>
                    <input
                      type="text"
                      value={selectedOrder.dtdcTrackingNumber || ''}
                      onChange={(e) => {
                        const updatedOrder = { ...selectedOrder, dtdcTrackingNumber: e.target.value };
                        setSelectedOrder(updatedOrder);
                        updateTracking(selectedOrder._id, e.target.value);
                      }}
                      placeholder="Enter DTDC tracking number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Courier</label>
                    <input
                      type="text"
                      value="DTDC"
                      disabled
                      className="dtdc-courier"
                    />
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="order-actions">
                <h4>📌 Update Status</h4>
                <div className="status-buttons">
                  <button 
                    className={`status-btn ${selectedOrder.status === 'pending' ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'pending')}
                    disabled={selectedOrder.status === 'pending'}
                  >
                    <FiClock /> Pending
                  </button>
                  <button 
                    className={`status-btn ${selectedOrder.status === 'pending_verification' ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'pending_verification')}
                    disabled={selectedOrder.status === 'pending_verification'}
                  >
                    <FiClock /> Verify
                  </button>
                  <button 
                    className={`status-btn ${selectedOrder.status === 'confirmed' ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'confirmed', 'paid')}
                    disabled={selectedOrder.status === 'confirmed' || selectedOrder.status === 'shipped' || selectedOrder.status === 'cancelled'}
                  >
                    <FiCheckCircle /> Confirm & Paid
                  </button>
                  <button 
                    className={`status-btn ${selectedOrder.status === 'shipped' ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'shipped')}
                    disabled={selectedOrder.status === 'shipped' || selectedOrder.status === 'cancelled'}
                  >
                    <FiTruck /> Shipped (DTDC)
                  </button>
                  <button 
                    className={`status-btn ${selectedOrder.status === 'delivered' ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}
                    disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                  >
                    <FiCheckCircle /> Delivered
                  </button>
                  <button 
                    className={`status-btn cancel ${selectedOrder.status === 'cancelled' ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(selectedOrder._id, 'cancelled')}
                    disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                  >
                    <FiXCircle /> Cancel
                  </button>
                </div>

                {/* Delete Order - Only for delivered or cancelled */}
                {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                  <div className="delete-section">
                    <button 
                      className="delete-order-btn"
                      onClick={() => deleteOrder(selectedOrder._id)}
                    >
                      <FiTrash2 /> Delete Order
                    </button>
                    <p className="delete-note">⚠️ This will permanently remove this order</p>
                  </div>
                )}
              </div>

              {/* Timeline - Only 3 statuses */}
              <div className="status-timeline">
                <h4>📅 Order Timeline</h4>
                <div className="timeline">
                  <div className={`timeline-item ${selectedOrder.createdAt ? 'completed' : ''}`}>
                    <span className="timeline-dot"></span>
                    <div>
                      <strong>📦 Order Placed</strong>
                      <p>{selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'N/A'}</p>
                    </div>
                  </div>
                  <div className={`timeline-item ${selectedOrder.status === 'confirmed' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'completed' : ''}`}>
                    <span className="timeline-dot"></span>
                    <div>
                      <strong>✅ Confirmed</strong>
                      <p>{selectedOrder.confirmedAt ? formatDate(selectedOrder.confirmedAt) : selectedOrder.status === 'confirmed' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? formatDate(selectedOrder.updatedAt) : 'Pending'}</p>
                    </div>
                  </div>
                  <div className={`timeline-item ${selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'completed' : ''}`}>
                    <span className="timeline-dot"></span>
                    <div>
                      <strong>🚚 Shipped via DTDC</strong>
                      <p>{selectedOrder.shippedAt ? formatDate(selectedOrder.shippedAt) : selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? formatDate(selectedOrder.updatedAt) : 'Pending'}</p>
                      {selectedOrder.dtdcTrackingNumber && (
                        <p className="tracking-info">📋 Tracking: {selectedOrder.dtdcTrackingNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;