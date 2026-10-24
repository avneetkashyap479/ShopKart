import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      if (result.user.role === 'admin' && !location.state?.from) {
        navigate('/admin');
      } else {
        navigate(redirectPath, { replace: true });
      }
    }
  };

  const handleDemoClick = async (role) => {
    setSubmitting(true);
    const result = await demoLogin(role);
    setSubmitting(false);
    if (result.success) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectPath, { replace: true });
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="card border-0 rounded-4 shadow-sm mx-auto overflow-hidden" style={{ maxWidth: '850px' }}>
        <div className="row g-0">
          
          {/* Left Flipkart Blue Banner */}
          <div
            className="col-12 col-md-5 text-white p-4 p-md-5 d-flex flex-column justify-content-between"
            style={{ background: 'linear-gradient(135deg, #1e5ec2 0%, #2874f0 100%)' }}
          >
            <div>
              <h2 className="fw-bold mb-3">Login</h2>
              <p className="fs-6 opacity-75" style={{ lineHeight: '1.6' }}>
                Get access to your Orders, Wishlist, Saved Addresses, and Personalized Recommendations.
              </p>
            </div>

            <div className="text-center py-4">
              <i className="bi bi-shield-check display-1 opacity-50"></i>
            </div>

            <div className="small opacity-75">
              ShopKart – 100% Secure Shopping
            </div>
          </div>

          {/* Right Form Body */}
          <div className="col-12 col-md-7 p-4 p-md-5 bg-white">
            <h4 className="fw-bold text-dark mb-4">Welcome Back!</h4>

            {/* Quick Demo Autofill Buttons */}
            <div className="bg-light border rounded-3 p-3 mb-4">
              <span className="small text-muted fw-bold text-uppercase d-block mb-2">
                ⚡ 1-Click Demo Testing
              </span>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-warning btn-sm fw-bold text-dark"
                  onClick={() => handleDemoClick('admin')}
                  disabled={submitting}
                >
                  <i className="bi bi-shield-lock me-1"></i> Demo Admin
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm fw-semibold"
                  onClick={() => handleDemoClick('customer')}
                  disabled={submitting}
                >
                  <i className="bi bi-person me-1"></i> Demo Customer
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-semibold">Password</label>
                  <Link to="/forgot-password" className="text-primary small text-decoration-none fw-semibold">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-shopkart-buy w-100 py-2 fw-bold shadow mb-3"
                disabled={submitting}
              >
                {submitting ? 'Signing In...' : 'LOG IN'}
              </button>
            </form>

            <div className="text-center pt-3 border-top">
              <span className="text-muted small">New to ShopKart? </span>
              <Link to="/register" className="text-primary fw-bold text-decoration-none small">
                Create an account
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
