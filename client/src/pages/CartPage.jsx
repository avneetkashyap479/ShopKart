import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, coupon, couponDiscount, netPayable, applyCoupon, removeCoupon } = useCart();
  const { toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      applyCoupon(couponCodeInput.trim());
      setCouponCodeInput('');
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-cart-x"
          title="Your Shopping Cart is Empty!"
          description="Explore our best deals, trending smartphones, electronics and fashion items to fill your cart."
          actionText="Shop Now"
          actionLink="/"
        />
      </div>
    );
  }

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="row g-4">
        
        {/* Left Column: Cart Items List */}
        <div className="col-12 col-lg-8">
          
          {/* Deliver To Banner */}
          {isAuthenticated && (
            <div className="bg-white rounded-3 p-3 shadow-sm mb-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted">Deliver to: </span>
                <span className="fw-bold small text-dark">
                  {defaultAddress ? `${defaultAddress.fullName}, ${defaultAddress.pincode}` : user.name}
                </span>
                {defaultAddress && (
                  <span className="badge bg-light text-secondary border ms-2 small">{defaultAddress.addressType}</span>
                )}
              </div>
              <Link to="/profile" className="btn btn-outline-primary btn-sm fw-semibold">
                Change Address
              </Link>
            </div>
          )}

          {/* Cart Items Card */}
          <div className="bg-white rounded-3 shadow-sm overflow-hidden mb-3">
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white">
              <h5 className="fw-bold mb-0">ShopKart Cart ({cart.totalItems} Items)</h5>
            </div>

            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div key={product._id} className="cart-item-row">
                  <div className="row g-3 align-items-center">
                    
                    {/* Image */}
                    <div className="col-3 col-sm-2 text-center">
                      <Link to={`/products/${product._id}`}>
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="img-fluid rounded"
                          style={{ maxHeight: '100px', objectFit: 'contain' }}
                        />
                      </Link>

                      {/* Quantity Selector below image on mobile */}
                      <div className="qty-counter justify-content-center mt-2">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="fw-bold small px-1">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="col-9 col-sm-10">
                      <div className="d-flex flex-column flex-sm-row justify-content-between">
                        <div>
                          <Link
                            to={`/products/${product._id}`}
                            className="text-dark text-decoration-none fw-semibold d-block mb-1 text-truncate"
                            style={{ maxWidth: '450px' }}
                          >
                            {product.name}
                          </Link>
                          <span className="small text-muted d-block mb-2">Brand: {product.brand}</span>

                          {/* Price */}
                          <div className="d-flex align-items-baseline gap-2 mb-3">
                            <span className="fs-5 fw-bold text-dark">
                              ₹{(product.discountPrice * item.quantity).toLocaleString()}
                            </span>
                            {product.price > product.discountPrice && (
                              <>
                                <span className="price-original small">
                                  ₹{(product.price * item.quantity).toLocaleString()}
                                </span>
                                <span className="price-discount small">
                                  {product.discountPercentage || Math.round(((product.price - product.discountPrice)/product.price)*100)}% Off
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Delivery Time Estimate */}
                        <div className="text-sm-end small text-muted">
                          <div>Delivery by <strong>Tomorrow</strong></div>
                          <span className="text-success fw-semibold">Free Delivery</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="d-flex gap-4 pt-2 border-top">
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none p-0 text-muted small fw-bold"
                          onClick={() => {
                            toggleWishlist(product._id);
                            removeFromCart(product._id);
                          }}
                        >
                          <i className="bi bi-heart me-1"></i> SAVE FOR LATER
                        </button>

                        <button
                          type="button"
                          className="btn btn-link text-decoration-none p-0 text-danger small fw-bold"
                          onClick={() => removeFromCart(product._id)}
                        >
                          <i className="bi bi-trash me-1"></i> REMOVE
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}

            {/* Place Order Footer */}
            <div className="p-3 bg-white border-top d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-shopkart-buy px-5 py-2 fw-bold shadow"
                onClick={handleProceedToCheckout}
              >
                PLACE ORDER
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Price Details & Coupon */}
        <div className="col-12 col-lg-4">
          <div className="cart-price-card">
            
            {/* Coupon Code Input */}
            <div className="mb-4">
              <label className="fw-bold small text-muted text-uppercase mb-2 d-block">
                Coupons & Offers
              </label>
              {coupon ? (
                <div className="alert alert-success d-flex align-items-center justify-content-between p-2 mb-0">
                  <div>
                    <span className="badge bg-success me-1">{coupon.code}</span>
                    <span className="small fw-semibold">Saved ₹{couponDiscount}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-danger p-0 text-decoration-none small fw-bold"
                    onClick={removeCoupon}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm text-uppercase"
                    placeholder="Enter Coupon (e.g. FIRST50)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline-primary btn-sm fw-bold px-3">
                    APPLY
                  </button>
                </form>
              )}
            </div>

            <div className="border-top pt-3">
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
                  <span>Coupon Discount</span>
                  <span className="text-success">- ₹{couponDiscount?.toLocaleString()}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-3 small">
                <span>Delivery Charges</span>
                <span>
                  {cart.deliveryCharge === 0 ? (
                    <span className="text-success fw-bold">FREE</span>
                  ) : (
                    `₹${cart.deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="d-flex justify-content-between border-top border-bottom py-3 mb-3 fw-bold fs-5 text-dark">
                <span>Total Amount</span>
                <span>₹{netPayable?.toLocaleString()}</span>
              </div>

              <div className="text-success fw-bold small mb-3">
                <i className="bi bi-tag-fill me-1"></i> You will save ₹{(cart.savings + couponDiscount)?.toLocaleString()} on this order
              </div>

              <div className="d-flex align-items-center gap-2 text-muted small mt-4 pt-3 border-top">
                <i className="bi bi-shield-lock-fill fs-4 text-secondary"></i>
                <span style={{ fontSize: '0.78rem' }}>
                  Safe and Secure Payments. Easy returns. 100% Authentic products.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
