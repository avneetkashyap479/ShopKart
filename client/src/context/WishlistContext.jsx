import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.get('/wishlist');
      if (data.success && data.wishlist) {
        setWishlist(data.wishlist);
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your Wishlist');
      return;
    }

    try {
      const { data } = await API.post(`/wishlist/${productId}`);
      if (data.success) {
        setWishlist(data.wishlist);
        if (data.isAdded) {
          toast.success('Added to your Wishlist');
        } else {
          toast.info('Removed from your Wishlist');
        }
      }
    } catch (err) {
      toast.error('Could not update wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        fetchWishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
