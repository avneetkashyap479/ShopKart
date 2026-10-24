import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="product-card">
      {/* Wishlist toggle button */}
      <button
        type="button"
        className="wishlist-btn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product._id);
        }}
        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        aria-label="Wishlist"
      >
        <i className={`bi bi-heart-fill ${inWishlist ? 'text-danger' : 'text-muted'}`}></i>
      </button>

      {/* Image wrap with Link */}
      <Link to={`/products/${product._id}`} className="product-card-img-wrap text-decoration-none">
        <img src={mainImage} alt={product.name} className="product-card-img" loading="lazy" />
      </Link>

      {/* Details body */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
            {product.brand}
          </span>
          {product.isShopKartAssured && (
            <span className="assured-badge">
              ShopKart <span>Assured</span>
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${product._id}`}
          className="text-dark text-decoration-none fw-semibold mb-2 line-clamp-2 text-truncate"
          title={product.name}
          style={{ fontSize: '0.92rem', lineHeight: '1.3' }}
        >
          {product.name}
        </Link>

        {/* Rating and Reviews */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="rating-badge">
            {product.rating || 4.5} <i className="bi bi-star-fill" style={{ fontSize: '0.65rem' }}></i>
          </span>
          <span className="text-muted small">({product.numReviews || 0})</span>
        </div>

        {/* Pricing */}
        <div className="d-flex align-items-baseline gap-2 mt-auto mb-3">
          <span className="price-current">₹{product.discountPrice?.toLocaleString()}</span>
          {product.price > product.discountPrice && (
            <>
              <span className="price-original">₹{product.price?.toLocaleString()}</span>
              <span className="price-discount">{product.discountPercentage || Math.round(((product.price - product.discountPrice)/product.price)*100)}% off</span>
            </>
          )}
        </div>

        {/* Quick Add to Cart Button */}
        {product.stock > 0 ? (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
            onClick={() => addToCart(product, 1)}
          >
            <i className="bi bi-cart-plus"></i> Add to Cart
          </button>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm w-100 fw-semibold" disabled>
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
