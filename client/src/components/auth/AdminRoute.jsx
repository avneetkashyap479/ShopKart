import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger p-4 rounded-3 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-shield-lock-fill fs-1 text-danger mb-2 d-block"></i>
          <h4 className="fw-bold">Access Denied</h4>
          <p className="mb-0">You do not have administrative privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
