import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  RefreshCw, 
  Download, 
  Mail, 
  Phone, 
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { trackingAPI } from '../services/api';
import TrackingTimeline from './TrackingTimeline';

const EnhancedTracking = ({ initialAwb = '', showNotificationSetup = true }) => {
  const [awb, setAwb] = useState(initialAwb);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notificationSetup, setNotificationSetup] = useState({
    email: '',
    phone: '',
    emailEnabled: true,
    smsEnabled: true
  });
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const intervalRef = useRef(null);
  const { toast } = useToast();

  // Real-time tracking poll
  useEffect(() => {
    if (realTimeEnabled && trackingData) {
      intervalRef.current = setInterval(() => {
        checkForUpdates();
      }, 30000); // Check every 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [realTimeEnabled, trackingData]);

  const handleTrackShipment = async (awbNumber = awb) => {
    if (!awbNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an AWB/tracking number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await trackingAPI.trackSingle(awbNumber.trim());
      
      if (result.success && result.data) {
        setTrackingData(result.data);
        setLastUpdate(new Date().toISOString());
        
        toast({
          title: "Tracking Found",
          description: `Shipment found: ${result.data.carrier} - ${formatStatus(result.data.status)}`
        });
      } else {
        throw new Error(result.error || 'No tracking data available');
      }
    } catch (error) {
      setTrackingData(null);
      toast({
        title: "Tracking Failed",
        description: error.response?.data?.detail || error.message || "Could not find tracking information for this AWB",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    if (!trackingData?.awb) return;

    try {
      const result = await trackingAPI.getRealTimeUpdates(trackingData.awb, lastUpdate);
      
      if (result.success && result.data?.has_updates && result.data.shipment_data) {
        setTrackingData(result.data.shipment_data);
        setLastUpdate(result.data.last_checked);
        
        // Show notification for status updates
        toast({
          title: "Shipment Updated",
          description: `Status: ${formatStatus(result.data.shipment_data.status)}`,
          variant: "success"
        });
      }
    } catch (error) {
      console.error('Real-time update error:', error);
    }
  };

  const setupNotifications = async () => {
    if (!trackingData?.awb) {
      toast({
        title: "No Shipment Selected",
        description: "Please track a shipment first",
        variant: "destructive"
      });
      return;
    }

    if (!notificationSetup.email && !notificationSetup.phone) {
      toast({
        title: "Contact Information Required",
        description: "Please provide either email or phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      const notificationTypes = [];
      if (notificationSetup.emailEnabled && notificationSetup.email) {
        notificationTypes.push('email');
      }
      if (notificationSetup.smsEnabled && notificationSetup.phone) {
        notificationTypes.push('sms');
      }

      const result = await trackingAPI.setupNotifications(trackingData.awb, {
        email: notificationSetup.email || null,
        phone: notificationSetup.phone || null,
        notification_types: notificationTypes
      });

      if (result.success) {
        setSetupDialogOpen(false);
        toast({
          title: "Notifications Setup",
          description: `You'll receive updates via ${notificationTypes.join(' and ')}`
        });
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error.response?.data?.detail || "Failed to setup notifications",
        variant: "destructive"
      });
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'booked': 'bg-blue-100 text-blue-800',
      'pickup_scheduled': 'bg-yellow-100 text-yellow-800',
      'picked_up': 'bg-orange-100 text-orange-800',
      'in_transit': 'bg-purple-100 text-purple-800',
      'out_for_delivery': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter AWB/Tracking Number (e.g., XF1234567890)"
                value={awb}
                onChange={(e) => setAwb(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                className="text-lg h-12"
              />
            </div>
            <Button
              onClick={() => handleTrackShipment()}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 h-12 px-8"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Track
            </Button>
          </div>
        </CardContent>
      </Card>

      {trackingData && (
        <>
          {/* Control Panel */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(trackingData.status)}>
                    {formatStatus(trackingData.status)}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    AWB: {trackingData.awb}
                  </span>
                  {lastUpdate && (
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Real-time Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="real-time"
                      checked={realTimeEnabled}
                      onCheckedChange={setRealTimeEnabled}
                    />
                    <Label htmlFor="real-time" className="text-sm">
                      Real-time
                    </Label>
                    {realTimeEnabled && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Notification Setup */}
                  {showNotificationSetup && (
                    <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Bell className="w-4 h-4 mr-1" />
                          Notify Me
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Setup Tracking Notifications</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="your-email@example.com"
                                value={notificationSetup.email}
                                onChange={(e) => setNotificationSetup(prev => ({
                                  ...prev,
                                  email: e.target.value
                                }))}
                              />
                              <Switch
                                checked={notificationSetup.emailEnabled}
                                onCheckedChange={(checked) => setNotificationSetup(prev => ({
                                  ...prev,
                                  emailEnabled: checked
                                }))}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+91 9876543210"
                                value={notificationSetup.phone}
                                onChange={(e) => setNotificationSetup(prev => ({
                                  ...prev,
                                  phone: e.target.value
                                }))}
                              />
                              <Switch
                                checked={notificationSetup.smsEnabled}
                                onCheckedChange={(checked) => setNotificationSetup(prev => ({
                                  ...prev,
                                  smsEnabled: checked
                                }))}
                              />
                            </div>
                          </div>

                          <div className="pt-4 space-y-2">
                            <p className="text-sm text-gray-600">You'll receive notifications for:</p>
                            <ul className="text-sm text-gray-500 space-y-1">
                              <li className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Status updates</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Out for delivery alerts</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Delivery confirmations</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>Delay notifications</span>
                              </li>
                            </ul>
                          </div>

                          <Button onClick={setupNotifications} className="w-full">
                            Setup Notifications
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Refresh Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTrackShipment(trackingData.awb)}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Shipment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Shipment Details</span>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-normal text-gray-500">
                    {trackingData.progress_percentage}% Complete
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Carrier & Service</h4>
                  <p className="text-gray-600">{trackingData.carrier}</p>
                  <p className="text-sm text-gray-500 capitalize">{trackingData.service_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Route</h4>
                  <p className="text-gray-600">
                    {trackingData.sender.city} → {trackingData.recipient.city}
                  </p>
                  <p className="text-sm text-gray-500">
                    {trackingData.sender.state} → {trackingData.recipient.state}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Package</h4>
                  <p className="text-gray-600">{trackingData.package_info.weight} kg</p>
                  <p className="text-sm text-gray-500">₹{trackingData.package_info.declared_value}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery</h4>
                  {trackingData.estimated_delivery ? (
                    <p className="text-gray-600">
                      {new Date(trackingData.estimated_delivery).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-gray-500">Estimating...</p>
                  )}
                  {trackingData.next_update && (
                    <p className="text-sm text-gray-500">
                      Next: {trackingData.next_update.expected_status}
                    </p>
                  )}
                </div>
              </div>

              {/* Enhanced Delivery Insights */}
              {trackingData.delivery_insights && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Delivery Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          trackingData.delivery_insights.delivery_confidence === 'high' ? 'bg-green-500' :
                          trackingData.delivery_insights.delivery_confidence === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium">
                          {trackingData.delivery_insights.delivery_confidence.charAt(0).toUpperCase() + 
                           trackingData.delivery_insights.delivery_confidence.slice(1)} Confidence
                        </span>
                      </div>
                      
                      {trackingData.delivery_insights.is_delayed && (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Delayed Shipment</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      {trackingData.delivery_insights.special_instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start space-x-2 text-blue-600">
                          <Settings className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{instruction}</span>
                        </div>
                      ))}
                      
                      {trackingData.delivery_insights.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <TrackingTimeline 
            milestones={trackingData.milestones}
            trackingEvents={trackingData.tracking_events}
            currentStatus={trackingData.status}
            estimatedDelivery={trackingData.estimated_delivery}
            nextUpdate={trackingData.next_update}
          />

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => window.open(`/track/${trackingData.awb}`, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share Tracking Link
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Download className="w-4 h-4 mr-2" />
                  Print Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EnhancedTracking;