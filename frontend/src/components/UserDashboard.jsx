import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, Clock, CheckCircle, 
  Plus, Settings, User, MapPin, CreditCard,
  BarChart3, Activity, Bell, Calendar, Calculator, Shield,
  Search, Building2, Home, Warehouse, Store, Edit, Trash2, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import DashboardStats from './dashboard/DashboardStats';
import { dashboardAPI, shipmentsAPI } from '../services/api';
import AddAddressModal from './addressbook/AddAddressModal';
import EditAddressModal from './addressbook/EditAddressModal';
import AddressStats from './addressbook/AddressStats';
import MyShipments from './MyShipments';
import api from '../services/api';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Address book state
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSummary, setAddressSummary] = useState(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'shipments' && user) {
      fetchShipments();
    }
    if (activeTab === 'addresses' && user) {
      fetchAddresses();
      fetchAddressBookSummary();
    }
  }, [activeTab, user]);
  
  // Filter addresses based on search and filter
  useEffect(() => {
    let filtered = addresses;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(address =>
        address.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'pickup') {
        filtered = filtered.filter(addr => addr.address_type === 'pickup' || addr.address_type === 'both');
      } else if (activeFilter === 'delivery') {
        filtered = filtered.filter(addr => addr.address_type === 'delivery' || addr.address_type === 'both');
      } else {
        filtered = filtered.filter(addr => addr.category === activeFilter);
      }
    }
    
    setFilteredAddresses(filtered);
  }, [addresses, searchQuery, activeFilter]);
  
  const fetchShipments = async () => {
    if (!user) return;
    
    setShipmentsLoading(true);
    try {
      const shipmentsResponse = await shipmentsAPI.getShipments({
        limit: 10,
        skip: 0
      });
      setShipments(shipmentsResponse);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({
        title: "Error Loading Shipments",
        description: "Could not load shipments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShipmentsLoading(false);
    }
  };
  
  // Address book functions
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await api.get('/address-book/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchAddressBookSummary = async () => {
    try {
      const response = await api.get('/address-book/summary');
      setAddressSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      const response = await api.post('/address-book/addresses', addressData);
      const newAddress = response.data;
      setAddresses(prev => [newAddress, ...prev]);
      setShowAddModal(false);
      toast({
        title: "Success",
        description: "Address added successfully",
      });
      fetchAddressBookSummary();
    } catch (error) {
      console.error('Error adding address:', error);
      let errorMessage = 'Failed to add address';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle Pydantic validation errors
        if (Array.isArray(errorData.detail)) {
          // Format validation errors
          const validationErrors = errorData.detail.map(err => {
            const field = err.loc ? err.loc.join('.') : 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditAddress = async (addressId, addressData) => {
    try {
      const response = await api.put(`/address-book/addresses/${addressId}`, addressData);
      const updatedAddress = response.data;
      setAddresses(prev => prev.map(addr => 
        addr.id === addressId ? updatedAddress : addr
      ));
      setShowEditModal(false);
      setEditingAddress(null);
      toast({
        title: "Success",
        description: "Address updated successfully",
      });
      fetchAddressBookSummary();
    } catch (error) {
      console.error('Error updating address:', error);
      let errorMessage = 'Failed to update address';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle Pydantic validation errors
        if (Array.isArray(errorData.detail)) {
          // Format validation errors
          const validationErrors = errorData.detail.map(err => {
            const field = err.loc ? err.loc.join('.') : 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await api.delete(`/address-book/addresses/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
      fetchAddressBookSummary();
    } catch (error) {
      console.error('Error deleting address:', error);
      let errorMessage = 'Failed to delete address';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId, addressType) => {
    try {
      await api.post(`/address-book/addresses/${addressId}/set-default`, { address_type: addressType });
      fetchAddresses();
      fetchAddressBookSummary();
      toast({
        title: "Success",
        description: `Set as default ${addressType} address`,
      });
    } catch (error) {
      console.error('Error setting default:', error);
      let errorMessage = 'Failed to set default address';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setShowEditModal(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'home': return Home;
      case 'office': return Building2;
      case 'warehouse': return Warehouse;
      case 'shop': return Store;
      default: return MapPin;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Addresses', icon: MapPin },
    { value: 'pickup', label: 'Pickup', icon: MapPin },
    { value: 'delivery', label: 'Delivery', icon: MapPin },
    { value: 'home', label: 'Home', icon: Home },
    { value: 'office', label: 'Office', icon: Building2 },
    { value: 'warehouse', label: 'Warehouse', icon: Warehouse },
    { value: 'shop', label: 'Shop', icon: Store },
  ];

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch real dashboard data from backend
      const dashboardResponse = await dashboardAPI.getDashboardData();
      
      // If the API call succeeds, use the real data
      setDashboardData(dashboardResponse);
    } catch (error) {
      console.error('Dashboard API error:', error);
      
      // Fallback to mock data if API fails
      const fallbackData = {
        stats: {
          total_shipments: 0,
          active_shipments: 0,
          delivered_shipments: 0,
          pending_shipments: 0,
          total_spent: 0,
          this_month_spent: 0,
          success_rate: 0,
          on_time_delivery_rate: 0,
          average_delivery_time: 0,
          cancelled_shipments: 0,
          shipments_this_week: 0,
          shipments_this_month: 0,
          average_shipment_cost: 0,
          favorite_carrier: 'N/A',
          last_shipment_date: null
        },
        recent_activities: [],
        notifications: [
          {
            type: 'info',
            message: 'Welcome to XFas Logistics! Complete your profile to get started.',
            timestamp: new Date().toISOString()
          }
        ],
        monthly_trends: [],
        carrier_performance: [],
        quick_actions: [
          { title: 'Ship Now', description: 'Create a new shipment', action: 'create_shipment', icon: 'package' },
          { title: 'Get Quote', description: 'Compare shipping rates', action: 'get_quote', icon: 'calculator' },
          { title: 'Track Package', description: 'Track your shipments', action: 'track_shipment', icon: 'search' },
          { title: 'Address Book', description: 'Manage saved addresses', action: 'manage_addresses', icon: 'address-book' }
        ]
      };
      
      setDashboardData(fallbackData);
      
      toast({
        title: "Using Demo Data",
        description: "Dashboard is showing demo data. Create some shipments to see your real statistics.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Ship Now",
      description: "Create a new shipment",
      icon: Package,
      action: () => window.location.href = '/quote',
      color: "bg-orange-500"
    },
    {
      title: "Track Package",
      description: "Track your shipments",
      icon: MapPin,
      action: () => window.location.href = '/track',
      color: "bg-blue-500"
    },
    {
      title: "Get Quote",
      description: "Compare shipping rates",
      icon: Calculator,
      action: () => window.location.href = '/quote',
      color: "bg-green-500"
    },
    {
      title: "Address Book",
      description: "Manage saved addresses",
      icon: User,
      action: () => setActiveTab('addresses'),
      color: "bg-purple-500"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to access your dashboard.</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm h-64"></div>
              <div className="bg-white p-6 rounded-lg shadow-sm h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.first_name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your shipments and track your logistics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <Activity className="w-4 h-4 mr-2" />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('profile')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => window.location.href = '/quote'}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Shipment
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            {dashboardData && (
              <DashboardStats stats={dashboardData.stats} />
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={action.action}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recent_activities?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recent_activities.slice(0, 5).map((activity, index) => {
                        const getActivityIcon = (type) => {
                          switch(type) {
                            case 'shipment_created': return Package;
                            case 'status_update': return TrendingUp;
                            case 'payment': return CreditCard;
                            default: return Activity;
                          }
                        };
                        
                        const ActivityIcon = getActivityIcon(activity.activity_type);
                        
                        return (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <ActivityIcon className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-sm text-gray-900">{activity.description}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                  {new Date(activity.timestamp).toLocaleDateString()}
                                </p>
                                {activity.awb && (
                                  <Badge variant="outline" className="text-xs">
                                    AWB: {activity.awb}
                                  </Badge>
                                )}
                              </div>
                              {activity.metadata?.cost && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Amount: ₹{activity.metadata.cost}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab('shipments')}
                      >
                        View All Activities
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No recent activities</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {dashboardData?.stats?.total_shipments > 0 ? 
                          'Your recent activities will appear here' : 
                          'Start by creating your first shipment'}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => window.location.href = '/quote'}
                      >
                        {dashboardData?.stats?.total_shipments > 0 ? 
                          'Create New Shipment' : 'Create Your First Shipment'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.notifications?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.notifications.map((notification, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border-l-4 ${
                            notification.type === 'success' ? 'border-green-400 bg-green-50' :
                            notification.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                            notification.type === 'error' ? 'border-red-400 bg-red-50' :
                            'border-blue-400 bg-blue-50'
                          }`}
                        >
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No new notifications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Shipments Tab */}
          <TabsContent value="shipments">
            <MyShipments />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    <span>Shipping Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.stats?.total_shipments > 0 ? (
                    <div className="space-y-6">
                      {/* Monthly Trends */}
                      {dashboardData.monthly_trends && dashboardData.monthly_trends.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Monthly Trends</h4>
                          <div className="space-y-2">
                            {dashboardData.monthly_trends.slice(0, 6).map((trend, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">
                                  {trend.month} {trend.year}
                                </span>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{trend.shipment_count} shipments</p>
                                  <p className="text-xs text-gray-500">₹{trend.total_cost}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Carrier Performance */}
                      {dashboardData.carrier_performance && dashboardData.carrier_performance.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Top Carriers</h4>
                          <div className="space-y-2">
                            {dashboardData.carrier_performance.slice(0, 3).map((carrier, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">{carrier.carrier_name}</span>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{carrier.total_shipments} shipments</p>
                                  <p className="text-xs text-gray-500">{carrier.success_rate.toFixed(1)}% success</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                      <p className="text-gray-600 mb-6">Start shipping to see your analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Shipments</span>
                      <span className="font-semibold">
                        {dashboardData?.stats?.total_shipments || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delivered</span>
                      <span className="font-semibold">
                        {dashboardData?.stats?.delivered_shipments || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-semibold">
                        {dashboardData?.stats?.success_rate ? 
                          `${dashboardData.stats.success_rate.toFixed(1)}%` : '--'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">On-Time Delivery</span>
                      <span className="font-semibold">
                        {dashboardData?.stats?.on_time_delivery_rate ? 
                          `${dashboardData.stats.on_time_delivery_rate.toFixed(1)}%` : '--'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="font-semibold">
                        ₹{dashboardData?.stats?.total_spent || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">
                        ₹{dashboardData?.stats?.this_month_spent || 0}
                      </span>
                    </div>
                    {dashboardData?.stats?.favorite_carrier && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Favorite Carrier</span>
                        <span className="font-semibold">
                          {dashboardData.stats.favorite_carrier}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
                <p className="text-gray-600">Manage your pickup and delivery addresses</p>
              </div>
              <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>

            {/* Summary Stats */}
            {addressSummary && <AddressStats summary={addressSummary} />}

            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search addresses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant={activeFilter === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveFilter(option.value)}
                          className={activeFilter === option.value ? "bg-orange-500 hover:bg-orange-600" : ""}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses Grid */}
            {addressesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-40 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAddresses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900">No addresses found</h3>
                  <p className="mt-1 text-sm text-gray-500 mb-6">
                    {searchQuery || activeFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by adding your first address.'
                    }
                  </p>
                  {!searchQuery && activeFilter === 'all' && (
                    <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Address
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAddresses.map((address) => {
                  const CategoryIcon = getCategoryIcon(address.category);
                  
                  const getAddressTypeColor = (type) => {
                    switch (type) {
                      case 'pickup': return 'bg-blue-100 text-blue-800';
                      case 'delivery': return 'bg-green-100 text-green-800';
                      case 'both': return 'bg-purple-100 text-purple-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  const getCategoryColor = (category) => {
                    switch (category) {
                      case 'home': return 'bg-pink-100 text-pink-800';
                      case 'office': return 'bg-blue-100 text-blue-800';
                      case 'warehouse': return 'bg-yellow-100 text-yellow-800';
                      case 'shop': return 'bg-green-100 text-green-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <Card key={address.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <CategoryIcon className="h-5 w-5 text-orange-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {address.label}
                              </h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge className={getAddressTypeColor(address.address_type)}>
                                  {address.address_type === 'both' ? 'Pickup & Delivery' : address.address_type}
                                </Badge>
                                <Badge variant="secondary" className={getCategoryColor(address.category)}>
                                  {address.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Default Status */}
                          {(address.is_default_pickup || address.is_default_delivery) && (
                            <div className="flex flex-col space-y-1">
                              {address.is_default_pickup && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default Pickup
                                </Badge>
                              )}
                              {address.is_default_delivery && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default Delivery
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Address Details */}
                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{address.name}</p>
                            {address.company && <p className="text-gray-500">{address.company}</p>}
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.postal_code}</p>
                            {address.landmark && <p className="text-gray-500">Near {address.landmark}</p>}
                          </div>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">{address.email}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(address)}
                            className="flex-1 min-w-0"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          
                          {/* Set Default Buttons */}
                          {(address.address_type === 'pickup' || address.address_type === 'both') && !address.is_default_pickup && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(address.id, 'pickup')}
                              className="text-xs"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Default Pickup
                            </Button>
                          )}
                          
                          {(address.address_type === 'delivery' || address.address_type === 'both') && !address.is_default_delivery && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(address.id, 'delivery')}
                              className="text-xs"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Default Delivery
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {/* Modals */}
            <AddAddressModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSave={handleAddAddress}
            />

            <EditAddressModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setEditingAddress(null);
              }}
              onSave={handleEditAddress}
              address={editingAddress}
            />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-orange-500" />
                    <span>Profile Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Profile Completion</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Email verified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Phone verification pending</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Profile Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/profile'}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('addresses')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Manage Addresses
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = '/profile'}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Phone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;