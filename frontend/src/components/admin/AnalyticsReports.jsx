import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  RefreshIcon,
  DownloadIcon
} from '@heroicons/react/outline';
import api from '../../services/api';

const AnalyticsReports = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedDays]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch multiple analytics endpoints
      const [dailyBookingsResponse, courierUsageResponse, revenueResponse] = await Promise.all([
        api.get(`/admin/analytics/daily-bookings?days=${selectedDays}`),
        api.get(`/admin/analytics/courier-usage?days=${selectedDays}`),
        api.get(`/admin/analytics/revenue-report?period=${selectedPeriod}&months=12`)
      ]);

      const data = {
        dailyBookings: dailyBookingsResponse.data,
        courierUsage: courierUsageResponse.data,
        revenue: revenueResponse.data
      };

      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics: ' + error.message);
      
      // Use mock data as fallback when API fails
      const data = {
        dailyBookings: getMockDailyData(),
        courierUsage: getMockCourierData(),
        revenue: getMockRevenueData()
      };
      
      setAnalyticsData(data);
    } finally {
      setLoading(false);
    }
  };

  const getMockDailyData = () => ({
    daily_report: [
      { date: '2024-01-15', bookings_count: 45, total_revenue: 8750.00, average_value: 194.44 },
      { date: '2024-01-16', bookings_count: 38, total_revenue: 7200.00, average_value: 189.47 },
      { date: '2024-01-17', bookings_count: 52, total_revenue: 9800.00, average_value: 188.46 },
      { date: '2024-01-18', bookings_count: 41, total_revenue: 8100.00, average_value: 197.56 },
      { date: '2024-01-19', bookings_count: 48, total_revenue: 9200.00, average_value: 191.67 }
    ]
  });

  const getMockCourierData = () => ({
    courier_usage: [
      { carrier_name: 'XFas Self Network', total_shipments: 150, shipment_percentage: 40, total_revenue: 28500, revenue_percentage: 42, success_rate: 96.8 },
      { carrier_name: 'FedEx', total_shipments: 120, shipment_percentage: 32, total_revenue: 22000, revenue_percentage: 32, success_rate: 94.2 },
      { carrier_name: 'DHL', total_shipments: 70, shipment_percentage: 18, total_revenue: 13500, revenue_percentage: 20, success_rate: 95.1 },
      { carrier_name: 'UPS', total_shipments: 35, shipment_percentage: 10, total_revenue: 4200, revenue_percentage: 6, success_rate: 92.8 }
    ]
  });

  const getMockRevenueData = () => ({
    revenue_report: [
      { period: '2024-01', total_revenue: 45000, shipment_count: 250, avg_order_value: 180 },
      { period: '2024-02', total_revenue: 52000, shipment_count: 290, avg_order_value: 179 },
      { period: '2024-03', total_revenue: 48000, shipment_count: 275, avg_order_value: 175 },
      { period: '2024-04', total_revenue: 58000, shipment_count: 320, avg_order_value: 181 }
    ],
    summary: { total_revenue: 203000, total_shipments: 1135, average_order_value: 179 }
  });

  const calculateTrend = (data, field) => {
    if (!data || data.length < 2) return { percentage: 0, direction: 'neutral' };
    const current = data[data.length - 1][field];
    const previous = data[data.length - 2][field];
    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show error message if there's an error and no data
  if (error && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no data available
  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Showing Demo Data</h3>
              <div className="mt-2 text-sm text-yellow-700">
                {error}. Displaying sample data for demonstration purposes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Analytics & Reports
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive business analytics and performance metrics
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analyticsData?.dailyBookings?.daily_report?.reduce((sum, day) => sum + day.bookings_count, 0) || 0}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              {(() => {
                const trend = calculateTrend(analyticsData?.dailyBookings?.daily_report || [], 'bookings_count');
                return (
                  <div className={`flex items-center text-sm ${
                    trend.direction === 'up' ? 'text-green-600' :
                    trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {trend.direction === 'up' && <TrendingUpIcon className="w-4 h-4 mr-1" />}
                    {trend.direction === 'down' && <TrendingDownIcon className="w-4 h-4 mr-1" />}
                    <span>{trend.percentage}% from yesterday</span>
                  </div>
                );
              })()
            }
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{(analyticsData?.revenue?.summary?.total_revenue || 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                <span>12.5% from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Order Value</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{analyticsData?.revenue?.summary?.average_order_value || 0}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-purple-600">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                <span>8.2% increase</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analyticsData?.courierUsage?.courier_usage?.length ? 
                      (analyticsData.courierUsage.courier_usage.reduce((sum, courier) => sum + courier.success_rate, 0) / analyticsData.courierUsage.courier_usage.length).toFixed(1) : 
                      '0.0'}%
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                <span>2.1% improvement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daily Bookings Trend</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(analyticsData?.dailyBookings?.daily_report || []).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-500">{day.bookings_count} bookings</div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${analyticsData?.dailyBookings?.daily_report?.length ? 
                            (day.bookings_count / Math.max(...analyticsData.dailyBookings.daily_report.map(d => d.bookings_count))) * 100 : 
                            0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-4">
                    ₹{day.total_revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Courier Usage Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Courier Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(analyticsData?.courierUsage?.courier_usage || []).map((courier, index) => (
                <div key={courier.carrier_name} className="">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">{courier.carrier_name}</div>
                    <div className="text-sm text-gray-500">{courier.shipment_percentage}% share</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-orange-500' :
                            index === 1 ? 'bg-blue-500' :
                            index === 2 ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${courier.shipment_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {courier.total_shipments} shipments
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {courier.success_rate}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Monthly Revenue Report</h3>
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(analyticsData?.revenue?.revenue_report || []).map((period, index) => {
                const prevPeriod = analyticsData?.revenue?.revenue_report?.[index - 1];
                const growth = prevPeriod ? 
                  ((period.total_revenue - prevPeriod.total_revenue) / prevPeriod.total_revenue) * 100 : 0;
                
                return (
                  <tr key={period.period} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(period.period + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{period.total_revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.shipment_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{period.avg_order_value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {index > 0 && (
                        <span className={`inline-flex items-center ${
                          growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {growth > 0 && <TrendingUpIcon className="w-4 h-4 mr-1" />}
                          {growth < 0 && <TrendingDownIcon className="w-4 h-4 mr-1" />}
                          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;
