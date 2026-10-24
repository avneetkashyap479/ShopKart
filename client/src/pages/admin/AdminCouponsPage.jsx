import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'react-toastify';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: 0,
    maxDiscountAmount: 1000,
    expiryDate: ''
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/coupons');
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.warn('Coupons fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon) => {
    try {
      const { data } = await API.put(`/coupons/${coupon._id}`, {
        isActive: !coupon.isActive
      });
      if (data.success) {
        toast.success(`Coupon ${data.coupon.code} is now ${data.coupon.isActive ? 'Active' : 'Disabled'}`);
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? data.coupon : c))
        );
      }
    } catch (err) {
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      const { data } = await API.delete(`/coupons/${id}`);
      if (data.success) {
        toast.success('Coupon deleted');
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      toast.warning('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await API.post('/coupons', formData);
      if (data.success) {
        toast.success('Coupon created successfully');
        setShowModal(false);
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Discount Coupons" />

      <div className="p-4">
        <div className="card border-0 rounded-3 shadow-sm p-3 mb-4 d-flex flex-row justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Active Coupons ({coupons.length})</h5>
          <button
            type="button"
            className="btn btn-shopkart-primary btn-sm fw-bold px-3"
            onClick={() => {
              setFormData({
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: '',
                minOrderAmount: 0,
                maxDiscountAmount: 1000,
                expiryDate: ''
              });
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i> Create New Coupon
          </button>
        </div>

        {/* Coupons Table */}
        <div className="card border-0 rounded-3 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Max Discount</th>
                  <th>Expiry Date</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Loading coupons...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No discount coupons found.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong className="badge bg-primary fs-6">{c.code}</strong>
                        {c.description && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{c.description}</div>}
                      </td>
                      <td className="fw-bold">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </td>
                      <td>₹{c.minOrderAmount}</td>
                      <td>{c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No Limit'}</td>
                      <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                      <td>{c.timesUsed || 0}</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className={`btn btn-sm ${c.isActive ? 'btn-outline-warning' : 'btn-outline-success'} px-2 py-1`}
                            onClick={() => handleToggleActive(c)}
                          >
                            {c.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm px-2 py-1"
                            onClick={() => handleDelete(c._id, c.code)}
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

      {/* Create Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Create Discount Coupon</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Coupon Code *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase"
                      placeholder="e.g. SHOPKART20"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Discount Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Discount Value *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Minimum Order (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold">Expiry Date *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Coupon Description</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 20% off on all items"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-shopkart-primary btn-sm px-4 fw-semibold" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Save Coupon'}
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

export default AdminCouponsPage;
