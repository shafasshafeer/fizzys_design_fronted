import React from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        {/* Newsletter */}
        <div className="newsletter">
          <h3>Join Our Community</h3>
          <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button>SUBSCRIBE</button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/products">Shop</a></li>
              <li><a href="/collections/new-arrivals">New Arrivals</a></li>
              <li><a href="/collections/bestsellers">Collections</a></li>
              <li><a href="/">About Us</a></li>
              <li><a href="#footer">Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="/">Track Order</a></li>
              <li><a href="/">Shipping Policy</a></li>
              <li><a href="/">Return & Refund</a></li>
              <li><a href="/">FAQs</a></li>
              <li><a href="/">Size Guide</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Information</h4>
            <ul>
              <li><a href="/">Privacy Policy</a></li>
              <li><a href="/">Terms & Conditions</a></li>
              <li><a href="/">Atelier (Customization)</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="contact-info">
              <li><FiPhone /> +919876543210</li>
              <li><FiMail /> fizzysdesigns@gmail.com</li>
              <li className="brand-tagline">Elegant · Modest · Timeless</li>
              <li className="small-business">Thank you for supporting our small business ❤️</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Fizzys Designs. All Rights Reserved.</p>
          <div className="footer-social">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;