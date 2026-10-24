const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get admin dashboard stats and metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Calculate total revenue from paid or delivered orders
    const revenueAggregate = await Order.aggregate([
      { $match: { $or: [{ isPaid: true }, { orderStatus: 'Delivered' }] } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;

    // Low stock products (< 5 in stock)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('name brand stock price discountPrice images')
      .limit(10);

    // Recent 6 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Orders status count
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Sales by Category
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$categoryName', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        recentOrders,
        statusCounts,
        categoryDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats
};
