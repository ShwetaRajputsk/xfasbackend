import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, TruckIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { authAPI } from '../../services/api';

const AdminLogin = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      // Check if user has admin role (support both uppercase and lowercase)
      const adminRoles = [
        'super_admin', 'admin', 'manager', 'support',
        'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT'
      ];
      if (!data.user.role || !adminRoles.includes(data.user.role)) {
        setError('Access denied. Admin privileges required.');
        return;
      }

      // Store admin credentials (both admin_token and xfas_token for compatibility)
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('xfas_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      localStorage.setItem('xfas_user', JSON.stringify(data.user));
      
      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess({
          token: data.access_token,
          user: data.user
        });
      }

      // Navigate to admin dashboard
      navigate('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-orange-500 rounded-lg">
            <TruckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            XFas Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your admin account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
              </span>
              {loading ? 'Signing in...' : 'Sign in to Admin Portal'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              ← Back to main website
            </Link>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Admin Credentials:</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <div><strong>Super Admin:</strong></div>
              <div>Email: admin@xfas.in</div>
              <div>Password: XFasAdmin@2024</div>
              <div className="mt-2"><strong>Manager:</strong></div>
              <div>Email: manager@xfas.in</div>
              <div>Password: XFasManager@2024</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;