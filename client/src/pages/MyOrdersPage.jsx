import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'react-toastify';

const orderSteps = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Orders fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter the reason for cancellation (e.g., Bought by mistake, Found cheaper):');
    if (!reason) return;

    try {
      setCancellingOrder(true);
      const { data } = await API.put(`/orders/${orderId}/cancel`, { reason });
      if (data.success) {
        toast.success('Order has been cancelled successfully');
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success text-white';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-primary text-white';
      case 'Processing':
        return 'bg-warning text-dark';
      case 'Cancelled':
        return 'bg-danger text-white';
      case 'Placed':
      default:
        return 'bg-info text-dark';
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-box-seam"
          title="You haven't placed any orders yet"
          description="Browse thousands of genuine products on ShopKart with fast delivery and great offers."
          actionText="Start Shopping"
          actionLink="/"
        />
      </div>
    );
  }

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">My Orders</h4>
          <span className="text-muted small">Track, cancel, or return items</span>
        </div>
        <span className="badge bg-light text-dark border p-2">Total Orders: {orders.length}</span>
      </div>

      <div className="d-flex flex-column gap-3">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-3 p-3 p-md-4 shadow-sm border">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom pb-3 mb-3">
              <div>
                <span className="small text-muted d-block">ORDER PLACED</span>
                <span className="fw-semibold text-dark small">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div>
                <span className="small text-muted d-block">TOTAL</span>
                <span className="fw-bold text-dark small">₹{order.totalPrice?.toLocaleString()}</span>
              </div>

              <div>
                <span className="small text-muted d-block">SHIP TO</span>
                <span className="fw-semibold text-dark small">{order.shippingAddress?.fullName}</span>
              </div>

              <div className="text-md-end">
                <span className="small text-muted d-block">ORDER # {order._id}</span>
                <span className={`badge ${getStatusBadgeClass(order.orderStatus)} text-uppercase`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-8">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 mb-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                      className="rounded border p-1"
                    />
                    <div>
                      <Link
                        to={`/products/${item.product}`}
                        className="text-dark fw-semibold text-decoration-none small d-block text-truncate"
                        style={{ maxWidth: '420px' }}
                      >
                        {item.name}
                      </Link>
                      <span className="text-muted small">Qty: {item.quantity} | ₹{item.discountPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="col-12 col-md-4 text-md-end d-flex flex-md-column gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm fw-semibold"
                  onClick={() => setSelectedOrder(order)}
                >
                  <i className="bi bi-geo-alt me-1"></i> Track Order
                </button>

                {['Placed', 'Processing'].includes(order.orderStatus) && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm fw-semibold"
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancellingOrder}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Tracking Modal */}
      {selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  Order Tracking – #{selectedOrder.trackingNumber || selectedOrder._id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 p-3 bg-light rounded-3">
                  <div>
                    <span className="small text-muted d-block">Current Status:</span>
                    <span className={`badge ${getStatusBadgeClass(selectedOrder.orderStatus)} fs-6`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <span className="small text-muted d-block">Payment Mode:</span>
                    <span className="fw-bold">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="small text-muted d-block">Paid Status:</span>
                    <span className={`badge ${selectedOrder.isPaid ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <h6 className="fw-bold text-dark mb-3">Shipment Progress:</h6>

                {selectedOrder.orderStatus === 'Cancelled' ? (
                  <div className="alert alert-danger">
                    <strong>Order Cancelled:</strong> {selectedOrder.cancellationReason || 'Cancelled upon request.'}
                  </div>
                ) : (
                  <div className="mb-4">
                    {orderSteps.map((step, idx) => {
                      const currentStepIndex = orderSteps.indexOf(selectedOrder.orderStatus);
                      const isCompleted = idx <= currentStepIndex;

                      return (
                        <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''}`}>
                          <div className="timeline-dot">
                            {isCompleted ? <i className="bi bi-check"></i> : idx + 1}
                          </div>
                          <div>
                            <div className="fw-bold small">{step}</div>
                            <div className="text-muted small">
                              {isCompleted ? 'Completed milestone' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status history log if available */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div className="border-top pt-3">
                    <h6 className="fw-bold small text-muted text-uppercase mb-2">Detailed Event Log</h6>
                    <div className="d-flex flex-column gap-2 small">
                      {selectedOrder.statusHistory.map((hist, i) => (
                        <div key={i} className="d-flex justify-content-between border-bottom pb-1 text-muted">
                          <span>
                            <strong>{hist.status}:</strong> {hist.note || 'Status updated'}
                          </span>
                          <span>{new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrdersPage;
