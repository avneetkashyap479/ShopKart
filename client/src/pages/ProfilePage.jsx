import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'security'

  // Personal info state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    isDefault: false
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const { data } = await API.put('/auth/profile', { name, phone });
      if (data.success) {
        updateUserProfile(data.user);
        toast.success('Profile details updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const { data } = await API.put(`/users/addresses/${editingAddressId}`, addressForm);
        if (data.success) {
          setAddresses(data.addresses);
          toast.success('Address updated');
        }
      } else {
        const { data } = await API.post('/users/addresses', addressForm);
        if (data.success) {
          setAddresses(data.addresses);
          toast.success('New address added');
        }
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const { data } = await API.delete(`/users/addresses/${addrId}`);
      if (data.success) {
        setAddresses(data.addresses);
        toast.info('Address removed');
      }
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType,
      isDefault: addr.isDefault
    });
    setShowAddressForm(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      const { data } = await API.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (data.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="row g-4">
        
        {/* Left Profile Sidebar Navigation */}
        <div className="col-12 col-md-4 col-lg-3">
          <div className="bg-white rounded-3 shadow-sm p-3 mb-3 border">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary text-white fs-4 fw-bold d-flex align-items-center justify-content-center"
                style={{ width: '50px', height: '50px' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-truncate">
                <span className="small text-muted d-block">Hello,</span>
                <span className="fw-bold text-dark text-truncate">{user?.name}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3 shadow-sm overflow-hidden border">
            <div className="list-group list-group-flush">
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'profile' ? 'active bg-primary border-primary' : ''
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person-fill"></i> Personal Information
              </button>

              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'addresses' ? 'active bg-primary border-primary' : ''
                }`}
                onClick={() => setActiveTab('addresses')}
              >
                <i className="bi bi-geo-alt-fill"></i> Manage Addresses ({addresses.length})
              </button>

              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-3 ${
                  activeTab === 'security' ? 'active bg-primary border-primary' : ''
                }`}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-shield-lock-fill"></i> Security & Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Panels */}
        <div className="col-12 col-md-8 col-lg-9">
          
          {/* TAB 1: Personal Info */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3 p-4 shadow-sm border">
              <h5 className="fw-bold mb-4 border-bottom pb-2">Personal Information</h5>
              <form onSubmit={handleProfileSubmit} style={{ maxWidth: '480px' }}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                  <small className="text-muted">Email address cannot be changed</small>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-shopkart-primary px-4 fw-semibold"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3 p-4 shadow-sm border">
              <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                <h5 className="fw-bold mb-0">Manage Addresses</h5>
                {!showAddressForm && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm fw-semibold"
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressForm({
                        fullName: user?.name || '',
                        phone: user?.phone || '',
                        addressLine: '',
                        city: '',
                        state: '',
                        pincode: '',
                        addressType: 'Home',
                        isDefault: addresses.length === 0
                      });
                      setShowAddressForm(true);
                    }}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Add A New Address
                  </button>
                )}
              </div>

              {/* Add/Edit Address Form */}
              {showAddressForm && (
                <div className="p-3 border rounded-3 bg-light mb-4">
                  <h6 className="fw-bold mb-3">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h6>
                  <form onSubmit={handleSaveAddress} className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Phone (10 digits)</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Address Line</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={addressForm.addressLine}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold">PIN Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        maxLength={6}
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="profileAddrType"
                          id="pHome"
                          checked={addressForm.addressType === 'Home'}
                          onChange={() => setAddressForm({ ...addressForm, addressType: 'Home' })}
                        />
                        <label className="form-check-label small" htmlFor="pHome">Home</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="profileAddrType"
                          id="pWork"
                          checked={addressForm.addressType === 'Work'}
                          onChange={() => setAddressForm({ ...addressForm, addressType: 'Work' })}
                        />
                        <label className="form-check-label small" htmlFor="pWork">Work</label>
                      </div>
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button type="submit" className="btn btn-shopkart-primary btn-sm px-4 fw-semibold">
                        Save Address
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Saved Addresses list */}
              <div className="d-flex flex-column gap-3">
                {addresses.map((addr) => (
                  <div key={addr._id} className="p-3 border rounded-3 position-relative">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-secondary small">{addr.addressType}</span>
                      <strong className="text-dark small">{addr.fullName}</strong>
                      <span className="fw-semibold small text-dark ms-2">{addr.phone}</span>
                      {addr.isDefault && <span className="badge bg-success ms-auto">Default</span>}
                    </div>
                    <div className="small text-muted mb-2">
                      {addr.addressLine}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </div>
                    <div className="d-flex gap-3 pt-2 border-top">
                      <button
                        type="button"
                        className="btn btn-link text-primary text-decoration-none p-0 small fw-bold"
                        onClick={() => handleEditAddress(addr)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-link text-danger text-decoration-none p-0 small fw-bold"
                        onClick={() => handleDeleteAddress(addr._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3 p-4 shadow-sm border">
              <h5 className="fw-bold mb-4 border-bottom pb-2">Change Password</h5>
              <form onSubmit={handleChangePassword} style={{ maxWidth: '420px' }}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <small className="text-muted">Must be at least 6 characters</small>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-shopkart-primary px-4 fw-semibold"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
