import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'react-toastify';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users/all');
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.warn('Users fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await API.put(`/users/${userId}/status`);
      if (data.success) {
        toast.success(data.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: data.user.isActive } : u))
        );
      }
    } catch (err) {
      toast.error('Failed to change user status');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) return;

    try {
      const { data } = await API.put(`/users/${userId}/role`, { role: newRole });
      if (data.success) {
        toast.success(data.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  return (
    <>
      <AdminHeader title="User & Role Management" />

      <div className="p-4">
        <div className="card border-0 rounded-3 shadow-sm overflow-hidden">
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white">
            <h5 className="fw-bold mb-0">Registered Users ({users.length})</h5>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}
                          >
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <strong className="text-dark d-block">{u.name}</strong>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone || '–'}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className={`btn btn-sm ${u.isActive ? 'btn-outline-warning' : 'btn-outline-success'} px-2 py-1`}
                            onClick={() => handleToggleStatus(u._id)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm px-2 py-1"
                            onClick={() => handleToggleRole(u._id, u.role)}
                          >
                            Make {u.role === 'admin' ? 'Customer' : 'Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsersPage;
