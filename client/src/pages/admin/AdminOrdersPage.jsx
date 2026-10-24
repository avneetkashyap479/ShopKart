import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'react-toastify';

const statuses = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ limit: 50 });
      if (selectedStatus) query.set('status', selectedStatus);

      const { data } = await API.get(`/orders/admin/all?${query.toString()}`);
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Admin orders fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await API.put(`/orders/admin/${orderId}/status`, {
        status: newStatus,
        note: `Status updated by administrator to ${newStatus}`
      });

      if (data.success) {
        toast.success(`Order status changed to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success text-white';
      case 'Shipped':
      case 'Out for Delivery': return 'bg-primary text-white';
      case 'Processing': return 'bg-warning text-dark';
      case 'Cancelled': return 'bg-danger text-white';
      default: return 'bg-info text-dark';
    }
  };

  return (
    <>
      <AdminHeader title="Order Management" />

      <div className="p-4">
        {/* Filter Bar */}
        <div className="card border-0 rounded-3 shadow-sm p-3 mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Filter by Status:</span>
              <select
                className="form-select form-select-sm"
                style={{ width: '180px' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Orders</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <span className="badge bg-light text-dark border">Total Orders: {orders.length}</span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card border-0 rounded-3 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id}>
                      <td className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                        #{o._id}
                      </td>
                      <td>
                        <strong>{o.shippingAddress?.fullName || o.user?.name}</strong>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{o.user?.email}</div>
                      </td>
                      <td>{o.orderItems?.length} items</td>
                      <td className="fw-bold">₹{o.totalPrice?.toLocaleString()}</td>
                      <td>
                        <span className="badge bg-light text-dark border text-uppercase me-1">
                          {o.paymentMethod}
                        </span>
                        {o.isPaid ? (
                          <span className="badge bg-success">Paid</span>
                        ) : (
                          <span className="badge bg-secondary">Unpaid</span>
                        )}
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm fw-semibold ${getStatusBadge(o.orderStatus)}`}
                          style={{ width: '150px' }}
                          value={o.orderStatus}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st} className="bg-white text-dark">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm px-2 py-1"
                          onClick={() => setSelectedOrder(o)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Order Details – #{selectedOrder._id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-sm-6">
                    <h6 className="fw-bold small text-muted text-uppercase">Customer Information</h6>
                    <div className="small">
                      <strong>Name:</strong> {selectedOrder.user?.name}<br />
                      <strong>Email:</strong> {selectedOrder.user?.email}<br />
                      <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <h6 className="fw-bold small text-muted text-uppercase">Shipping Address</h6>
                    <div className="small">
                      {selectedOrder.shippingAddress?.addressLine},<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold small text-muted text-uppercase mb-2">Order Items Snapshot</h6>
                <div className="table-responsive border rounded-3 mb-3">
                  <table className="table table-sm align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems?.map((it, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img src={it.image} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} className="rounded border" />
                              <span className="text-truncate" style={{ maxWidth: '280px' }}>{it.name}</span>
                            </div>
                          </td>
                          <td>₹{it.discountPrice?.toLocaleString()}</td>
                          <td>{it.quantity}</td>
                          <td className="fw-bold">₹{it.subtotal?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                  <span className="fw-semibold small">Grand Total:</span>
                  <span className="fs-5 fw-bold text-primary">₹{selectedOrder.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AdminOrdersPage;
