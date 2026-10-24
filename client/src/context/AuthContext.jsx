import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('shopkart_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shopkart_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync user state on mount
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('shopkart_token');
      if (savedToken) {
        try {
          const { data } = await API.get('/auth/me');
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('shopkart_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('shopkart_token');
          localStorage.removeItem('shopkart_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('shopkart_token', data.token);
        localStorage.setItem('shopkart_user', JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password, phone });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('shopkart_token', data.token);
        localStorage.setItem('shopkart_user', JSON.stringify(data.user));
        toast.success('Registration successful! Welcome to ShopKart.');
        return { success: true, user: data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('shopkart_token');
    localStorage.removeItem('shopkart_user');
    setUser(null);
    setToken(null);
    toast.info('Logged out successfully');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('shopkart_user', JSON.stringify(updatedUser));
  };

  const demoLogin = async (role = 'customer') => {
    if (role === 'admin') {
      return await login('admin@shopkart.com', 'Admin@12345');
    }
    return await login('customer@shopkart.com', 'Customer@12345');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUserProfile,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
