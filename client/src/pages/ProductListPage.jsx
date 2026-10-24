import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/common/ProductCard';
import ProductGridSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters state from URL or defaults
  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('rating') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'newest';

  // Local filter form controls
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.warn('Categories error:', err.message);
      }
    };
    fetchCats();
  }, []);

  // Fetch products with current query params
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryObj = {
        page: currentPage,
        limit: 12,
        sort
      };

      if (keyword) queryObj.keyword = keyword;
      if (selectedCategory) queryObj.category = selectedCategory;
      if (selectedBrand) queryObj.brand = selectedBrand;
      if (minPrice) queryObj.minPrice = minPrice;
      if (maxPrice) queryObj.maxPrice = maxPrice;
      if (minRating) queryObj.rating = minRating;
      if (inStock) queryObj.inStock = 'true';

      const queryString = new URLSearchParams(queryObj).toString();
      const { data } = await API.get(`/products?${queryString}`);

      if (data.success) {
        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
        setTotalPages(data.totalPages || 1);
        if (data.availableBrands) {
          setAvailableBrands(data.availableBrands);
        }
      }
    } catch (err) {
      console.warn('Products fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, selectedCategory, selectedBrand, minPrice, maxPrice, minRating, inStock, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.delete('page'); // reset to page 1 on filter change
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');

    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');

    newParams.delete('page');
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = !!(keyword || selectedCategory || selectedBrand || minPrice || maxPrice || minRating || inStock);

  return (
    <div className="container-fluid px-lg-4 py-3">
      {/* Mobile filter toggle */}
      <div className="d-md-none mb-3 d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm">
        <span className="fw-bold">Showing {totalProducts} Products</span>
        <button
          className="btn btn-outline-primary btn-sm fw-semibold"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          <i className="bi bi-funnel"></i> Filters
        </button>
      </div>

      <div className="row g-3">
        {/* Left Filters Sidebar */}
        <div className={`col-12 col-md-3 ${mobileFilterOpen ? 'd-block' : 'd-none d-md-block'}`}>
          <div className="bg-white rounded-3 p-3 shadow-sm position-sticky" style={{ top: '80px' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <h5 className="fw-bold mb-0">Filters</h5>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-link text-primary p-0 text-decoration-none small fw-bold"
                  onClick={clearAllFilters}
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Keyword active indicator */}
            {keyword && (
              <div className="mb-3">
                <span className="badge bg-primary d-inline-flex align-items-center gap-1 p-2">
                  Search: "{keyword}"
                  <i
                    className="bi bi-x-circle cursor-pointer ms-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => updateParam('keyword', null)}
                  ></i>
                </span>
              </div>
            )}

            {/* Categories */}
            <div className="mb-4">
              <label className="fw-bold text-dark small text-uppercase mb-2 d-block">
                Categories
              </label>
              <div className="d-flex flex-column gap-1 max-vh-25 overflow-y-auto">
                <div
                  className={`px-2 py-1 rounded small cursor-pointer ${
                    !selectedCategory ? 'fw-bold text-primary bg-light' : 'text-secondary'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => updateParam('category', null)}
                >
                  All Categories
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className={`px-2 py-1 rounded small cursor-pointer ${
                      selectedCategory === cat.slug || selectedCategory === cat.name
                        ? 'fw-bold text-primary bg-light'
                        : 'text-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => updateParam('category', cat.slug)}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4 border-top pt-3">
              <label className="fw-bold text-dark small text-uppercase mb-2 d-block">
                Price Range (₹)
              </label>
              <form onSubmit={handlePriceFilterSubmit} className="row g-2 align-items-center">
                <div className="col-5">
                  <input
                    type="number"
                    placeholder="Min"
                    className="form-control form-control-sm"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                  />
                </div>
                <div className="col-2 text-center text-muted">to</div>
                <div className="col-5">
                  <input
                    type="number"
                    placeholder="Max"
                    className="form-control form-control-sm"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                  />
                </div>
                <div className="col-12 mt-2">
                  <button type="submit" className="btn btn-outline-primary btn-sm w-100 fw-semibold">
                    Apply Price
                  </button>
                </div>
              </form>
            </div>

            {/* Brands */}
            {availableBrands.length > 0 && (
              <div className="mb-4 border-top pt-3">
                <label className="fw-bold text-dark small text-uppercase mb-2 d-block">
                  Brands
                </label>
                <div className="d-flex flex-column gap-1" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  {availableBrands.map((brand) => (
                    <div key={brand} className="form-check small">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`brand-${brand}`}
                        checked={selectedBrand.split(',').includes(brand)}
                        onChange={(e) => {
                          const current = selectedBrand ? selectedBrand.split(',') : [];
                          if (e.target.checked) {
                            updateParam('brand', [...current, brand].join(','));
                          } else {
                            const filtered = current.filter((b) => b !== brand);
                            updateParam('brand', filtered.length ? filtered.join(',') : null);
                          }
                        }}
                      />
                      <label className="form-check-label text-dark" htmlFor={`brand-${brand}`}>
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Ratings */}
            <div className="mb-4 border-top pt-3">
              <label className="fw-bold text-dark small text-uppercase mb-2 d-block">
                Customer Ratings
              </label>
              {[4, 3, 2].map((stars) => (
                <div key={stars} className="form-check small mb-1">
                  <input
                    type="radio"
                    name="ratingFilter"
                    className="form-check-input"
                    id={`rating-${stars}`}
                    checked={minRating === String(stars)}
                    onChange={() => updateParam('rating', stars)}
                  />
                  <label className="form-check-label text-dark" htmlFor={`rating-${stars}`}>
                    {stars}★ & above
                  </label>
                </div>
              ))}
              {minRating && (
                <button
                  type="button"
                  className="btn btn-link btn-sm text-secondary p-0 text-decoration-none small mt-1"
                  onClick={() => updateParam('rating', null)}
                >
                  Clear rating
                </button>
              )}
            </div>

            {/* In Stock Toggle */}
            <div className="border-top pt-3">
              <div className="form-check form-switch small">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="inStockCheck"
                  checked={inStock}
                  onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
                />
                <label className="form-check-label fw-semibold" htmlFor="inStockCheck">
                  Exclude Out of Stock
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Right Product Grid */}
        <div className="col-12 col-md-9">
          {/* Header Bar: Results count & Sort */}
          <div className="bg-white rounded-3 p-3 shadow-sm mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="fw-bold text-dark">
                {keyword ? `Search results for "${keyword}"` : selectedCategory ? `Category: ${selectedCategory}` : 'All Products'}
              </span>
              <span className="text-muted small ms-2">({totalProducts} products)</span>
            </div>

            {/* Sort Options */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-semibold">Sort By:</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Customer Rating</option>
                <option value="popular">Popularity</option>
                <option value="discount-desc">Biggest Discount</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                {products.map((product) => (
                  <div key={product._id} className="col">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          ) : (
            <EmptyState
              icon="bi-emoji-frown"
              title="No products matched your search"
              description="Try resetting your filters or search with another keyword"
              actionText="Reset All Filters"
              onActionClick={clearAllFilters}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductListPage;
