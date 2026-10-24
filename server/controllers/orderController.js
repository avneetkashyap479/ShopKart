const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');

// Helper to generate tracking number
const generateTrackingNumber = () => {
  return 'SKTRK' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    if (!shippingAddress || !shippingAddress.addressLine || !shippingAddress.pincode || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Valid shipping address is required' });
    }

    // Server-side validation of each product price, name, image, and available stock
    let itemsPrice = 0;
    let sellingPrice = 0;
    const validatedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
        });
      }

      const itemMRP = product.price;
      const itemDiscountPrice = product.discountPrice || product.price;
      const subtotal = itemDiscountPrice * item.quantity;

      itemsPrice += itemMRP * item.quantity;
      sellingPrice += subtotal;

      validatedOrderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        price: itemMRP,
        discountPrice: itemDiscountPrice,
        quantity: item.quantity,
        subtotal
      });
    }

    // Handle coupon if provided
    let couponDiscount = 0;
    let validCouponCode = '';

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() }
      });

      if (coupon && sellingPrice >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = (sellingPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount) {
            couponDiscount = Math.min(couponDiscount, coupon.maxDiscountAmount);
          }
        } else {
          couponDiscount = Math.min(coupon.discountValue, sellingPrice);
        }
        couponDiscount = Math.round(couponDiscount);
        validCouponCode = coupon.code;

        // Increment timesUsed
        coupon.timesUsed += 1;
        await coupon.save();
      }
    }

    const shippingPrice = sellingPrice >= 500 ? 0 : 40;
    const totalPrice = Math.max(0, sellingPrice - couponDiscount + shippingPrice);
    const discountAmount = Math.max(0, itemsPrice - sellingPrice + couponDiscount);

    // Deduct stock for all items
    for (const item of validatedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const isPaid = paymentMethod === 'MOCK_ONLINE';

    const order = new Order({
      user: req.user._id,
      orderItems: validatedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      itemsPrice,
      sellingPrice,
      discountAmount,
      couponCode: validCouponCode,
      couponDiscount,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt: isPaid ? Date.now() : null,
      orderStatus: 'Placed',
      statusHistory: [
        {
          status: 'Placed',
          timestamp: new Date(),
          note: isPaid ? 'Order placed and payment confirmed' : 'Order placed successfully with Cash on Delivery'
        }
      ],
      trackingNumber: generateTrackingNumber()
    });

    const createdOrder = await order.save();

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: createdOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer or Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage (${order.orderStatus})`
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Cancelled by customer'
    });

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    const updatedOrder = await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit) || 1,
      currentPage: page,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If changing from active to cancelled, restore stock
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      order.cancelledAt = new Date();
    }

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = new Date();
      }
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    const updatedOrder = await order.save();
    res.json({ success: true, message: `Order status updated to ${status}`, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};
