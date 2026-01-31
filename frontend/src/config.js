/**
 * Centralized Configuration Management for XFas Logistics Frontend
 * 
 * This module provides a single source of truth for all configuration settings
 * including API URLs, timeouts, and other environment-specific values.
 * All settings can be overridden via environment variables (REACT_APP_*).
 */

const config = {
  // ==================== API Configuration ====================
  API_URL: process.env.REACT_APP_API_URL || 'https://xfasbackend-1.onrender.com/api',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10),
  API_VERSION: process.env.REACT_APP_API_VERSION || '1.0.0',
  
  // ==================== Environment Configuration ====================
  ENVIRONMENT: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',
  DEBUG: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  
  // ==================== Frontend Configuration ====================
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000',
  FRONTEND_PORT: parseInt(process.env.REACT_APP_FRONTEND_PORT || '3000', 10),
  
  // ==================== Payment Configuration ====================
  STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
  
  // ==================== Third-party Services ====================
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  ANALYTICS_ID: process.env.REACT_APP_ANALYTICS_ID || '',
  
  // ==================== Feature Flags ====================
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_LOGS: process.env.REACT_APP_ENABLE_DEBUG_LOGS === 'true' || process.env.NODE_ENV === 'development',
  
  // ==================== Local Storage Keys ====================
  STORAGE_KEYS: {
    TOKEN: 'xfas_token',
    ADMIN_TOKEN: 'admin_token',
    USER: 'xfas_user',
    ADMIN_USER: 'admin_user',
  },
  
  // ==================== Helper Methods ====================
  /**
   * Get the complete API base URL
   */
  getApiUrl: () => {
    const url = config.API_URL;
    // Ensure URL doesn't end with a slash
    return url.endsWith('/') ? url.slice(0, -1) : url;
  },
  
  /**
   * Get the complete API endpoint URL
   */
  getApiEndpoint: (endpoint) => {
    const baseUrl = config.getApiUrl();
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  },
  
  /**
   * Check if running in production
   */
  isProduction: () => {
    return config.ENVIRONMENT === 'production';
  },
  
  /**
   * Check if running in development
   */
  isDevelopment: () => {
    return config.ENVIRONMENT === 'development';
  },
  
  /**
   * Print current configuration (excluding sensitive data)
   */
  printConfig: () => {
    if (config.ENABLE_DEBUG_LOGS) {
      console.log('='.repeat(50));
      console.log('XFas Logistics Frontend Configuration');
      console.log('='.repeat(50));
      console.log(`Environment: ${config.ENVIRONMENT}`);
      console.log(`API URL: ${config.getApiUrl()}`);
      console.log(`Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`API Timeout: ${config.API_TIMEOUT}ms`);
      console.log(`Debug Mode: ${config.DEBUG}`);
      console.log('='.repeat(50));
    }
  },
  
  /**
   * Validate critical configuration settings
   */
  validate: () => {
    const errors = [];
    
    if (!config.API_URL) {
      errors.push('API_URL is required');
    }
    
    if (config.isProduction() && !config.API_URL.startsWith('https://')) {
      console.warn('Warning: API_URL should use HTTPS in production');
    }
    
    if (errors.length > 0) {
      console.error('Configuration errors:', errors);
      return false;
    }
    
    return true;
  }
};

// Validate configuration on load
config.validate();

// Print configuration in development mode
if (config.isDevelopment() || config.ENABLE_DEBUG_LOGS) {
  config.printConfig();
}

export default config;

