import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/admin/stats');
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.warn('Admin stats error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <AdminHeader title="Dashboard Overview" />

      <div className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="row g-3 mb-4">
              
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-card" style={{ borderLeftColor: '#388e3c' }}>
                  <div className="rounded-circle bg-success text-white p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-currency-rupee fs-4"></i>
                  </div>
                  <div>
                    <span className="small text-muted text-uppercase fw-semibold">Total Revenue</span>
                    <h4 className="fw-bold mb-0">₹{stats?.totalRevenue?.toLocaleString()}</h4>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-card" style={{ borderLeftColor: '#2874f0' }}>
                  <div className="rounded-circle bg-primary text-white p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-receipt fs-4"></i>
                  </div>
                  <div>
                    <span className="small text-muted text-uppercase fw-semibold">Total Orders</span>
                    <h4 className="fw-bold mb-0">{stats?.totalOrders}</h4>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-card" style={{ borderLeftColor: '#ff9f00' }}>
                  <div className="rounded-circle bg-warning text-dark p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-boxes fs-4"></i>
                  </div>
                  <div>
                    <span className="small text-muted text-uppercase fw-semibold">Products</span>
                    <h4 className="fw-bold mb-0">{stats?.totalProducts}</h4>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="admin-kpi-card" style={{ borderLeftColor: '#9333ea' }}>
                  <div className="rounded-circle text-white p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#9333ea' }}>
                    <i className="bi bi-people fs-4"></i>
                  </div>
                  <div>
                    <span className="small text-muted text-uppercase fw-semibold">Customers</span>
                    <h4 className="fw-bold mb-0">{stats?.totalCustomers}</h4>
                  </div>
                </div>
              </div>

            </div>

            <div className="row g-4">
              
              {/* Recent Orders Table */}
              <div className="col-12 col-lg-8">
                <div className="card border-0 rounded-3 shadow-sm p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <h5 className="fw-bold mb-0">Recent Orders</h5>
                    <Link to="/admin/orders" className="btn btn-outline-primary btn-sm fw-semibold">
                      View All Orders
                    </Link>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle small mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentOrders?.map((order) => (
                          <tr key={order._id}>
                            <td className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                              #{order._id}
                            </td>
                            <td>{order.shippingAddress?.fullName || order.user?.name}</td>
                            <td className="fw-bold">₹{order.totalPrice?.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${
                                order.orderStatus === 'Delivered' ? 'bg-success' :
                                order.orderStatus === 'Cancelled' ? 'bg-danger' : 'bg-primary'
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td>
                              <Link to="/admin/orders" className="btn btn-light btn-sm text-primary fw-semibold">
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {/* Low Stock Alerts & Category Distribution */}
              <div className="col-12 col-lg-4">
                
                {/* Low Stock Alert */}
                <div className="card border-0 rounded-3 shadow-sm p-4 mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <h6 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-triangle-fill"></i> Low Stock Alerts
                    </h6>
                    <span className="badge bg-danger rounded-pill">
                      {stats?.lowStockCount || 0}
                    </span>
                  </div>

                  {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {stats.lowStockProducts.map((p) => (
                        <div key={p._id} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                          <div className="text-truncate" style={{ maxWidth: '180px' }}>
                            <span className="fw-semibold small d-block text-truncate">{p.name}</span>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>{p.brand}</span>
                          </div>
                          <span className="badge bg-danger">Only {p.stock} left</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">All products sufficiently stocked.</div>
                  )}
                </div>

                {/* Categories Breakdown */}
                <div className="card border-0 rounded-3 shadow-sm p-4">
                  <h6 className="fw-bold mb-3 border-bottom pb-2">Products by Category</h6>
                  <div className="d-flex flex-column gap-2 small">
                    {stats?.categoryDistribution?.map((cat) => (
                      <div key={cat._id} className="d-flex justify-content-between align-items-center border-bottom pb-1">
                        <span>{cat._id}</span>
                        <span className="badge bg-light text-dark border">{cat.count} items</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboardPage;
