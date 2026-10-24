import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [breakdown, setBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Delivery pincode checker state
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  // Review form modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${id}`);
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.images?.[0] || '');
          setRelatedProducts(data.relatedProducts || []);

          // Save to Recently Viewed in localStorage
          try {
            const currentRecent = JSON.parse(localStorage.getItem('shopkart_recent_products') || '[]');
            const filtered = currentRecent.filter((p) => p._id !== data.product._id);
            filtered.unshift(data.product);
            localStorage.setItem('shopkart_recent_products', JSON.stringify(filtered.slice(0, 10)));
          } catch (e) {
            // Ignore
          }

          // Fetch reviews
          const reviewRes = await API.get(`/products/${data.product._id}/reviews`);
          if (reviewRes.data.success) {
            setReviews(reviewRes.data.reviews || []);
            setBreakdown(reviewRes.data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
          }
        }
      } catch (err) {
        console.warn('Product details error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      toast.warning('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    // Simulate real delivery estimate calculation
    const daysToAdd = pincode.startsWith('5') ? 1 : pincode.startsWith('4') || pincode.startsWith('1') ? 2 : 3;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + daysToAdd);
    const dateStr = estDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    setDeliveryInfo({
      pincode,
      date: dateStr,
      freeDelivery: true
    });
    toast.success(`Delivery available to ${pincode}`);
  };

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to submit a review');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      toast.warning('Please provide your review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const { data } = await API.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });

      if (data.success) {
        toast.success('Thank you! Your review has been published.');
        setShowReviewModal(false);
        setReviewTitle('');
        setReviewComment('');
        // Refresh reviews
        const reviewRes = await API.get(`/products/${product._id}/reviews`);
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews || []);
          setBreakdown(reviewRes.data.breakdown || {});
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4>Product Not Found</h4>
        <Link to="/products" className="btn btn-shopkart-primary mt-3">Back to Products</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/products?category=${product.category?.slug || product.categoryName}`} className="text-decoration-none">
              {product.category?.name || product.categoryName || 'Products'}
            </Link>
          </li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row g-4 bg-white rounded-3 p-3 p-lg-4 shadow-sm">
        
        {/* Left Column: Image Gallery & Buy Actions */}
        <div className="col-12 col-lg-5">
          <div className="position-sticky" style={{ top: '80px' }}>
            <div className="d-flex gap-3">
              
              {/* Vertical Thumbnail List */}
              {images.length > 1 && (
                <div className="d-flex flex-column gap-2" style={{ width: '64px' }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`border rounded p-1 cursor-pointer overflow-hidden ${
                        selectedImage === img ? 'border-primary shadow-sm' : 'border-light'
                      }`}
                      style={{ cursor: 'pointer', height: '64px' }}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt="" className="w-100 h-100 object-fit-contain" />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Preview Image */}
              <div
                className="flex-grow-1 border rounded-3 p-4 position-relative d-flex align-items-center justify-content-center bg-white"
                style={{ height: '420px' }}
              >
                <button
                  type="button"
                  className="wishlist-btn"
                  onClick={() => toggleWishlist(product._id)}
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <i className={`bi bi-heart-fill ${inWishlist ? 'text-danger' : 'text-muted'}`}></i>
                </button>
                <img
                  src={selectedImage || images[0]}
                  alt={product.name}
                  className="img-fluid"
                  style={{ maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>

            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="fw-semibold small text-muted">Quantity:</span>
                <div className="qty-counter">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="fw-bold px-2">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <span className="small text-muted">
                  ({product.stock > 0 ? `${product.stock} items left in stock` : 'Out of stock'})
                </span>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-shopkart-cart w-100 py-3 d-flex align-items-center justify-content-center gap-2 shadow"
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.stock <= 0}
                  >
                    <i className="bi bi-cart3 fs-5"></i> ADD TO CART
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-shopkart-buy w-100 py-3 d-flex align-items-center justify-content-center gap-2 shadow"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                  >
                    <i className="bi bi-lightning-fill fs-5"></i> BUY NOW
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Title, Ratings, Offers, Delivery & Specs */}
        <div className="col-12 col-lg-7">
          
          <div className="text-muted small text-uppercase fw-semibold mb-1">
            {product.brand}
          </div>

          <h3 className="fw-bold text-dark mb-2" style={{ lineHeight: '1.3' }}>
            {product.name}
          </h3>

          {/* Rating, Reviews & Assured Tag */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="rating-badge fs-6">
              {product.rating || 4.5} <i className="bi bi-star-fill small"></i>
            </span>
            <span className="text-muted small fw-semibold">
              {product.numReviews || reviews.length} Ratings & Reviews
            </span>
            {product.isShopKartAssured && (
              <span className="assured-badge">
                ShopKart <span>Assured</span>
              </span>
            )}
          </div>

          {/* Pricing Details */}
          <div className="d-flex align-items-baseline gap-3 mb-3 p-3 bg-light rounded-3">
            <span className="fs-2 fw-bold text-dark">
              ₹{product.discountPrice?.toLocaleString()}
            </span>
            {product.price > product.discountPrice && (
              <>
                <span className="text-decoration-line-through text-muted fs-5">
                  ₹{product.price?.toLocaleString()}
                </span>
                <span className="text-success fw-bold fs-5">
                  {product.discountPercentage || Math.round(((product.price - product.discountPrice)/product.price)*100)}% off
                </span>
              </>
            )}
          </div>

          {/* Available Offers */}
          <div className="mb-4">
            <div className="fw-bold small text-dark mb-2">Available Offers</div>
            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex align-items-start gap-2">
                <i className="bi bi-tag-fill text-success mt-1"></i>
                <span><strong>Bank Offer:</strong> 10% Instant Discount on HDFC & ICICI Credit Cards up to ₹1,500</span>
              </div>
              <div className="d-flex align-items-start gap-2">
                <i className="bi bi-tag-fill text-success mt-1"></i>
                <span><strong>Special Coupon:</strong> Apply coupon <code>FIRST50</code> at checkout for 50% discount</span>
              </div>
              <div className="d-flex align-items-start gap-2">
                <i className="bi bi-tag-fill text-success mt-1"></i>
                <span><strong>Partner Offer:</strong> Buy now & get ₹500 surprise voucher on next purchase</span>
              </div>
            </div>
          </div>

          {/* Delivery PIN Code Checker */}
          <div className="border-top pt-3 mb-4">
            <div className="fw-bold small text-dark mb-2">Delivery & Services</div>
            <form onSubmit={handlePincodeCheck} className="d-flex gap-2" style={{ maxWidth: '380px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Enter Delivery PIN Code (e.g. 560103)"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-primary btn-sm px-3 fw-semibold">
                Check
              </button>
            </form>

            {deliveryInfo && (
              <div className="mt-2 text-success small fw-semibold">
                <i className="bi bi-truck me-1"></i> Delivery by {deliveryInfo.date} | Free ₹40 delivery
              </div>
            )}
          </div>

          {/* Description */}
          <div className="border-top pt-3 mb-4">
            <div className="fw-bold text-dark mb-2">Product Description</div>
            <p className="text-muted" style={{ lineHeight: '1.7' }}>
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="border-top pt-3 mb-4">
              <div className="fw-bold text-dark mb-2">Specifications</div>
              <div className="table-responsive">
                <table className="table table-bordered table-sm small mb-0">
                  <tbody>
                    {product.specifications.map((spec, idx) => (
                      <tr key={idx}>
                        <td className="text-muted fw-semibold" style={{ width: '35%' }}>{spec.key}</td>
                        <td className="text-dark">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ratings & Customer Reviews */}
          <div className="border-top pt-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Ratings & Reviews</h5>
                <span className="text-muted small">Verified buyers feedback</span>
              </div>
              <button
                className="btn btn-outline-primary btn-sm fw-semibold"
                onClick={() => setShowReviewModal(true)}
              >
                <i className="bi bi-pencil-square me-1"></i> Rate Product
              </button>
            </div>

            {/* Rating summary bar */}
            <div className="row g-3 align-items-center mb-4 p-3 bg-light rounded-3">
              <div className="col-12 col-sm-4 text-center border-end">
                <div className="display-5 fw-bold text-dark">{product.rating || 4.5} ★</div>
                <div className="small text-muted">{reviews.length} Ratings & Reviews</div>
              </div>
              <div className="col-12 col-sm-8">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = breakdown[star] || 0;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="d-flex align-items-center gap-2 small mb-1">
                      <span style={{ width: '25px' }}>{star}★</span>
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-muted" style={{ width: '30px' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-bottom pb-3">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="rating-badge" style={{ fontSize: '0.7rem' }}>
                        {rev.rating} ★
                      </span>
                      <span className="fw-bold small text-dark">{rev.title || 'Great Product'}</span>
                    </div>
                    <p className="text-secondary small mb-1">{rev.comment}</p>
                    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.72rem' }}>
                      <span className="fw-semibold">{rev.userName}</span>
                      <span>•</span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-success d-flex align-items-center gap-1">
                          <i className="bi bi-patch-check-fill"></i> Certified Buyer
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No customer reviews yet. Be the first to review this product!</p>
            )}

          </div>

        </div>

      </div>

      {/* Similar / Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-white rounded-3 p-4 shadow-sm mt-4">
          <h5 className="fw-bold mb-3">Similar Products</h5>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
            {relatedProducts.map((relProd) => (
              <div key={relProd._id} className="col">
                <ProductCard product={relProd} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Rate & Review Product</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReviewModal(false)}
                ></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Your Rating</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`btn btn-sm ${
                            reviewRating >= star ? 'btn-warning text-dark' : 'btn-outline-secondary'
                          }`}
                          onClick={() => setReviewRating(star)}
                        >
                          {star} ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Review Headline (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Excellent sound clarity & battery"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Detailed Review</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={4}
                      placeholder="What did you like or dislike about this product?"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-shopkart-primary btn-sm px-4 fw-semibold"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetailPage;
