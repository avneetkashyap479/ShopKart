import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const banners = [
  {
    id: 1,
    title: 'Flagship Smartphones Fest',
    subtitle: 'iPhone 15 Pro, Galaxy S24 Ultra & OnePlus 12',
    offer: 'Up to ₹15,000 Instant Bank Discount + No Cost EMI',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=mobiles-tablets',
    btnText: 'Shop Smartphones'
  },
  {
    id: 2,
    title: 'Top Electronics & Audio Carnival',
    subtitle: 'Sony XM5, Apple Watch Series 9 & Bose SoundLink',
    offer: 'Starting from ₹7,499 | ShopKart Assured Quality',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=electronics',
    btnText: 'Explore Tech'
  },
  {
    id: 3,
    title: 'Mega Fashion Brand Fest',
    subtitle: "Levi's, Nike Air Max, Fossil & Ray-Ban Aviators",
    offer: 'Min 40% - 70% Off on Top Global Brands',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=fashion',
    btnText: 'Upgrade Style'
  },
  {
    id: 4,
    title: 'Modern Kitchen & Home Tech',
    subtitle: 'Philips Air Fryers, Dyson Vacuums & Premium Linens',
    offer: 'Special Summer Deals + Free Fast Delivery',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=home-kitchen',
    btnText: 'Shop Home'
  }
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const banner = banners[currentIndex];

  return (
    <div className="position-relative overflow-hidden mb-4 shadow-sm" style={{ borderRadius: '8px' }}>
      <div className="hero-banner-item">
        <img src={banner.image} alt={banner.title} className="hero-banner-img" />
        <div className="hero-banner-overlay">
          <span className="badge bg-warning text-dark fw-bold mb-2 align-self-start px-2 py-1">
            SHOPKART EXCLUSIVE
          </span>
          <h2 className="display-6 fw-bold text-white mb-1">{banner.title}</h2>
          <p className="fs-6 text-light mb-1 d-none d-sm-block">{banner.subtitle}</p>
          <p className="fw-semibold text-warning mb-3 small">{banner.offer}</p>
          <div>
            <Link to={banner.link} className="btn btn-shopkart-buy btn-sm px-4 fw-bold shadow">
              {banner.btnText} <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next Controls */}
      <button
        type="button"
        className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle opacity-75 shadow-sm"
        style={{ width: '40px', height: '40px', padding: 0 }}
        onClick={handlePrev}
        aria-label="Previous Banner"
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <button
        type="button"
        className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle opacity-75 shadow-sm"
        style={{ width: '40px', height: '40px', padding: 0 }}
        onClick={handleNext}
        aria-label="Next Banner"
      >
        <i className="bi bi-chevron-right"></i>
      </button>

      {/* Dot Indicators */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`rounded-pill border-0 transition-all ${
              idx === currentIndex ? 'bg-white px-3' : 'bg-white-50 px-1'
            }`}
            style={{ height: '6px', opacity: idx === currentIndex ? 1 : 0.5, cursor: 'pointer' }}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
