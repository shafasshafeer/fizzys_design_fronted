import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiAward, FiUsers, FiStar, FiTrendingUp, FiShield } from 'react-icons/fi';
import './AboutUs.css';

const AboutUs = () => {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      
      parallaxElements.forEach((element, index) => {
        const speed = 0.3 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats data
  const stats = [
    { icon: <FiHeart />, number: '500+', label: 'Happy Customers' },
    { icon: <FiAward />, number: '50+', label: 'Design Awards' },
    { icon: <FiUsers />, number: '1000+', label: 'Orders Delivered' },
    { icon: <FiStar />, number: '4.9', label: 'Average Rating' }
  ];

  // Values data
  const values = [
    {
      icon: <FiHeart className="value-icon" />,
      title: 'Made with Love',
      description: 'Every piece is crafted with passion and attention to detail, ensuring you feel the love in every stitch.',
      color: '#e74c3c'
    },
    {
      icon: <FiShield className="value-icon" />,
      title: 'Premium Quality',
      description: 'We use only the finest fabrics and materials, ensuring our designs stand the test of time.',
      color: '#3498db'
    },
    {
      icon: <FiTrendingUp className="value-icon" />,
      title: 'Timeless Design',
      description: 'Our designs transcend trends, offering elegance that remains beautiful for generations.',
      color: '#2ecc71'
    },
    {
      icon: <FiStar className="value-icon" />,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We go above and beyond to make every experience memorable.',
      color: '#f39c12'
    }
  ];

  // Team members
  const team = [
    {
      name: 'Shafa Shafeer',
      role: 'Founder & Creative Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
    },
    {
      name: 'Fizza Shafeer',
      role: 'Lead Designer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop'
    },
    {
      name: 'Ahmed Shafeer',
      role: 'Operations Head',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop'
    }
  ];

  return (
    <div className="about-us" ref={parallaxRef}>
      
      {/* ============================================
          HERO SECTION WITH PARALLAX
      ============================================ */}
      <section className="about-hero">
        <div className="about-hero-bg parallax-element" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1920&h=600&fit=crop)' }}></div>
        <div className="about-hero-overlay"></div>
        <div className="container about-hero-content">
          <div className="about-hero-text parallax-element">
            <span className="about-hero-badge">✦ ABOUT US ✦</span>
            <h1 className="about-hero-title">Crafted with <span className="highlight">Love</span>, Designed for <span className="highlight">You</span></h1>
            <p className="about-hero-description">
              Fizzys Designs is more than just a fashion brand — it's a celebration of elegance, 
              modesty, and timeless beauty. Every piece tells a story of passion and craftsmanship.
            </p>
            <div className="about-hero-buttons">
              <Link to="/products" className="about-btn-primary">Explore Collection</Link>
              <Link to="/" className="about-btn-secondary">Learn More ↓</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          STATS SECTION
      ============================================ */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div className="stat-item" key={index}>
                <div className="stat-icon">{stat.icon}</div>
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          OUR STORY SECTION
      ============================================ */}
      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-image parallax-element">
              <img 
                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=500&fit=crop" 
                alt="Our Story"
              />
              <div className="story-image-badge">
                <span>Since 2020</span>
              </div>
            </div>
            <div className="story-content">
              <span className="story-tag">✦ Our Journey</span>
              <h2 className="story-title">A Story of <span className="highlight">Elegance</span> & <span className="highlight">Passion</span></h2>
              <p className="story-text">
                Fizzys Designs was born from a simple yet powerful vision — to create clothing that 
                empowers women to feel confident, elegant, and beautifully themselves. What started 
                as a small dream has blossomed into a beloved brand that celebrates modesty and style.
              </p>
              <p className="story-text">
                Our journey is driven by a commitment to quality, a love for design, and an unwavering 
                dedication to our customers. Every collection is a labor of love, blending traditional 
                craftsmanship with contemporary elegance.
              </p>
              <div className="story-features">
                <div className="story-feature">
                  <span>✦</span>
                  <div>
                    <h4>Premium Fabrics</h4>
                    <p>Handpicked materials for comfort and luxury</p>
                  </div>
                </div>
                <div className="story-feature">
                  <span>✦</span>
                  <div>
                    <h4>Ethical Craftsmanship</h4>
                    <p>Fair trade and sustainable practices</p>
                  </div>
                </div>
                <div className="story-feature">
                  <span>✦</span>
                  <div>
                    <h4>Timeless Design</h4>
                    <p>Styles that transcend seasons and trends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          OUR VALUES SECTION
      ============================================ */}
      <section className="about-values">
        <div className="container">
          <div className="values-header">
            <span className="values-tag">✦ What We Stand For</span>
            <h2 className="values-title">Our <span className="highlight">Core Values</span></h2>
            <p className="values-subtitle">
              These principles guide everything we do — from design to delivery.
            </p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div 
                className="value-card" 
                key={index}
                style={{ '--hover-color': value.color }}
              >
                <div className="value-icon-wrapper">
                  {value.icon}
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TEAM SECTION
      ============================================ */}
      {/* <section className="about-team">
        <div className="container">
          <div className="team-header">
            <span className="team-tag">✦ Meet Our Team</span>
            <h2 className="team-title">The <span className="highlight">Creative Minds</span> Behind Fizzys</h2>
            <p className="team-subtitle">
              Passionate individuals dedicated to bringing you the finest designs.
            </p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div className="team-card" key={index}>
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                  <div className="team-social">
                    <a href="#"><span>📷</span></a>
                    <a href="#"><span>🐦</span></a>
                    <a href="#"><span>💼</span></a>
                  </div>
                </div>
                <h4 className="team-name">{member.name}</h4>
                <p className="team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ============================================
          TESTIMONIALS SECTION
      ============================================ */}
      {/* <section className="about-testimonials">
        <div className="container">
          <div className="testimonials-header">
            <span className="testimonials-tag">✦ What Our Customers Say</span>
            <h2 className="testimonials-title">Love <span className="highlight">Stories</span></h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Fizzys Designs has completely transformed my wardrobe. The quality is exceptional, 
                and every piece makes me feel elegant and confident."
              </p>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop" alt="Sarah" />
                <div>
                  <h4>Sarah Ahmed</h4>
                  <span>Loyal Customer</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "The attention to detail and the beautiful designs are unmatched. I've never felt 
                more beautiful in any outfit. Thank you Fizzys!"
              </p>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop" alt="Priya" />
                <div>
                  <h4>Priya Sharma</h4>
                  <span>Happy Customer</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Finally a brand that understands modest fashion without compromising on style. 
                Every piece is a masterpiece!"
              </p>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=60&h=60&fit=crop" alt="Fatima" />
                <div>
                  <h4>Fatima Khan</h4>
                  <span>Fashion Enthusiast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* ============================================
          CTA SECTION
      ============================================ */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Experience <span className="highlight">Fizzys</span>?</h2>
            <p className="cta-text">
              Join thousands of happy customers who have discovered the joy of elegant, modest fashion.
            </p>
            <div className="cta-buttons">
              <Link to="/products" className="cta-btn-primary">Explore Collection</Link>
              <Link to="/" className="cta-btn-secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;