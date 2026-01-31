import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  MenuAlt1Icon,
  SearchIcon,
  UserCircleIcon,
  LogoutIcon,
  CogIcon,
  RefreshIcon
} from '@heroicons/react/outline';

const AdminHeader = ({ sidebarOpen, setSidebarOpen, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'New booking received',
      message: '5 new bookings in the last hour',
      time: '5 min ago',
      type: 'info',
      unread: true
    },
    {
      id: 2,
      title: 'KYC pending review',
      message: '3 KYC documents require verification',
      time: '15 min ago',
      type: 'warning',
      unread: true
    },
    {
      id: 3,
      title: 'System sync completed',
      message: 'Carrier tracking sync finished successfully',
      time: '1 hour ago',
      type: 'success',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <MenuAlt1Icon className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings, users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Sync button */}
          <button
            onClick={() => {
              // Trigger manual sync
              console.log('Manual sync triggered');
            }}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
            title="Sync tracking updates"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-md border ${
                          notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-500">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Link
                      to="/admin/notifications"
                      className="text-sm text-orange-600 hover:text-orange-500"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img className="h-8 w-8 rounded-full" src={user.avatar} alt={user.first_name} />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user.role || 'Admin'}
                </div>
              </div>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <Link
                    to="/admin/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <CogIcon className="w-4 h-4 mr-3" />
                    Admin Settings
                  </Link>
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircleIcon className="w-4 h-4 mr-3" />
                    Admin Profile
                  </Link>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogoutIcon className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;