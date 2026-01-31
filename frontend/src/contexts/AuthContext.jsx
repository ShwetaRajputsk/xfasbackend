import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('xfas_token');
      const userData = localStorage.getItem('xfas_user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (error) {
          console.warn('Invalid user data in localStorage, clearing auth:', error.message);
          localStorage.removeItem('xfas_token');
          localStorage.removeItem('xfas_user');
          setIsAuthenticated(false);
          setUser(null);
        }
        
        // Verify token with backend
        try {
          const profile = await authAPI.getProfile();
          setUser(profile);
        } catch (error) {
          console.warn('Token verification failed, clearing auth:', error.message);
          // Token is invalid, clear auth silently
          localStorage.removeItem('xfas_token');
          localStorage.removeItem('xfas_user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      localStorage.setItem('xfas_token', response.access_token);
      localStorage.setItem('xfas_user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || 'Invalid login credentials';
      } else if (error.response?.status === 422) {
        // Handle validation errors
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => err.msg || err).join(', ');
        } else {
          errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
        }
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
      } else if (!error.response) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      localStorage.setItem('xfas_token', response.access_token);
      localStorage.setItem('xfas_user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.response?.status === 400) {
        const detail = error.response?.data?.detail;
        const detailStr = typeof detail === 'string' ? detail : JSON.stringify(detail);
        if (detailStr?.includes('Email already registered')) {
          errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
        } else if (detailStr?.includes('Phone number already registered')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
        } else {
          errorMessage = detailStr || 'Invalid registration details';
        }
      } else if (error.response?.status === 422) {
        // Handle validation errors
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => err.msg || err).join(', ');
        } else {
          errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
        }
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
      } else if (!error.response) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('xfas_token');
    localStorage.removeItem('xfas_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};