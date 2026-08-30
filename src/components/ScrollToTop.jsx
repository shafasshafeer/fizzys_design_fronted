import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // ✅ Scroll to top smoothly on every route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Smooth scrolling animation
    });
  }, [pathname]); // Runs every time the path changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;