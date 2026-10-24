import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter token & new password
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success(data.message);
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        setStep(2);
      }
    } catch (err) {
      toast.error('Could not process request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.post('/auth/reset-password', {
        token: resetToken,
        newPassword
      });
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card border-0 rounded-4 shadow-sm mx-auto p-4 p-md-5" style={{ maxWidth: '500px' }}>
        <h4 className="fw-bold text-dark mb-2">Reset Password</h4>
        <p className="text-muted small mb-4">
          {step === 1
            ? 'Enter your registered email address and we will generate instructions to reset your password.'
            : 'Enter the reset code and your new password to regain access.'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequestToken}>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-shopkart-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Send Reset Instructions'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Reset Token / Code</label>
              <input
                type="text"
                className="form-control"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-shopkart-buy w-100 py-2 fw-bold shadow"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Change Password'}
            </button>
          </form>
        )}

        <div className="text-center pt-3 mt-3 border-top">
          <Link to="/login" className="text-primary text-decoration-none small fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
