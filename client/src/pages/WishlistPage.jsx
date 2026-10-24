import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/common/EmptyState';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading wishlist...</span>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-heart"
          title="Empty Wishlist"
          description="You have no items in your wishlist. Start adding items you love to keep track of them!"
          actionText="Explore Products"
          actionLink="/"
        />
      </div>
    );
  }

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="bg-white rounded-3 shadow-sm border p-4">
        <h4 className="fw-bold mb-4 border-bottom pb-2">
          My Wishlist <span className="text-muted fs-6">({wishlist.length} Items)</span>
        </h4>

        <div className="d-flex flex-column gap-3">
          {wishlist.map((item) => {
            const product = item;
            if (!product) return null;

            return (
              <div
                key={product._id}
                className="d-flex flex-column flex-sm-row align-items-center justify-content-between p-3 border-bottom gap-3"
              >
                <div className="d-flex align-items-center gap-3">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                      className="rounded border p-1"
                    />
                  </Link>

                  <div>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-dark fw-semibold text-decoration-none d-block mb-1 text-truncate"
                      style={{ maxWidth: '450px' }}
                    >
                      {product.name}
                    </Link>
                    <span className="small text-muted d-block mb-1">Brand: {product.brand}</span>

                    <div className="d-flex align-items-baseline gap-2">
                      <span className="fw-bold fs-6 text-dark">
                        ₹{product.discountPrice?.toLocaleString()}
                      </span>
                      {product.price > product.discountPrice && (
                        <>
                          <span className="price-original small">₹{product.price?.toLocaleString()}</span>
                          <span className="price-discount small">{product.discountPercentage}% off</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-shopkart-primary btn-sm px-3 fw-semibold"
                    onClick={() => {
                      addToCart(product, 1);
                      toggleWishlist(product._id);
                    }}
                    disabled={product.stock <= 0}
                  >
                    <i className="bi bi-cart3 me-1"></i> Move to Cart
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => toggleWishlist(product._id)}
                    title="Remove from Wishlist"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default WishlistPage;
