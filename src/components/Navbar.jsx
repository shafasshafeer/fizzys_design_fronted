import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiMenu, FiX, FiUser, FiChevronDown } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const navigate = useNavigate();

  // Handle navigation with smooth scroll to sections
  const handleNavigation = (path, sectionId) => {
    setIsMenuOpen(false);
    setIsCollectionOpen(false);
    
    if (path) {
      navigate(path);
      // If we're navigating to home with a section, scroll after navigation
      if (path === '/' && sectionId) {
        setTimeout(() => {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else if (sectionId) {
      // Scroll to section on current page
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Scroll to footer function
  const scrollToFooter = () => {
    setIsMenuOpen(false);
    setIsCollectionOpen(false);
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const footerEl = document.getElementById('footer');
        if (footerEl) {
          footerEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <span>FREE SHIPPING on orders above 999</span>
          <div className="top-bar-right">
            <span>Made with love ❤️</span>
            <span className="separator">|</span>
            {/* <span>Track Order</span> */}
            <span className="separator">|</span>
            {/* <span>Help</span> */}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container navbar-content">
          {/* Left Side - Menu */}
          <div className="nav-left">
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <li>
                <Link to="/" onClick={() => handleNavigation('/', null)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={() => handleNavigation('/products', null)}>
                  Shop
                </Link>
              </li>
              
              {/* Collections Dropdown */}
              <li className="dropdown">
                <button 
                  className="dropdown-toggle"
                  onClick={() => setIsCollectionOpen(!isCollectionOpen)}
                >
                  Collections <FiChevronDown className={`dropdown-icon ${isCollectionOpen ? 'rotated' : ''}`} />
                </button>
                <ul className={`dropdown-menu ${isCollectionOpen ? 'active' : ''}`}>
                  <li>
                    <Link 
                      to="/collections/new-arrivals" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsCollectionOpen(false);
                      }}
                    >
                      New Arrivals
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/collections/bestsellers" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsCollectionOpen(false);
                      }}
                    >
                      Bestsellers
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsCollectionOpen(false);
                      }}
                    >
                      All Products
                    </Link>
                  </li>
                </ul>
              </li>
              
              <li>
                <Link to="/about" onClick={() => handleNavigation('/about', null)}>
                  About&nbsp;Us
                </Link>
              </li>
              <li>
                <button 
                  className="nav-link-btn"
                  onClick={scrollToFooter}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Center - Logo */}
          <div className="nav-center">
            <Link to="/" className="logo-wrapper" onClick={() => handleNavigation('/', null)}>
              <div className="logo-container">
                <span className="logo-text">FIZZYS DESIGNS</span>
                <div className="logo-tagline">
                  <span>ELEGANT</span>
                  <span className="tagline-dot">·</span>
                  <span>MODEST</span>
                  <span className="tagline-dot">·</span>
                  <span>TIMELESS</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Side - Icons */}
          <div className="nav-right">
            <Link to="/admin/login" className="nav-icon" title="Admin">
              <FiUser />
            </Link>
            <Link to="/cart" className="nav-icon cart-icon" title="Cart">
              <FiShoppingBag />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;