import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const parallaxBgRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      
      // Parallax background - moves slower
      if (parallaxBgRef.current && window.innerWidth > 768) {
        const speed = 0.3;
        const yPos = -(scrolled * speed);
        parallaxBgRef.current.style.transform = `translateY(${yPos}px)`;
      }
      
      // Parallax text - moves faster (opposite direction for depth)
      if (textRef.current && window.innerWidth > 768) {
        const speed = 0.15;
        const yPos = scrolled * speed;
        textRef.current.style.transform = `translateY(${yPos}px)`;
        textRef.current.style.opacity = Math.max(0, 1 - (scrolled / 600));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShopNow = () => {
    navigate('/products');
  };

  return (
    <section className="hero" id="hero-section">
      {/* Parallax Background with multiple layers */}
      <div className="hero-parallax-container">
        <div className="hero-parallax-layer layer-1" ref={parallaxBgRef}>
          <div className="parallax-gradient"></div>
        </div>
        <div className="hero-parallax-layer layer-2">
          <div className="parallax-circle circle-1"></div>
          <div className="parallax-circle circle-2"></div>
          <div className="parallax-circle circle-3"></div>
          <div className="parallax-circle circle-4"></div>
        </div>
      </div>
      
      <div className="hero-overlay"></div>
      
      <div className="container hero-content" ref={textRef}>
        {/* Hero Main Content */}
        <div className="hero-main">
          <div className="hero-badge-top">
            <span>✦ ELEGANCE REDEFINED ✦</span>
          </div>
          
          <h1 className="hero-title">
            <span className="hero-title-main">FIZZYS</span>
            <span className="hero-title-sub">DESIGNS</span>
          </h1>
          
          <p className="hero-description">
            Timeless designs for every <br />beautiful you.
          </p>
          
          <button className="hero-btn" onClick={handleShopNow}>
            SHOP NOW
            <span className="btn-arrow">→</span>
          </button>
        </div>

        {/* Features */}
        <div className="features">
          <div className="feature-item">
            <div className="feature-icon">✦</div>
            <h4>Premium Quality</h4>
            <p>Finest fabrics & impeccable stitching</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">❤️</div>
            <h4>Made with Love</h4>
            <p>Designed with passion, crafted for you</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">↩️</div>
            <h4>Easy Returns</h4>
            <p>Hassle free returns within 7 days</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚚</div>
            <h4>Secure Shipping</h4>
            <p>Safe & fast delivery at your doorstep</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line">
          <div className="scroll-dot"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;