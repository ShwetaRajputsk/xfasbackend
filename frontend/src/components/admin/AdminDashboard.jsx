import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardOverview from './DashboardOverview';
import BookingManagement from './BookingManagement';
import UserManagement from './UserManagement';
import CourierRateManagement from './CourierRateManagement';
import KYCManagement from './KYCManagement';
import AnalyticsReports from './AnalyticsReports';
import TrackingManagement from './TrackingManagement';
import AdminSettings from './AdminSettings';

const AdminDashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <AdminHeader 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={onLogout}
        />

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="rates" element={<CourierRateManagement />} />
            <Route path="kyc" element={<KYCManagement />} />
            <Route path="analytics" element={<AnalyticsReports />} />
            <Route path="tracking" element={<TrackingManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;