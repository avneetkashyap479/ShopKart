const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to calculate totals from populated items
const calculateCartTotals = (items) => {
  let subtotal = 0;
  let discountedTotal = 0;
  let totalItems = 0;

  items.forEach((item) => {
    if (item.product) {
      const qty = item.quantity;
      totalItems += qty;
      subtotal += (item.product.price || 0) * qty;
      discountedTotal += (item.product.discountPrice || item.product.price || 0) * qty;
    }
  });

  const savings = Math.max(0, subtotal - discountedTotal);
  // Free delivery above 500, else 40
  const deliveryCharge = discountedTotal >= 500 || discountedTotal === 0 ? 0 : 40;
  const finalTotal = discountedTotal + deliveryCharge;

  return {
    subtotal,
    discountedTotal,
    savings,
    deliveryCharge,
    finalTotal,
    totalItems
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock brand'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product may have been deleted
    cart.items = cart.items.filter((item) => item.product !== null);

    const totals = calculateCartTotals(cart.items);

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items available in stock.`
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock.`
        });
      }
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();

    // Re-populate cart
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock brand'
    });

    const totals = calculateCartTotals(populatedCart.items);

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: {
        _id: populatedCart._id,
        items: populatedCart.items,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Maximum available quantity in stock is ${product.stock}`
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock brand'
    });

    const totals = calculateCartTotals(populatedCart.items);

    res.json({
      success: true,
      message: 'Cart updated',
      cart: {
        _id: populatedCart._id,
        items: populatedCart.items,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock brand'
    });

    const totals = calculateCartTotals(populatedCart.items);

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: populatedCart._id,
        items: populatedCart.items,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared', cart: { items: [], totalItems: 0, finalTotal: 0 } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
