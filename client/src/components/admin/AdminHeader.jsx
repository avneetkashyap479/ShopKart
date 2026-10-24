import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = ({ title = 'Dashboard Overview' }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <h4 className="fw-bold mb-0 text-dark">{title}</h4>
      </div>

      <div className="d-flex align-items-center gap-3">
        <Link to="/" className="btn btn-outline-primary btn-sm fw-semibold">
          <i className="bi bi-shop me-1"></i> View Live Store
        </Link>
        <div className="vr d-none d-sm-block"></div>
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="d-none d-sm-block text-start" style={{ lineHeight: '1.2' }}>
            <div className="fw-bold small">{user?.name}</div>
            <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
