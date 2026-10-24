import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cart, coupon, couponDiscount, netPayable, clearCart } = useCart();
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  // Address selection & form state
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const defaultAddr = user?.addresses?.find((a) => a.isDefault);
    return defaultAddr?._id || user?.addresses?.[0]?._id || null;
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    isDefault: true
  });

  // Payment method: 'MOCK_ONLINE' | 'COD' | 'RAZORPAY'
  const [paymentMethod, setPaymentMethod] = useState('MOCK_ONLINE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync addresses
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      if (!selectedAddressId) {
        const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setSelectedAddressId(def._id);
      }
    } else {
      setShowNewAddressForm(true);
    }
  }, [user, selectedAddressId]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine || !newAddress.pincode) {
      toast.warning('Please fill in all address fields');
      return;
    }

    try {
      const { data } = await API.post('/users/addresses', newAddress);
      if (data.success) {
        setAddresses(data.addresses);
        const added = data.addresses[data.addresses.length - 1];
        setSelectedAddressId(added._id);
        setShowNewAddressForm(false);
        toast.success('Address added successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    const activeAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!activeAddress) {
      toast.warning('Please select or add a delivery address');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      toast.warning('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare order payload
      const orderItems = cart.items.map((it) => ({
        product: it.product._id,
        quantity: it.quantity
      }));

      const orderPayload = {
        orderItems,
        shippingAddress: {
          fullName: activeAddress.fullName,
          phone: activeAddress.phone,
          addressLine: activeAddress.addressLine,
          city: activeAddress.city,
          state: activeAddress.state,
          pincode: activeAddress.pincode,
          addressType: activeAddress.addressType
        },
        paymentMethod,
        couponCode: coupon?.code || ''
      };

      // 2. Post order to backend (server-side total computation & inventory validation)
      const { data } = await API.post('/orders', orderPayload);

      if (data.success && data.order) {
        const order = data.order;

        // If online mock payment, verify
        if (paymentMethod === 'MOCK_ONLINE') {
          await API.post('/payments/verify', {
            razorpay_order_id: `order_mock_${order._id}`,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_signature_verified',
            orderId: order._id
          });
        }

        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order-success/${order._id}`, { state: { order } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order placement failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  return (
    <div className="container-fluid px-lg-5 py-4">
      <h4 className="fw-bold mb-4 text-dark">Checkout</h4>

      <div className="row g-4">
        
        {/* Left Column: Checkout Accordion Steps */}
        <div className="col-12 col-lg-8">
          
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-3 p-4 shadow-sm mb-3 border">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle px-2 py-1">1</span>
                <h5 className="fw-bold mb-0">Delivery Address</h5>
              </div>
              {!showNewAddressForm && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm fw-semibold"
                  onClick={() => setShowNewAddressForm(true)}
                >
                  <i className="bi bi-plus-lg me-1"></i> Add New Address
                </button>
              )}
            </div>

            {/* Existing addresses list */}
            {!showNewAddressForm ? (
              <div className="d-flex flex-column gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`p-3 border rounded-3 cursor-pointer transition-all ${
                      selectedAddressId === addr._id ? 'border-primary bg-light shadow-sm' : 'border-light'
                    }`}
                    onClick={() => setSelectedAddressId(addr._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="deliveryAddress"
                        id={`addr-${addr._id}`}
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                      <label className="form-check-label w-100" htmlFor={`addr-${addr._id}`}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-bold text-dark">{addr.fullName}</span>
                          <span className="badge bg-secondary small">{addr.addressType}</span>
                          <span className="fw-semibold text-dark small">{addr.phone}</span>
                        </div>
                        <div className="small text-muted">
                          {addr.addressLine}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Add New Address Form */
              <form onSubmit={handleAddNewAddress} className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Address Line</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="House / Flat No., Street, Landmark"
                    value={newAddress.addressLine}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-semibold">City</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-semibold">State</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-semibold">PIN Code</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold me-3">Address Type:</label>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="addrType"
                      id="typeHome"
                      checked={newAddress.addressType === 'Home'}
                      onChange={() => setNewAddress({ ...newAddress, addressType: 'Home' })}
                    />
                    <label className="form-check-label small" htmlFor="typeHome">Home</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="addrType"
                      id="typeWork"
                      checked={newAddress.addressType === 'Work'}
                      onChange={() => setNewAddress({ ...newAddress, addressType: 'Work' })}
                    />
                    <label className="form-check-label small" htmlFor="typeWork">Work</label>
                  </div>
                </div>

                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-shopkart-primary btn-sm px-4 fw-semibold">
                    Save and Deliver Here
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowNewAddressForm(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: Order Summary Preview */}
          <div className="bg-white rounded-3 p-4 shadow-sm mb-3 border">
            <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
              <span className="badge bg-primary rounded-circle px-2 py-1">2</span>
              <h5 className="fw-bold mb-0">Order Summary ({cart.totalItems} Items)</h5>
            </div>

            <div className="d-flex flex-column gap-2">
              {cart.items?.map((it) => (
                <div key={it.product._id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={it.product.images?.[0]}
                      alt={it.product.name}
                      style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                      className="rounded border p-1"
                    />
                    <div>
                      <div className="fw-semibold small text-dark text-truncate" style={{ maxWidth: '380px' }}>
                        {it.product.name}
                      </div>
                      <div className="text-muted small">Qty: {it.quantity}</div>
                    </div>
                  </div>
                  <div className="fw-bold text-dark">
                    ₹{(it.product.discountPrice * it.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Payment Options */}
          <div className="bg-white rounded-3 p-4 shadow-sm mb-3 border">
            <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
              <span className="badge bg-primary rounded-circle px-2 py-1">3</span>
              <h5 className="fw-bold mb-0">Payment Options</h5>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Option 1: ShopKart Instant Mock Payment */}
              <div
                className={`p-3 border rounded-3 cursor-pointer ${
                  paymentMethod === 'MOCK_ONLINE' ? 'border-primary bg-light' : 'border-light'
                }`}
                onClick={() => setPaymentMethod('MOCK_ONLINE')}
                style={{ cursor: 'pointer' }}
              >
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="paymentMode"
                    id="payMock"
                    checked={paymentMethod === 'MOCK_ONLINE'}
                    onChange={() => setPaymentMethod('MOCK_ONLINE')}
                  />
                  <label className="form-check-label w-100" htmlFor="payMock">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold text-dark">ShopKart Instant Online Payment (Test Mode)</span>
                      <span className="badge bg-success">Recommended</span>
                    </div>
                    <div className="small text-muted">
                      100% instant verification simulation. No external bank account required.
                    </div>
                  </label>
                </div>
              </div>

              {/* Option 2: Cash on Delivery (COD) */}
              <div
                className={`p-3 border rounded-3 cursor-pointer ${
                  paymentMethod === 'COD' ? 'border-primary bg-light' : 'border-light'
                }`}
                onClick={() => setPaymentMethod('COD')}
                style={{ cursor: 'pointer' }}
              >
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="paymentMode"
                    id="payCod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <label className="form-check-label w-100" htmlFor="payCod">
                    <div className="fw-bold text-dark">Cash on Delivery (COD)</div>
                    <div className="small text-muted">Pay with cash or UPI at the time of doorstep delivery.</div>
                  </label>
                </div>
              </div>
            </div>

            {/* Confirmation Button */}
            <div className="mt-4 pt-3 border-top d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-shopkart-buy px-5 py-2 fw-bold shadow"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing Order...' : `PAY ₹${netPayable?.toLocaleString()} & CONFIRM ORDER`}
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Price Details */}
        <div className="col-12 col-lg-4">
          <div className="cart-price-card">
            <h6 className="fw-bold text-muted text-uppercase small mb-3">PRICE DETAILS</h6>

            <div className="d-flex justify-content-between mb-2 small">
              <span>Price ({cart.totalItems} items)</span>
              <span>₹{cart.subtotal?.toLocaleString()}</span>
            </div>

            <div className="d-flex justify-content-between mb-2 small">
              <span>Discount</span>
              <span className="text-success">- ₹{cart.savings?.toLocaleString()}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="d-flex justify-content-between mb-2 small">
                <span>Coupon ({coupon?.code})</span>
                <span className="text-success">- ₹{couponDiscount?.toLocaleString()}</span>
              </div>
            )}

            <div className="d-flex justify-content-between mb-3 small">
              <span>Delivery Charges</span>
              <span className="text-success fw-bold">FREE</span>
            </div>

            <div className="d-flex justify-content-between border-top border-bottom py-3 mb-3 fw-bold fs-5 text-dark">
              <span>Total Payable</span>
              <span>₹{netPayable?.toLocaleString()}</span>
            </div>

            <div className="text-success fw-bold small">
              <i className="bi bi-tag-fill me-1"></i> You will save ₹{(cart.savings + couponDiscount)?.toLocaleString()} on this order
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
