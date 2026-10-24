const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get all reviews for a product with statistics
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });

    // Calculate rating counts for breakdown (5, 4, 3, 2, 1 stars)
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating] += 1;
      }
    });

    res.json({
      success: true,
      count: reviews.length,
      breakdown,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a product
// @route   POST /api/products/:productId/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      rating: numRating,
      title: title || '',
      comment,
      isVerifiedPurchase: true
    });

    // Update product rating and numReviews
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    product.numReviews = allReviews.length;
    product.rating = Number(avgRating.toFixed(1));
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
      productRating: product.rating,
      productNumReviews: product.numReviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createProductReview
};
