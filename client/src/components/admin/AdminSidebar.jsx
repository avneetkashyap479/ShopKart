import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar d-none d-md-flex flex-column flex-shrink-0">
      <div className="mb-4 px-2">
        <Link to="/" className="text-white text-decoration-none d-flex align-items-center gap-2">
          <span className="badge bg-primary p-2">
            <i className="bi bi-bag-check-fill fs-5"></i>
          </span>
          <div>
            <div className="fw-bold fs-6">ShopKart</div>
            <div className="small text-secondary" style={{ fontSize: '0.72rem' }}>ADMIN CONSOLE</div>
          </div>
        </Link>
      </div>

      <nav className="nav flex-column flex-grow-1">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-speedometer2"></i> Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-boxes"></i> Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-receipt"></i> Orders
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-people"></i> Users & Roles
        </NavLink>

        <NavLink
          to="/admin/coupons"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-ticket-perforated"></i> Coupons
        </NavLink>
      </nav>

      <div className="pt-3 border-top border-secondary px-2 mt-auto">
        <Link to="/" className="text-secondary small text-decoration-none d-flex align-items-center gap-2">
          <i className="bi bi-arrow-left"></i> Return to Store
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
