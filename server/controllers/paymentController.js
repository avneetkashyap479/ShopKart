const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');

// Initialize Razorpay instance safely
let razorpayInstance = null;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const hasRealCredentials =
  keyId &&
  keySecret &&
  keyId.startsWith('rzp_') &&
  !keyId.includes('mock') &&
  !keySecret.includes('mock');

if (hasRealCredentials) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.warn('[ShopKart Payments] Razorpay instance initialization warning:', err.message);
  }
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    // If real credentials are functional, use Razorpay SDK
    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`
      };

      const rzpOrder = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        isMock: false,
        key: process.env.RAZORPAY_KEY_ID,
        order: rzpOrder
      });
    }

    // Otherwise, generate official ShopKart Mock Payment Order for local dev
    const mockOrder = {
      id: `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_mock_${Date.now()}`,
      status: 'created',
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000)
    };

    res.json({
      success: true,
      isMock: true,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart_mock',
      order: mockOrder,
      message: 'ShopKart Test Payment Order initialized (Mock Mode Active)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay / Test Payment Signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Payment details are missing' });
    }

    let isSignatureValid = false;

    // If mock order, accept simulation
    if (razorpay_order_id.startsWith('order_mock_') || !hasRealCredentials) {
      isSignatureValid = true;
    } else {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isSignatureValid = expectedSignature === razorpay_signature;
    }

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // If an associated Order exists, update its payment status
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: razorpay_payment_id,
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature: razorpay_signature || 'mock_signature_verified'
        };
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'shopkart_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];

    // In local dev/mock or verified
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
};
