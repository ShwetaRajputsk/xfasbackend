import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, MapPin, CheckCircle, Truck, AlertCircle, Eye, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { trackingAPI } from '../services/api';
import TrackingTimeline from './TrackingTimeline';
import BulkTracking from './BulkTracking';

const TrackingPage = () => {
  const [awb, setAwb] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
  const { toast } = useToast();

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
      console.log(`[TRACKING] Starting track for AWB: ${awbNumber.trim()}`);
      
      const result = await trackingAPI.trackSingle(awbNumber.trim());
      
      console.log(`[TRACKING] API Response:`, result);
      
      if (result.success && result.data) {
        console.log(`[TRACKING] Setting tracking data:`, result.data);
        setTrackingData(result.data);
        toast({
          title: "Tracking Found",
          description: `Shipment found: ${result.data.carrier} - ${result.data.status}`
        });
      } else {
        throw new Error(result.error || 'No tracking data available');
      }
    } catch (error) {
      console.error('[TRACKING] Error:', error);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackShipment();
    }
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

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (status) => {
    const icons = {
      'booked': <CheckCircle className="w-4 h-4" />,
      'pickup_scheduled': <Clock className="w-4 h-4" />,
      'picked_up': <Package className="w-4 h-4" />,
      'in_transit': <Truck className="w-4 h-4" />,
      'out_for_delivery': <MapPin className="w-4 h-4" />,
      'delivered': <CheckCircle className="w-4 h-4" />,
      'cancelled': <AlertCircle className="w-4 h-4" />,
      'returned': <RefreshCw className="w-4 h-4" />
    };
    return icons[status] || <Package className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Shipment</h1>
            <p className="text-gray-600">Enter your AWB/tracking number to get real-time updates</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tracking Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              Single Tracking
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'bulk'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              Bulk Tracking
            </button>
          </div>
        </div>

        {activeTab === 'single' ? (
          <>
            {/* Single Tracking Form */}
            <Card className="max-w-2xl mx-auto mb-8">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter AWB/Tracking Number (e.g., XF1234567890)"
                      value={awb}
                      onChange={(e) => setAwb(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
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
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Supported formats: XF1234567890, FX1234567890, DH1234567890, AR1234567890, UP1234567890</p>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Results */}
            {trackingData && (
              <div className="space-y-6">
                {/* Shipment Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(trackingData.status)}
                        <span>Shipment Details</span>
                      </CardTitle>
                      <Badge className={getStatusColor(trackingData.status)}>
                        {formatStatus(trackingData.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">AWB Number</h4>
                        <p className="text-gray-600 font-mono">{trackingData.awb}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Carrier</h4>
                        <p className="text-gray-600">{trackingData.carrier}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Service Type</h4>
                        <p className="text-gray-600 capitalize">{trackingData.service_type}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Progress</h4>
                        <div className="space-y-2">
                          <Progress value={trackingData.progress_percentage} className="h-2" />
                          <p className="text-sm text-gray-600">{trackingData.progress_percentage}% Complete</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">From</h4>
                        <p className="text-gray-600">
                          {trackingData.sender.name}<br />
                          {trackingData.sender.city}, {trackingData.sender.state}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">To</h4>
                        <p className="text-gray-600">
                          {trackingData.recipient.name}<br />
                          {trackingData.recipient.city}, {trackingData.recipient.state}
                        </p>
                      </div>
                    </div>

                    {/* Package Information */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold text-gray-900 mb-2">Package Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Weight:</span>
                          <p className="font-medium">{trackingData.package_info.weight} kg</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Contents:</span>
                          <p className="font-medium">{trackingData.package_info.contents}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Declared Value:</span>
                          <p className="font-medium">₹{trackingData.package_info.declared_value}</p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Insights */}
                    {trackingData.delivery_insights && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold text-gray-900 mb-3">Delivery Insights</h4>
                        <div className="space-y-2">
                          {trackingData.delivery_insights.is_delayed && (
                            <div className="flex items-center space-x-2 text-orange-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">This shipment is delayed</span>
                            </div>
                          )}
                          
                          {trackingData.delivery_insights.special_instructions.map((instruction, index) => (
                            <div key={index} className="flex items-center space-x-2 text-blue-600">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">{instruction}</span>
                            </div>
                          ))}
                          
                          {trackingData.delivery_insights.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-2 text-green-600">
                              <CheckCircle className="w-4 h-4 mt-0.5" />
                              <span className="text-sm">{recommendation}</span>
                            </div>
                          ))}
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
              </div>
            )}
          </>
        ) : (
          /* Bulk Tracking */
          <BulkTracking />
        )}

        {/* Sample AWB Numbers for Testing */}
        {!trackingData && activeTab === 'single' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Try Sample Tracking Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['XF1234567890', 'FX9876543210', 'DH5555666677', 'AR1111222233'].map((sampleAWB) => (
                  <Button
                    key={sampleAWB}
                    variant="outline"
                    onClick={() => {
                      setAwb(sampleAWB);
                      handleTrackShipment(sampleAWB);
                    }}
                    className="font-mono"
                  >
                    {sampleAWB}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;