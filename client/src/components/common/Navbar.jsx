import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import API from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Live auto-suggestions fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await API.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (data.success) {
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Autocomplete fetch error:', err.message);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search suggestions & user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  return (
    <nav className="shopkart-navbar py-2 px-3">
      <div className="container-fluid px-lg-4">
        <div className="row align-items-center g-2 g-md-3">
          
          {/* 1. Brand Logo */}
          <div className="col-auto">
            <Link to="/" className="brand-logo">
              <span className="brand-text">ShopKart</span>
              <span className="brand-subtext">
                Explore <span className="brand-plus">Plus ★</span>
              </span>
            </Link>
          </div>

          {/* 2. Search Bar with Live Suggestions */}
          <div className="col order-3 order-md-2" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="nav-search-container mx-auto">
              <i className="bi bi-search nav-search-icon"></i>
              <input
                type="text"
                id="shopkart-main-search"
                className="nav-search-input"
                placeholder="Search for Products, Brands and More"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-dropdown">
                  <div className="px-3 py-2 text-muted small border-bottom bg-light">
                    Suggested Products
                  </div>
                  {suggestions.map((item) => (
                    <div
                      key={item._id}
                      className="search-suggestion-item"
                      onClick={() => handleSelectSuggestion(item._id)}
                    >
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="search-suggestion-img"
                      />
                      <div className="flex-grow-1 text-truncate">
                        <div className="fw-semibold text-truncate small">{item.name}</div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-primary fw-bold small">₹{item.discountPrice?.toLocaleString()}</span>
                          <span className="badge bg-light text-secondary border small">{item.categoryName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    className="p-2 text-center text-primary small fw-semibold bg-white cursor-pointer border-top"
                    onClick={handleSearchSubmit}
                    style={{ cursor: 'pointer' }}
                  >
                    View all results for "{searchQuery}"
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* 3. Right Navigation Actions */}
          <div className="col-auto order-2 order-md-3 ms-auto">
            <div className="d-flex align-items-center gap-3">
              
              {/* Admin Panel Badge Button (if Admin) */}
              {isAdmin && (
                <Link to="/admin" className="btn btn-warning btn-sm fw-bold d-none d-lg-inline-flex align-items-center gap-1 shadow-sm">
                  <i className="bi bi-speedometer2"></i> Admin Panel
                </Link>
              )}

              {/* User Account / Login Button */}
              {isAuthenticated ? (
                <div className="position-relative" ref={dropdownRef}>
                  <button
                    className="btn btn-light btn-sm fw-semibold d-flex align-items-center gap-2 px-3 py-1 shadow-sm"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    id="user-menu-btn"
                  >
                    <i className="bi bi-person-circle fs-6 text-primary"></i>
                    <span className="d-none d-sm-inline">{user?.name?.split(' ')[0]}</span>
                    <i className={`bi bi-chevron-${userDropdownOpen ? 'up' : 'down'} small`}></i>
                  </button>

                  {userDropdownOpen && (
                    <div className="dropdown-menu dropdown-menu-end show position-absolute end-0 mt-2 shadow-lg border-0 rounded-3 py-2 animate-fade-in" style={{ minWidth: '220px', zIndex: 1100 }}>
                      <div className="px-3 py-2 border-bottom bg-light">
                        <div className="fw-bold text-dark text-truncate">{user?.name}</div>
                        <div className="small text-muted text-truncate">{user?.email}</div>
                        {isAdmin && <span className="badge bg-danger mt-1">Administrator</span>}
                      </div>

                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item py-2" onClick={() => setUserDropdownOpen(false)}>
                          <i className="bi bi-speedometer2 text-danger me-2"></i> Admin Dashboard
                        </Link>
                      )}
                      
                      <Link to="/profile" className="dropdown-item py-2" onClick={() => setUserDropdownOpen(false)}>
                        <i className="bi bi-person me-2 text-primary"></i> My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item py-2" onClick={() => setUserDropdownOpen(false)}>
                        <i className="bi bi-box-seam me-2 text-success"></i> My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item py-2" onClick={() => setUserDropdownOpen(false)}>
                        <i className="bi bi-heart me-2 text-danger"></i> Wishlist ({wishlist.length})
                      </Link>

                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item py-2 text-danger"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-light btn-sm fw-bold px-4 py-1 text-primary shadow-sm"
                  id="nav-login-btn"
                >
                  Login
                </Link>
              )}

              {/* Wishlist Link */}
              <Link to="/wishlist" className="text-white text-decoration-none position-relative d-flex align-items-center gap-1">
                <i className="bi bi-heart fs-5"></i>
                <span className="d-none d-lg-inline small fw-semibold">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Link with item count badge */}
              <Link
                to="/cart"
                className="text-white text-decoration-none position-relative d-flex align-items-center gap-1 ms-1"
                id="nav-cart-btn"
              >
                <i className="bi bi-cart3 fs-5"></i>
                <span className="d-none d-md-inline small fw-bold">Cart</span>
                {cart.totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark fw-bold" style={{ fontSize: '0.68rem' }}>
                    {cart.totalItems}
                  </span>
                )}
              </Link>

            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
