import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(name, email, password, phone);
    setSubmitting(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="container py-5">
      <div className="card border-0 rounded-4 shadow-sm mx-auto overflow-hidden" style={{ maxWidth: '850px' }}>
        <div className="row g-0">
          
          {/* Left Split Banner */}
          <div
            className="col-12 col-md-5 text-white p-4 p-md-5 d-flex flex-column justify-content-between"
            style={{ background: 'linear-gradient(135deg, #1e5ec2 0%, #2874f0 100%)' }}
          >
            <div>
              <h2 className="fw-bold mb-3">Looks like you're new here!</h2>
              <p className="fs-6 opacity-75" style={{ lineHeight: '1.6' }}>
                Sign up with your details to get started with seamless online shopping on ShopKart.
              </p>
            </div>

            <div className="text-center py-4">
              <i className="bi bi-person-badge display-1 opacity-50"></i>
            </div>

            <div className="small opacity-75">
              ShopKart – Safe, Fast & Certified
            </div>
          </div>

          {/* Right Register Form */}
          <div className="col-12 col-md-7 p-4 p-md-5 bg-white">
            <h4 className="fw-bold text-dark mb-4">Create Account</h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                <label className="form-label small fw-semibold">Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter 10-digit Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Set Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
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
                {submitting ? 'Creating Account...' : 'CONTINUE'}
              </button>
            </form>

            <div className="text-center pt-3 border-top">
              <span className="text-muted small">Existing User? </span>
              <Link to="/login" className="text-primary fw-bold text-decoration-none small">
                Log In
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
