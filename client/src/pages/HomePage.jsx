import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import CategoryRibbon from '../components/common/CategoryRibbon';
import BannerCarousel from '../components/common/BannerCarousel';
import DealCountdown from '../components/common/DealCountdown';
import ProductCard from '../components/common/ProductCard';
import ProductGridSkeleton from '../components/common/LoadingSkeleton';
import { toast } from 'react-toastify';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [fashionProducts, setFashionProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, allRes, catRes] = await Promise.all([
          API.get('/products/featured'),
          API.get('/products?limit=12'),
          API.get('/categories')
        ]);

        if (featRes.data.success) {
          setFeaturedProducts(featRes.data.products || []);
        }

        if (allRes.data.success) {
          const prods = allRes.data.products || [];
          setDealProducts(prods.slice(0, 4));
          setFashionProducts(prods.filter((p) => p.categoryName === 'Fashion' || p.categoryName === 'Electronics').slice(0, 4));
        }

        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        console.warn('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();

    // Load recently viewed from localStorage
    try {
      const savedRecent = localStorage.getItem('shopkart_recent_products');
      if (savedRecent) {
        setRecentlyViewed(JSON.parse(savedRecent).slice(0, 4));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.warning('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to ShopKart Exclusive Offers!');
    setNewsletterEmail('');
  };

  return (
    <div className="pb-5">
      {/* 1. Category Navigation Ribbon */}
      <CategoryRibbon />

      <div className="container-fluid px-lg-4">
        {/* 2. Hero Promotional Carousel */}
        <BannerCarousel />

        {/* 3. Deal of the Day Section */}
        <div className="bg-white rounded-3 shadow-sm mb-4 p-3 p-md-4">
          <div className="deal-timer-card px-0 pt-0 mb-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Deals of the Day
              </h4>
              <p className="text-muted small mb-0">Handpicked discounted offers updated daily</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <DealCountdown />
              <Link to="/products" className="btn btn-shopkart-primary btn-sm px-3 fw-semibold d-none d-sm-inline">
                VIEW ALL
              </Link>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {dealProducts.map((product) => (
                <div key={product._id} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Trending & Featured Products */}
        <div className="bg-white rounded-3 shadow-sm mb-4 p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
            <div>
              <h4 className="fw-bold mb-1 text-dark">
                <i className="bi bi-fire text-danger me-1"></i> Trending Best Sellers
              </h4>
              <p className="text-muted small mb-0">Top rated products loved by thousands of shoppers</p>
            </div>
            <Link to="/products" className="btn btn-shopkart-primary btn-sm px-3 fw-semibold">
              VIEW ALL
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product._id} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Shop by Category Grid */}
        <div className="bg-white rounded-3 shadow-sm mb-4 p-3 p-md-4">
          <div className="mb-3 border-bottom pb-2">
            <h4 className="fw-bold mb-1 text-dark">
              <i className="bi bi-grid-fill text-primary me-1"></i> Shop by Category
            </h4>
            <p className="text-muted small mb-0">Explore our wide selection across all departments</p>
          </div>

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3 text-center">
            {categories.slice(0, 6).map((cat) => (
              <div key={cat._id} className="col">
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="text-decoration-none card h-100 border-0 shadow-sm p-3 hover-shadow transition-all bg-light"
                  style={{ borderRadius: '8px' }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="rounded mx-auto mb-2"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <span className="fw-bold text-dark small text-truncate">{cat.name}</span>
                  <span className="text-success small fw-semibold">Explore Now</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Recently Viewed Products (if any) */}
        {recentlyViewed.length > 0 && (
          <div className="bg-white rounded-3 shadow-sm mb-4 p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div>
                <h4 className="fw-bold mb-1 text-dark">
                  <i className="bi bi-clock-history text-secondary me-1"></i> Recently Viewed
                </h4>
                <p className="text-muted small mb-0">Pick up right where you left off</p>
              </div>
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {recentlyViewed.map((product) => (
                <div key={product._id} className="col">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Value Guarantees / Service Highlights */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <div className="bg-white rounded-3 p-3 shadow-sm d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-truck fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Free & Fast Delivery</h6>
                <small className="text-muted">On all orders above ₹500</small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="bg-white rounded-3 p-3 shadow-sm d-flex align-items-center gap-3">
              <div className="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-patch-check fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">100% Genuine Products</h6>
                <small className="text-muted">Direct from authorized brands</small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="bg-white rounded-3 p-3 shadow-sm d-flex align-items-center gap-3">
              <div className="bg-warning text-dark rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-arrow-repeat fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Easy 7 Days Return</h6>
                <small className="text-muted">Hassle-free refunds & pickup</small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="bg-white rounded-3 p-3 shadow-sm d-flex align-items-center gap-3">
              <div className="bg-danger text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-shield-lock fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Safe & Secure Payments</h6>
                <small className="text-muted">UPI, Cards & Cash on Delivery</small>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Newsletter Subscription Banner */}
        <div className="card border-0 rounded-3 text-white overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, #1e5ec2 0%, #2874f0 100%)' }}>
          <div className="card-body p-4 p-md-5 text-center">
            <h3 className="fw-bold mb-2">Get Deals & Discounts In Your Inbox</h3>
            <p className="text-light mb-4 mx-auto" style={{ maxWidth: '520px' }}>
              Subscribe to the ShopKart newsletter for exclusive coupons, flash sale notifications, and new product launches.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="d-flex justify-content-center gap-2 mx-auto" style={{ maxWidth: '480px' }}>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-warning fw-bold text-dark px-4 flex-shrink-0">
                Subscribe
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
