import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="d-flex flex-grow-1">
      <AdminSidebar />
      <div className="flex-grow-1 d-flex flex-column bg-light" style={{ minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
