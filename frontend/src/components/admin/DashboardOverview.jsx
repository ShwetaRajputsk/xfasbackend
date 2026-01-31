import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TruckIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/outline';
import api from '../../services/api';

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data: ' + error.message);
      // Don't use mock data - show real error
    } finally {
      setLoading(false);
    }
  };

  const getMockDashboardData = () => ({
    stats: {
      total_users: 1247,
      active_users: 892,
      new_users_this_month: 89,
      user_growth_rate: 12.5,
      total_shipments: 3456,
      active_shipments: 234,
      completed_shipments: 3102,
      shipments_today: 42,
      shipments_this_month: 567,
      total_revenue: 245678.90,
      revenue_this_month: 34567.80,
      revenue_today: 2345.60,
      average_order_value: 78.45,
      overall_success_rate: 96.8,
      average_delivery_time: 3.2,
      customer_satisfaction: 4.5
    },
    recent_shipments: [
      {
        id: '1',
        shipment_number: 'XF240001',
        sender_name: 'John Doe',
        recipient_name: 'Jane Smith',
        status: 'in_transit',
        carrier: 'XFas Self Network',
        created_at: '2024-01-15T10:30:00Z',
        amount: 150.00
      },
      {
        id: '2',
        shipment_number: 'XF240002',
        sender_name: 'ABC Corp',
        recipient_name: 'XYZ Ltd',
        status: 'delivered',
        carrier: 'FedEx',
        created_at: '2024-01-15T09:15:00Z',
        amount: 89.50
      },
      {
        id: '3',
        shipment_number: 'XF240003',
        sender_name: 'Sarah Wilson',
        recipient_name: 'Mike Johnson',
        status: 'pickup_scheduled',
        carrier: 'DHL',
        created_at: '2024-01-15T08:45:00Z',
        amount: 67.30
      }
    ],
    system_alerts: [
      {
        id: 1,
        title: 'High volume detected',
        message: 'Booking volume is 40% higher than usual',
        severity: 3,
        alert_type: 'warning',
        created_at: '2024-01-15T11:00:00Z'
      },
      {
        id: 2,
        title: 'KYC documents pending',
        message: '12 documents require verification',
        severity: 2,
        alert_type: 'info',
        created_at: '2024-01-15T10:30:00Z'
      }
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  
  const statCards = [
    {
      name: 'Total Users',
      value: stats.total_users?.toLocaleString() || '0',
      change: `+${stats.user_growth_rate || 0}%`,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Shipments',
      value: stats.active_shipments?.toLocaleString() || '0',
      change: `${stats.shipments_today || 0} today`,
      changeType: 'neutral',
      icon: TruckIcon,
      color: 'bg-orange-500'
    },
    {
      name: 'Revenue (Month)',
      value: `₹${stats.revenue_this_month?.toLocaleString() || '0'}`,
      change: `₹${stats.revenue_today?.toLocaleString() || '0'} today`,
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Success Rate',
      value: `${stats.overall_success_rate || 0}%`,
      change: `${stats.average_delivery_time || 0} days avg`,
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    }
  ];

  const getStatusColor = (status) => {
    const statusColors = {
      'delivered': 'text-green-600 bg-green-100',
      'in_transit': 'text-blue-600 bg-blue-100',
      'pickup_scheduled': 'text-yellow-600 bg-yellow-100',
      'booked': 'text-gray-600 bg-gray-100',
      'exception': 'text-red-600 bg-red-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_transit':
        return <TruckIcon className="w-4 h-4" />;
      case 'pickup_scheduled':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <TruckIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your logistics operations and key metrics
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={fetchDashboardData}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' :
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.changeType === 'increase' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
                  {stat.changeType === 'decrease' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Shipments</h3>
              <Link
                to="/admin/bookings"
                className="text-sm text-orange-600 hover:text-orange-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData?.recent_shipments?.map((shipment) => (
              <div key={shipment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(shipment.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {shipment.shipment_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {shipment.sender_name} → {shipment.recipient_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-900">
                      ₹{shipment.amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData?.system_alerts?.map((alert) => (
              <div key={alert.id} className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <ExclamationIcon className={`w-5 h-5 ${
                      alert.severity >= 3 ? 'text-red-500' :
                      alert.severity >= 2 ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-500">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <Link
              to="/admin/alerts"
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              View all alerts
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/bookings"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <TruckIcon className="w-6 h-6 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Bookings</p>
                <p className="text-xs text-gray-500">View and update shipments</p>
              </div>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <UsersIcon className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">User Management</p>
                <p className="text-xs text-gray-500">Manage user accounts</p>
              </div>
            </Link>
            <Link
              to="/admin/kyc"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">KYC Review</p>
                <p className="text-xs text-gray-500">Verify documents</p>
              </div>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChartBarIcon className="w-6 h-6 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Analytics</p>
                <p className="text-xs text-gray-500">View reports</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;