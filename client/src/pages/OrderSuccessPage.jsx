import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const { data } = await API.get(`/orders/${id}`);
          if (data.success) {
            setOrder(data.order);
          }
        } catch (err) {
          console.warn('Order fetch error:', err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading order details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card border-0 rounded-4 shadow-sm mx-auto overflow-hidden" style={{ maxWidth: '720px' }}>
        
        {/* Success Header */}
        <div className="bg-success text-white p-4 text-center">
          <div
            className="rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-3 shadow"
            style={{ width: '70px', height: '70px', fontSize: '2.5rem' }}
          >
            <i className="bi bi-check-lg"></i>
          </div>
          <h3 className="fw-bold mb-1">Order Placed Successfully!</h3>
          <p className="mb-0 opacity-75 small">
            Thank you for shopping with ShopKart. We have received your order.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-light rounded-3">
            <div>
              <span className="small text-muted d-block">Order ID:</span>
              <strong className="text-dark fs-6">{order?._id}</strong>
            </div>
            <div>
              <span className="small text-muted d-block">Tracking Number:</span>
              <strong className="text-primary">{order?.trackingNumber || 'SKTRK-GENERATED'}</strong>
            </div>
            <div>
              <span className="small text-muted d-block">Payment Method:</span>
              <span className="badge bg-primary text-uppercase">{order?.paymentMethod}</span>
            </div>
          </div>

          {/* Delivery Address */}
          {order?.shippingAddress && (
            <div className="mb-4">
              <h6 className="fw-bold text-dark small text-uppercase">Delivery Address:</h6>
              <div className="p-3 border rounded-3 bg-white small">
                <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})<br />
                {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-4">
            <h6 className="fw-bold text-dark small text-uppercase mb-2">Purchased Items:</h6>
            <div className="d-flex flex-column gap-2">
              {order?.orderItems?.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '44px', height: '44px', objectFit: 'contain' }}
                      className="rounded border p-1"
                    />
                    <div>
                      <div className="fw-semibold small text-truncate" style={{ maxWidth: '320px' }}>
                        {item.name}
                      </div>
                      <div className="text-muted small">Qty: {item.quantity} × ₹{item.discountPrice?.toLocaleString()}</div>
                    </div>
                  </div>
                  <strong className="text-dark small">₹{item.subtotal?.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-4 fs-5 fw-bold text-dark">
            <span>Total Amount Paid</span>
            <span className="text-primary">₹{order?.totalPrice?.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Link to="/orders" className="btn btn-shopkart-primary px-4 fw-bold">
              <i className="bi bi-box-seam me-1"></i> Track Order Status
            </Link>
            <Link to="/" className="btn btn-outline-secondary px-4 fw-semibold">
              Continue Shopping
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
