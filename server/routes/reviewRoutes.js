const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getProductReviews,
  createProductReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/', getProductReviews);
router.post('/', protect, createProductReview);

module.exports = router;
