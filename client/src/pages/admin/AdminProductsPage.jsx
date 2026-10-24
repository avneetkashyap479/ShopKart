import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'react-toastify';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: 10,
    imageUrl: '',
    description: '',
    isFeatured: false,
    isShopKartAssured: true
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ limit: 50 });
      if (searchTerm) query.set('keyword', searchTerm);
      if (selectedCategory) query.set('category', selectedCategory);

      const [prodRes, catRes] = await Promise.all([
        API.get(`/products?${query.toString()}`),
        API.get('/categories')
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.products || []);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories || []);
      }
    } catch (err) {
      console.warn('Products fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      brand: '',
      category: categories[0]?._id || '',
      price: '',
      discountPrice: '',
      stock: 10,
      imageUrl: '',
      description: '',
      isFeatured: false,
      isShopKartAssured: true
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setEditingId(p._id);
    setFormData({
      name: p.name,
      brand: p.brand,
      category: p.category?._id || p.category,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      imageUrl: p.images?.[0] || '',
      description: p.description,
      isFeatured: p.isFeatured || false,
      isShopKartAssured: p.isShopKartAssured !== undefined ? p.isShopKartAssured : true
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { data } = await API.delete(`/products/${id}`);
      if (data.success) {
        toast.success('Product deleted');
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.warning('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name);
      dataPayload.append('brand', formData.brand);
      dataPayload.append('category', formData.category);
      dataPayload.append('price', formData.price);
      dataPayload.append('discountPrice', formData.discountPrice || formData.price);
      dataPayload.append('stock', formData.stock);
      dataPayload.append('description', formData.description);
      dataPayload.append('isFeatured', formData.isFeatured);
      dataPayload.append('isShopKartAssured', formData.isShopKartAssured);

      if (imageFile) {
        dataPayload.append('images', imageFile);
      } else if (formData.imageUrl) {
        dataPayload.append('images', formData.imageUrl);
      }

      let res;
      if (isEditing) {
        res = await API.put(`/products/${editingId}`, dataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/products', dataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(isEditing ? 'Product updated' : 'Product created successfully');
        setShowModal(false);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Product Management" />

      <div className="p-4">
        {/* Top Control Bar */}
        <div className="card border-0 rounded-3 shadow-sm p-3 mb-4">
          <div className="row g-2 align-items-center justify-content-between">
            <div className="col-12 col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select form-select-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-auto ms-auto">
              <button className="btn btn-shopkart-primary btn-sm fw-bold px-3" onClick={handleOpenAdd}>
                <i className="bi bi-plus-lg me-1"></i> Add New Product
              </button>
            </div>
          </div>
        </div>

        {/* Product Table Card */}
        <div className="card border-0 rounded-3 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Discount Price</th>
                  <th>Stock</th>
                  <th>Badges</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                            alt=""
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            className="rounded border p-1"
                          />
                          <div className="text-truncate" style={{ maxWidth: '240px' }}>
                            <strong className="text-dark d-block text-truncate">{p.name}</strong>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>Brand: {p.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td>{p.category?.name || p.categoryName}</td>
                      <td>₹{p.price?.toLocaleString()}</td>
                      <td className="fw-bold text-success">₹{p.discountPrice?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${p.stock <= 5 ? 'bg-danger' : 'bg-light text-dark border'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td>
                        {p.isFeatured && <span className="badge bg-warning text-dark me-1">Featured</span>}
                        {p.isShopKartAssured && <span className="badge bg-primary">Assured</span>}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-sm px-2 py-1"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm px-2 py-1"
                            onClick={() => handleDelete(p._id, p.name)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 row g-3">
                  <div className="col-12 col-md-8">
                    <label className="form-label small fw-semibold">Product Title *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold">Brand *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold">Category *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6 col-md-4">
                    <label className="form-label small fw-semibold">Standard MRP Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-6 col-md-4">
                    <label className="form-label small fw-semibold">Selling / Discount Price (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>

                  <div className="col-6 col-md-4">
                    <label className="form-label small fw-semibold">Available Stock Count</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-8">
                    <label className="form-label small fw-semibold">Product Image URL (Unsplash or CDN)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Or Upload Product Image File</label>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Product Description *</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12 d-flex gap-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="featuredCheck"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="featuredCheck">
                        Featured on Homepage
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="assuredCheck"
                        checked={formData.isShopKartAssured}
                        onChange={(e) => setFormData({ ...formData, isShopKartAssured: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="assuredCheck">
                        ShopKart Assured Quality
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-shopkart-primary btn-sm px-4 fw-semibold" disabled={submitting}>
                    {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AdminProductsPage;
