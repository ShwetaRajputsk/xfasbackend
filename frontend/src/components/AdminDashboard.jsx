import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  UserCheck,
  Truck,
  Eye,
  Edit3,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // State for various management screens
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [carrierRates, setCarrierRates] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  
  // Pagination and filters
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  // Dialog states
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [editingRate, setEditingRate] = useState(null);

  // Form states
  const [rateForm, setRateForm] = useState({
    carrier_name: '',
    service_type: 'standard',
    base_rate_per_kg: '',
    fuel_surcharge_percentage: '0',
    insurance_rate_percentage: '0.5',
    domestic_multiplier: '1.0',
    international_multiplier: '2.5',
    min_weight: '0.5',
    max_weight: '50',
    pickup_cutoff_time: '18:00',
    estimated_delivery_days: '3'
  });

  const [alertForm, setAlertForm] = useState({
    alert_type: 'info',
    title: '',
    message: '',
    component: 'api',
    severity: '1'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const loadUsers = async () => {
    try {
      const response = await api.get(`/admin/users?search=${userSearch}&limit=50`);
      setUsers(response.data.data.users);
    } catch (err) {
      setError('Failed to load users: ' + (err.response?.data?.detail || err.message));
    }
  };

  const loadBookings = async () => {
    try {
      const response = await api.get(`/admin/bookings?search=${bookingSearch}&status_filter=${bookingStatusFilter}&limit=50`);
      setBookings(response.data.data.bookings);
    } catch (err) {
      setError('Failed to load bookings: ' + (err.response?.data?.detail || err.message));
    }
  };

  const loadCarrierRates = async () => {
    try {
      const response = await api.get('/admin/carrier-rates');
      setCarrierRates(response.data);
    } catch (err) {
      setError('Failed to load carrier rates: ' + (err.response?.data?.detail || err.message));
    }
  };

  const loadSystemAlerts = async () => {
    try {
      const response = await api.get('/admin/alerts?limit=20');
      setSystemAlerts(response.data);
    } catch (err) {
      setError('Failed to load system alerts: ' + (err.response?.data?.detail || err.message));
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
      loadUsers();
    } catch (err) {
      setError('Failed to update user status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const createCarrierRate = async () => {
    try {
      await api.post('/admin/carrier-rates', {
        ...rateForm,
        base_rate_per_kg: parseFloat(rateForm.base_rate_per_kg),
        fuel_surcharge_percentage: parseFloat(rateForm.fuel_surcharge_percentage),
        insurance_rate_percentage: parseFloat(rateForm.insurance_rate_percentage),
        domestic_multiplier: parseFloat(rateForm.domestic_multiplier),
        international_multiplier: parseFloat(rateForm.international_multiplier),
        min_weight: parseFloat(rateForm.min_weight),
        max_weight: parseFloat(rateForm.max_weight),
        estimated_delivery_days: parseInt(rateForm.estimated_delivery_days)
      });
      setShowRateDialog(false);
      setRateForm({
        carrier_name: '', service_type: 'standard', base_rate_per_kg: '',
        fuel_surcharge_percentage: '0', insurance_rate_percentage: '0.5',
        domestic_multiplier: '1.0', international_multiplier: '2.5',
        min_weight: '0.5', max_weight: '50', pickup_cutoff_time: '18:00',
        estimated_delivery_days: '3'
      });
      loadCarrierRates();
    } catch (err) {
      setError('Failed to create carrier rate: ' + (err.response?.data?.detail || err.message));
    }
  };

  const createSystemAlert = async () => {
    try {
      await api.post('/admin/alerts', {
        ...alertForm,
        severity: parseInt(alertForm.severity)
      });
      setShowAlertDialog(false);
      setAlertForm({
        alert_type: 'info', title: '', message: '',
        component: 'api', severity: '1'
      });
      loadSystemAlerts();
    } catch (err) {
      setError('Failed to create system alert: ' + (err.response?.data?.detail || err.message));
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await api.put(`/admin/alerts/${alertId}/resolve`);
      loadSystemAlerts();
    } catch (err) {
      setError('Failed to resolve alert: ' + (err.response?.data?.detail || err.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'delivered': { variant: 'success', icon: CheckCircle },
      'in_transit': { variant: 'default', icon: Truck },
      'booked': { variant: 'secondary', icon: Clock },
      'cancelled': { variant: 'destructive', icon: XCircle },
      'pickup_scheduled': { variant: 'warning', icon: Clock }
    };

    const config = statusConfig[status] || { variant: 'default', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getAlertBadge = (alertType, severity) => {
    const config = {
      'critical': 'destructive',
      'error': 'destructive',
      'warning': 'warning',
      'info': 'default'
    };

    return (
      <Badge variant={config[alertType] || 'default'}>
        {alertType.toUpperCase()} - Level {severity}
      </Badge>
    );
  };

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'rates') loadCarrierRates();
    if (activeTab === 'alerts') loadSystemAlerts();
  }, [activeTab, userSearch, bookingSearch, bookingStatusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">XFas Logistics Management Console</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={refreshData} disabled={refreshing} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Button onClick={onLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardData && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.total_users}</div>
                      <p className="text-xs text-muted-foreground">
                        +{dashboardData.stats.new_users_this_month} this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.total_shipments}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.stats.shipments_today} today
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.total_revenue)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(dashboardData.stats.revenue_this_month)} this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.overall_success_rate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.stats.customer_satisfaction}/5 satisfaction
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.revenue_breakdown.map((carrier, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                              <span className="text-sm font-medium">{carrier.carrier_name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">{formatCurrency(carrier.total_revenue)}</div>
                              <div className="text-xs text-muted-foreground">{carrier.market_share.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Shipments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.recent_shipments.slice(0, 5).map((shipment, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">{shipment.shipment_number}</div>
                              <div className="text-xs text-muted-foreground">
                                {shipment.sender?.city} → {shipment.recipient?.city}
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(shipment.status)}
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(shipment.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Alerts Preview */}
                {dashboardData.system_alerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Active System Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.system_alerts.slice(0, 3).map((alert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                {getAlertBadge(alert.alert_type, alert.severity)}
                                <span className="font-medium">{alert.title}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.user_type}</Badge>
                        </TableCell>
                        <TableCell>{user.total_shipments}</TableCell>
                        <TableCell>{formatCurrency(user.total_spent)}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'success' : 'destructive'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus(user.id, !user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Management */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search bookings..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>AWB</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">{booking.awb}</TableCell>
                        <TableCell>{booking.carrier}</TableCell>
                        <TableCell className="text-sm">
                          {booking.sender_city} → {booking.recipient_city}
                        </TableCell>
                        <TableCell>{booking.user_email}</TableCell>
                        <TableCell>{formatCurrency(booking.amount)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-sm">{formatDate(booking.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Carrier Rates Management */}
          <TabsContent value="rates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Carrier Rate Management</CardTitle>
                  <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Carrier Rate</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Carrier Name</Label>
                          <Input
                            value={rateForm.carrier_name}
                            onChange={(e) => setRateForm({...rateForm, carrier_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Service Type</Label>
                          <Select value={rateForm.service_type} onValueChange={(value) => setRateForm({...rateForm, service_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="express">Express</SelectItem>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="overnight">Overnight</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Base Rate per KG (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={rateForm.base_rate_per_kg}
                            onChange={(e) => setRateForm({...rateForm, base_rate_per_kg: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Fuel Surcharge (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rateForm.fuel_surcharge_percentage}
                            onChange={(e) => setRateForm({...rateForm, fuel_surcharge_percentage: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Insurance Rate (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rateForm.insurance_rate_percentage}
                            onChange={(e) => setRateForm({...rateForm, insurance_rate_percentage: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Estimated Delivery Days</Label>
                          <Input
                            type="number"
                            value={rateForm.estimated_delivery_days}
                            onChange={(e) => setRateForm({...rateForm, estimated_delivery_days: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Min Weight (KG)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rateForm.min_weight}
                            onChange={(e) => setRateForm({...rateForm, min_weight: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Max Weight (KG)</Label>
                          <Input
                            type="number"
                            value={rateForm.max_weight}
                            onChange={(e) => setRateForm({...rateForm, max_weight: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Pickup Cutoff Time</Label>
                          <Input
                            type="time"
                            value={rateForm.pickup_cutoff_time}
                            onChange={(e) => setRateForm({...rateForm, pickup_cutoff_time: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Domestic Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rateForm.domestic_multiplier}
                            onChange={(e) => setRateForm({...rateForm, domestic_multiplier: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <Button onClick={createCarrierRate} className="w-full bg-orange-600 hover:bg-orange-700">
                            Create Rate
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Base Rate</TableHead>
                      <TableHead>Delivery Days</TableHead>
                      <TableHead>Weight Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carrierRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">{rate.carrier_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rate.service_type}</Badge>
                        </TableCell>
                        <TableCell>₹{rate.base_rate_per_kg}/kg</TableCell>
                        <TableCell>{rate.estimated_delivery_days} days</TableCell>
                        <TableCell>{rate.min_weight}-{rate.max_weight} kg</TableCell>
                        <TableCell>
                          <Badge variant={rate.is_active ? 'success' : 'destructive'}>
                            {rate.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Alerts */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>System Alerts</CardTitle>
                  <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create System Alert</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Alert Type</Label>
                          <Select value={alertForm.alert_type} onValueChange={(value) => setAlertForm({...alertForm, alert_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={alertForm.title}
                            onChange={(e) => setAlertForm({...alertForm, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Message</Label>
                          <Textarea
                            value={alertForm.message}
                            onChange={(e) => setAlertForm({...alertForm, message: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Component</Label>
                          <Select value={alertForm.component} onValueChange={(value) => setAlertForm({...alertForm, component: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="api">API</SelectItem>
                              <SelectItem value="database">Database</SelectItem>
                              <SelectItem value="carrier">Carrier</SelectItem>
                              <SelectItem value="payment">Payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Severity (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={alertForm.severity}
                            onChange={(e) => setAlertForm({...alertForm, severity: e.target.value})}
                          />
                        </div>
                        <Button onClick={createSystemAlert} className="w-full bg-orange-600 hover:bg-orange-700">
                          Create Alert
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getAlertBadge(alert.alert_type, alert.severity)}
                            <span className="font-medium">{alert.title}</span>
                          </div>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {alert.component} • {formatDate(alert.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.is_resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                          {alert.is_resolved && (
                            <Badge variant="success">Resolved</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Carrier Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.carrier_analytics && (
                    <div className="space-y-4">
                      {dashboardData.carrier_analytics.map((carrier, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{carrier.carrier_name}</span>
                            <Badge variant="outline">{carrier.success_rate.toFixed(1)}% Success</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Shipments: {carrier.total_shipments}</div>
                            <div>Revenue: {carrier.revenue_contribution.toFixed(1)}%</div>
                            <div>On-time: {carrier.on_time_percentage}%</div>
                            <div>Rating: {carrier.customer_rating}/5</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.top_routes && (
                    <div className="space-y-3">
                      {dashboardData.top_routes.map((route, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{route.route}</div>
                            <div className="text-sm text-gray-600">{route.shipments} shipments</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(route.revenue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;