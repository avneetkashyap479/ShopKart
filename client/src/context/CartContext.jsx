import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

const initialCartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  discountedTotal: 0,
  savings: 0,
  deliveryCharge: 0,
  finalTotal: 0
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(initialCartState);
  const [coupon, setCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Guest cart from localStorage
      const localCart = localStorage.getItem('shopkart_guest_cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          calculateGuestTotals(parsed.items || []);
        } catch (e) {
          setCart(initialCartState);
        }
      } else {
        setCart(initialCartState);
      }
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.warn('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Helper for guest cart calculation
  const calculateGuestTotals = (items) => {
    let subtotal = 0;
    let discountedTotal = 0;
    let totalItems = 0;

    items.forEach((item) => {
      const p = item.product;
      if (p) {
        const qty = item.quantity;
        totalItems += qty;
        subtotal += (p.price || 0) * qty;
        discountedTotal += (p.discountPrice || p.price || 0) * qty;
      }
    });

    const savings = Math.max(0, subtotal - discountedTotal);
    const deliveryCharge = discountedTotal >= 500 || discountedTotal === 0 ? 0 : 40;
    const finalTotal = discountedTotal + deliveryCharge;

    const guestCart = {
      items,
      totalItems,
      subtotal,
      discountedTotal,
      savings,
      deliveryCharge,
      finalTotal
    };

    setCart(guestCart);
    localStorage.setItem('shopkart_guest_cart', JSON.stringify(guestCart));
  };

  const addToCart = async (product, quantity = 1) => {
    if (!product || !product._id) return;

    if (!isAuthenticated) {
      // Guest addition
      const currentItems = [...(cart.items || [])];
      const existingIdx = currentItems.findIndex((it) => it.product._id === product._id);

      if (existingIdx > -1) {
        const newQty = currentItems[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          toast.warning(`Only ${product.stock} units available in stock`);
          return;
        }
        currentItems[existingIdx].quantity = newQty;
      } else {
        if (quantity > product.stock) {
          toast.warning(`Only ${product.stock} units available in stock`);
          return;
        }
        currentItems.push({ product, quantity });
      }

      calculateGuestTotals(currentItems);
      toast.success('Added to Cart!');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/cart', { productId: product._id, quantity });
      if (data.success) {
        setCart(data.cart);
        toast.success('Added to Cart!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    if (!isAuthenticated) {
      const currentItems = [...(cart.items || [])];
      const idx = currentItems.findIndex((it) => it.product._id === productId);
      if (idx > -1) {
        if (quantity > currentItems[idx].product.stock) {
          toast.warning(`Only ${currentItems[idx].product.stock} units available`);
          return;
        }
        currentItems[idx].quantity = quantity;
        calculateGuestTotals(currentItems);
      }
      return;
    }

    try {
      const { data } = await API.put(`/cart/${productId}`, { quantity });
      if (data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      const currentItems = (cart.items || []).filter((it) => it.product._id !== productId);
      calculateGuestTotals(currentItems);
      toast.info('Item removed from cart');
      return;
    }

    try {
      const { data } = await API.delete(`/cart/${productId}`);
      if (data.success) {
        setCart(data.cart);
        toast.info('Item removed from cart');
      }
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem('shopkart_guest_cart');
      setCart(initialCartState);
      setCoupon(null);
      setCouponDiscount(0);
      return;
    }

    try {
      await API.delete('/cart');
      setCart(initialCartState);
      setCoupon(null);
      setCouponDiscount(0);
    } catch (err) {
      console.warn('Failed to clear cart:', err.message);
    }
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      toast.warning('Please enter a coupon code');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Please log in to apply discount coupons');
      return;
    }

    try {
      const { data } = await API.post('/coupons/validate', {
        code: code.trim(),
        orderAmount: cart.discountedTotal
      });

      if (data.success && data.coupon) {
        setCoupon(data.coupon);
        setCouponDiscount(data.coupon.discountAmount);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon');
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    toast.info('Coupon removed');
  };

  const netPayable = Math.max(0, cart.finalTotal - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        cart,
        coupon,
        couponDiscount,
        netPayable,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
