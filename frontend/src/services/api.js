import axios from 'axios';
import config from '../config';

// Use centralized configuration
const API_BASE = config.getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.API_TIMEOUT,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (requestConfig) => {
    if (config.ENABLE_DEBUG_LOGS) {
      console.log('Axios request config:', {
        url: requestConfig.url,
        baseURL: requestConfig.baseURL,
        fullURL: `${requestConfig.baseURL}${requestConfig.url}`
      });
    }
    
    // Check for both regular user token and admin token
    const token = localStorage.getItem(config.STORAGE_KEYS.TOKEN) || 
                  localStorage.getItem(config.STORAGE_KEYS.ADMIN_TOKEN);
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login attempt
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      // This is an expired token scenario, clear auth and redirect to homepage
      if (config.ENABLE_DEBUG_LOGS) {
        console.warn('Authentication expired, clearing tokens');
      }
      localStorage.removeItem(config.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(config.STORAGE_KEYS.USER);
      localStorage.removeItem(config.STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(config.STORAGE_KEYS.ADMIN_USER);
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  registerWithOTP: async (userData) => {
    const response = await api.post('/auth/register-with-otp', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  loginWithPhone: async (phoneData) => {
    const response = await api.post('/auth/login-with-phone', phoneData);
    return response.data;
  },
  
  requestOTP: async (otpRequest) => {
    const response = await api.post('/auth/request-otp', otpRequest);
    return response.data;
  },
  
  verifyOTP: async (otpData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Profile Management API
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },
  
  // Address Management
  getAddresses: async () => {
    const response = await api.get('/profile/addresses');
    return response.data;
  },
  
  addAddress: async (addressData) => {
    const response = await api.post('/profile/addresses', addressData);
    return response.data;
  },
  
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/profile/addresses/${addressId}`, addressData);
    return response.data;
  },
  
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/profile/addresses/${addressId}`);
    return response.data;
  },
  
  // Payment Methods
  getPaymentMethods: async () => {
    const response = await api.get('/profile/payment-methods');
    return response.data;
  },
  
  addPaymentMethod: async (paymentData) => {
    const response = await api.post('/profile/payment-methods', paymentData);
    return response.data;
  },
  
  updatePaymentMethod: async (paymentMethodId, paymentData) => {
    const response = await api.put(`/profile/payment-methods/${paymentMethodId}`, paymentData);
    return response.data;
  },
  
  deletePaymentMethod: async (paymentMethodId) => {
    const response = await api.delete(`/profile/payment-methods/${paymentMethodId}`);
    return response.data;
  },
  
  // Verification
  requestEmailVerification: async () => {
    const response = await api.post('/profile/verify-email');
    return response.data;
  },
  
  requestPhoneVerification: async () => {
    const response = await api.post('/profile/verify-phone');
    return response.data;
  },
  
  confirmEmailVerification: async (otpCode) => {
    const response = await api.post('/profile/confirm-email-verification', { otp_code: otpCode });
    return response.data;
  },
  
  confirmPhoneVerification: async (otpCode) => {
    const response = await api.post('/profile/confirm-phone-verification', { otp_code: otpCode });
    return response.data;
  }
};

// Quotes API
export const quotesAPI = {
  createQuote: async (quoteRequest, options = {}) => {
    const response = await api.post('/quotes', quoteRequest, options);
    return response.data;
  },
  
  getQuotes: async (params = {}) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },
  
  getQuote: async (quoteId) => {
    const response = await api.get(`/quotes/${quoteId}`);
    return response.data;
  },
  
  deleteQuote: async (quoteId) => {
    const response = await api.delete(`/quotes/${quoteId}`);
    return response.data;
  },
  
  // Priority Connections API endpoints
  getPriorityConnectionsCountries: async () => {
    const response = await api.get('/quotes/priority-connections/countries');
    return response.data;
  },
  
  getPriorityConnectionsProviders: async (countryName = null) => {
    const params = countryName ? { country_name: countryName } : {};
    const response = await api.get('/quotes/priority-connections/providers', { params });
    return response.data;
  },
  
  getPriorityConnectionsRates: async (countryName, weight = 1.0, parcelType = 'Parcel') => {
    const response = await api.get('/quotes/priority-connections/rates', {
      params: {
        country_name: countryName,
        weight: weight,
        parcel_type: parcelType
      }
    });
    return response.data;
  }
};

// Tracking API
export const trackingAPI = {
  trackSingle: async (awb) => {
    const response = await api.get(`/tracking/awb/${awb}`);
    return response.data;
  },
  
  trackBulk: async (awbNumbers) => {
    const response = await api.post('/tracking/bulk', { awb_numbers: awbNumbers });
    return response.data;
  },
  
  searchShipments: async (query, params = {}) => {
    const response = await api.get('/tracking/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/tracking/analytics');
    return response.data;
  },
  
  validateAwb: async (awb) => {
    const response = await api.get(`/tracking/validate-awb/${awb}`);
    return response.data;
  },
  
  getStatusDistribution: async () => {
    const response = await api.get('/tracking/status-distribution');
    return response.data;
  },
  
  // Enhanced tracking features
  setupNotifications: async (awb, notificationData) => {
    const response = await api.post(`/tracking/notify/${awb}`, notificationData);
    return response.data;
  },
  
  getRealTimeUpdates: async (awb, lastUpdate = null) => {
    const params = lastUpdate ? { last_update: lastUpdate } : {};
    const response = await api.get(`/tracking/real-time/${awb}`, { params });
    return response.data;
  },
  
  syncCarrierData: async (carrierName = null) => {
    const data = carrierName ? { carrier_name: carrierName } : {};
    const response = await api.post('/tracking/carrier-sync', data);
    return response.data;
  }
};

// Orders API (for user dashboard)
export const ordersAPI = {
  getMyShipments: async (params = {}) => {
    const response = await api.get('/orders/my-shipments', { params });
    return response.data;
  },
  
  getShipmentDetails: async (shipmentId) => {
    const response = await api.get(`/orders/${shipmentId}`);
    return response.data;
  },
  
  cancelShipment: async (shipmentId, cancelData) => {
    const response = await api.post(`/orders/${shipmentId}/cancel`, cancelData);
    return response.data;
  },
  
  rescheduleShipment: async (shipmentId, rescheduleData) => {
    const response = await api.post(`/orders/${shipmentId}/reschedule`, rescheduleData);
    return response.data;
  },
  
  downloadInvoice: async (shipmentId) => {
    const response = await api.get(`/orders/${shipmentId}/invoice`, { 
      responseType: 'blob' 
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  },
  
  downloadLabel: async (shipmentId) => {
    const response = await api.get(`/orders/${shipmentId}/label`, { 
      responseType: 'blob' 
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  },
  
  getAnalytics: async (days = 30) => {
    const response = await api.get('/orders/analytics/summary', { 
      params: { days } 
    });
    return response.data;
  }
};

// Bookings API
export const bookingsAPI = {
  createBooking: async (bookingRequest) => {
    const response = await api.post('/bookings', bookingRequest);
    return response.data;
  },
  
  getBookings: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },
  
  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },
  
  updateBooking: async (bookingId, updateData) => {
    const response = await api.put(`/bookings/${bookingId}`, updateData);
    return response.data;
  },
  
  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },
  
  trackByAWB: async (awb) => {
    const response = await api.get(`/bookings/track/${awb}`);
    return response.data;
  },
  
  simulateProgress: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/simulate-progress`);
    return response.data;
  },
  
  // Document generation endpoints
  downloadShippingLabel: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/shipping-label`, { 
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Verify we got a PDF blob
      if (response.data.type !== 'application/pdf') {
        throw new Error('Invalid response type - expected PDF');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      return url;
    } catch (error) {
      console.error('Error downloading shipping label:', error);
      throw error;
    }
  },
  
  downloadShippingInvoice: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/shipping-invoice`, { 
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Verify we got a PDF blob
      if (response.data.type !== 'application/pdf') {
        throw new Error('Invalid response type - expected PDF');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      return url;
    } catch (error) {
      console.error('Error downloading shipping invoice:', error);
      throw error;
    }
  },
  
  downloadPaymentReceipt: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/payment-receipt`, { 
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Verify we got a PDF blob
      if (response.data.type !== 'application/pdf') {
        throw new Error('Invalid response type - expected PDF');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      return url;
    } catch (error) {
      console.error('Error downloading payment receipt:', error);
      throw error;
    }
  }
};

// Shipments API
export const shipmentsAPI = {
  createShipment: async (shipmentData) => {
    const response = await api.post('/shipments', shipmentData);
    return response.data;
  },
  
  getShipments: async (params = {}) => {
    const response = await api.get('/shipments', { params });
    return response.data;
  },
  
  getShipment: async (shipmentId) => {
    const response = await api.get(`/shipments/${shipmentId}`);
    return response.data;
  },
  
  trackShipment: async (trackingNumber) => {
    const response = await api.get(`/shipments/track/${trackingNumber}`);
    return response.data;
  },
  
  initiatePayment: async (shipmentId) => {
    const response = await api.post(`/shipments/${shipmentId}/pay`);
    return response.data;
  }
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getMonthlyTrends: async (months = 6) => {
    const response = await api.get('/dashboard/trends', {
      params: { months }
    });
    return response.data;
  },
  
  getCarrierPerformance: async () => {
    const response = await api.get('/dashboard/carrier-performance');
    return response.data;
  },
  
  getRecentActivities: async (limit = 20) => {
    const response = await api.get('/dashboard/activities', {
      params: { limit }
    });
    return response.data;
  },
  
  // Saved Addresses
  getSavedAddresses: async (addressType = null) => {
    const params = addressType ? { address_type: addressType } : {};
    const response = await api.get('/dashboard/addresses', { params });
    return response.data;
  },
  
  createSavedAddress: async (addressData) => {
    const response = await api.post('/dashboard/addresses', addressData);
    return response.data;
  },
  
  updateSavedAddress: async (addressId, addressData) => {
    const response = await api.put(`/dashboard/addresses/${addressId}`, addressData);
    return response.data;
  },
  
  deleteSavedAddress: async (addressId) => {
    const response = await api.delete(`/dashboard/addresses/${addressId}`);
    return response.data;
  }
};

// Utility API calls
export const utilAPI = {
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
