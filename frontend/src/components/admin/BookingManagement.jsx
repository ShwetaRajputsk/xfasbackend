import React, { useState, useEffect } from 'react';
import { 
  SearchIcon, 
  FilterIcon, 
  EyeIcon,
  PencilIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationIcon,
  RefreshIcon
} from '@heroicons/react/outline';
import api from '../../services/api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    carrier: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams({
        limit: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        ...(filters.status && { status_filter: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/admin/bookings?${params}`);
      setBookings(response.data.data.bookings);
      setPagination(prev => ({ ...prev, total: response.data.data.total_count }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings: ' + error.message);
      // Don't use mock data - show real error
    } finally {
      setLoading(false);
    }
  };

  const getMockBookings = () => [
    {
      id: '1',
      shipment_number: 'XF240001',
      awb: 'XF1234567890',
      status: 'in_transit',
      carrier: 'XFas Self Network',
      sender_name: 'John Doe',
      sender_city: 'Mumbai',
      recipient_name: 'Jane Smith',
      recipient_city: 'Delhi',
      created_at: '2024-01-15T10:30:00Z',
      estimated_delivery: '2024-01-17T18:00:00Z',
      amount: 150.00,
      user_email: 'john@example.com'
    },
    {
      id: '2',
      shipment_number: 'XF240002',
      awb: 'FX9876543210',
      status: 'delivered',
      carrier: 'FedEx',
      sender_name: 'ABC Corp',
      sender_city: 'Bangalore',
      recipient_name: 'XYZ Ltd',
      recipient_city: 'Chennai',
      created_at: '2024-01-14T09:15:00Z',
      actual_delivery: '2024-01-16T14:30:00Z',
      amount: 89.50,
      user_email: 'abc@corp.com'
    },
    {
      id: '3',
      shipment_number: 'XF240003',
      awb: 'DH5555444433',
      status: 'pickup_scheduled',
      carrier: 'DHL',
      sender_name: 'Sarah Wilson',
      sender_city: 'Pune',
      recipient_name: 'Mike Johnson',
      recipient_city: 'Hyderabad',
      created_at: '2024-01-15T08:45:00Z',
      estimated_delivery: '2024-01-18T16:00:00Z',
      amount: 67.30,
      user_email: 'sarah@example.com'
    }
  ];

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { new_status: newStatus });
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'bg-green-100 text-green-800',
      'in_transit': 'bg-blue-100 text-blue-800',
      'pickup_scheduled': 'bg-yellow-100 text-yellow-800',
      'booked': 'bg-gray-100 text-gray-800',
      'out_for_delivery': 'bg-purple-100 text-purple-800',
      'exception': 'bg-red-100 text-red-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <TruckIcon className="w-4 h-4" />;
      case 'pickup_scheduled':
      case 'booked':
        return <ClockIcon className="w-4 h-4" />;
      case 'exception':
      case 'cancelled':
        return <ExclamationIcon className="w-4 h-4" />;
      default:
        return <TruckIcon className="w-4 h-4" />;
    }
  };

  const statusOptions = [
    'booked',
    'pickup_scheduled', 
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'exception',
    'cancelled'
  ];

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Booking Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all shipment bookings
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={fetchBookings}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Bookings</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by AWB, shipment number..."
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={filters.carrier}
              onChange={(e) => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
            >
              <option value="">All Carriers</option>
              <option value="XFas Self Network">XFas Self Network</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="UPS">UPS</option>
              <option value="Aramex">Aramex</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Bookings ({pagination.total})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.shipment_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          AWB: {booking.awb}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{booking.sender_name}</div>
                        <div className="text-gray-500">{booking.sender_city}</div>
                      </div>
                      <div className="text-xs text-gray-400 my-1">↓</div>
                      <div className="text-sm text-gray-900">
                        <div>{booking.recipient_name}</div>
                        <div className="text-gray-500">{booking.recipient_city}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.carrier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{booking.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-orange-600 hover:text-orange-900"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.page - 1) * pagination.limit) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;