import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

const AdminApp = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      const adminUserData = localStorage.getItem('admin_user');

      if (adminToken && adminUserData) {
        const user = JSON.parse(adminUserData);
        
        // Check if user has admin role
        const adminRoles = ['super_admin', 'admin', 'manager'];
        if (user.role && adminRoles.includes(user.role)) {
          setIsAdminAuthenticated(true);
          setAdminUser(user);
        } else {
          // Clear invalid admin session
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (authData) => {
    setIsAdminAuthenticated(true);
    setAdminUser(authData.user);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAdminAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : (
            <AdminLogin onLoginSuccess={handleAdminLogin} />
          )
        } 
      />
      <Route 
        path="/*" 
        element={
          isAdminAuthenticated ? (
            <AdminDashboard 
              user={adminUser} 
              onLogout={handleAdminLogout} 
            />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        } 
      />
    </Routes>
  );
};

export default AdminApp;