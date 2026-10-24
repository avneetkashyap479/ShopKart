const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  toggleUserStatus,
  updateUserRole
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// Customer routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

// Admin routes
router.get('/all', protect, admin, getAllUsers);
router.put('/:id/status', protect, admin, toggleUserStatus);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
