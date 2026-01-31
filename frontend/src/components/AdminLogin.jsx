import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import api from '../services/api';

const AdminLogin = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.access_token) {
        // Check if user has admin role (support both uppercase and lowercase)
        const adminRoles = [
          'super_admin', 'admin', 'manager', 'support',
          'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT'
        ];
        
        if (!response.data.user.role || !adminRoles.includes(response.data.user.role)) {
          setError('Access denied. Admin privileges required.');
          return;
        }
        
        // Store the token (both admin_token and xfas_token for compatibility)
        localStorage.setItem('admin_token', response.data.access_token);
        localStorage.setItem('xfas_token', response.data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        localStorage.setItem('xfas_user', JSON.stringify(response.data.user));
        
        // Update API instance with the token
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        // Call the success callback
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-orange-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            XFas Logistics Management Console
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign in to your admin account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@xfas.in"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                For admin access only. Contact IT support if you need assistance.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>© 2024 XFas Logistics. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;