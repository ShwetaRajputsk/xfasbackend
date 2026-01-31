import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  X, 
  RefreshCw,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  MapPin,
  Eye,
  Edit,
  DollarSign,
  TrendingUp,
  Info,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { ordersAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [statusSummary, setStatusSummary] = useState({});
  const [analytics, setAnalytics] = useState(null);
  
  const [cancelReason, setCancelReason] = useState('');
  const [refundRequested, setRefundRequested] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchShipments();
    fetchAnalytics();
  }, [statusFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const params = {
        status_filter: (statusFilter && statusFilter !== 'all') ? statusFilter : undefined,
        limit: 50,
        offset: 0
      };
      
      const result = await ordersAPI.getMyShipments(params);
      
      if (result.success) {
        // Ensure shipments are sorted by created_at in descending order (newest first)
        const sortedShipments = result.data.shipments.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setShipments(sortedShipments);
        setStatusSummary(result.data.status_summary);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shipments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const result = await ordersAPI.getAnalytics(30);
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const handleViewDetails = async (shipmentId) => {
    try {
      const result = await ordersAPI.getShipmentDetails(shipmentId);
      if (result.success) {
        setSelectedShipment(result.data);
        setDetailsModalOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shipment details",
        variant: "destructive"
      });
    }
  };

  const handleCancelShipment = async () => {
    if (!selectedShipment || !cancelReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a cancellation reason",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await ordersAPI.cancelShipment(selectedShipment.id, {
        reason: cancelReason,
        refund_requested: refundRequested
      });

      if (result.success) {
        setCancelModalOpen(false);
        setCancelReason('');
        fetchShipments();
        toast({
          title: "Shipment Cancelled",
          description: result.data.message
        });
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error.response?.data?.detail || "Failed to cancel shipment",
        variant: "destructive"
      });
    }
  };

  const handleRescheduleShipment = async () => {
    if (!selectedShipment || !rescheduleDate) {
      toast({
        title: "Missing Information",
        description: "Please select a new pickup date",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await ordersAPI.rescheduleShipment(selectedShipment.id, {
        new_pickup_date: new Date(rescheduleDate).toISOString(),
        reason: rescheduleReason
      });

      if (result.success) {
        setRescheduleModalOpen(false);
        setRescheduleDate('');
        setRescheduleReason('');
        fetchShipments();
        toast({
          title: "Shipment Rescheduled",
          description: result.data.message
        });
      }
    } catch (error) {
      toast({
        title: "Reschedule Failed",
        description: error.response?.data?.detail || "Failed to reschedule shipment",
        variant: "destructive"
      });
    }
  };

  const downloadDocument = async (shipmentId, documentType) => {
    try {
      let url = '';
      let filename = '';
      
      switch (documentType) {
        case 'invoice':
          url = await bookingsAPI.downloadShippingInvoice(shipmentId);
          filename = `shipping_invoice_${shipmentId}.pdf`;
          break;
        case 'label':
          url = await bookingsAPI.downloadShippingLabel(shipmentId);
          filename = `shipping_label_${shipmentId}.pdf`;
          break;
        case 'receipt':
          url = await bookingsAPI.downloadPaymentReceipt(shipmentId);
          filename = `payment_receipt_${shipmentId}.pdf`;
          break;
        default:
          return;
      }

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} download started`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download ${documentType}`,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'draft': 'bg-gray-100 text-gray-800',
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
      'pickup_scheduled': <Calendar className="w-4 h-4" />,
      'picked_up': <Package className="w-4 h-4" />,
      'in_transit': <Truck className="w-4 h-4" />,
      'out_for_delivery': <MapPin className="w-4 h-4" />,
      'delivered': <CheckCircle className="w-4 h-4" />,
      'cancelled': <X className="w-4 h-4" />,
      'returned': <RefreshCw className="w-4 h-4" />
    };
    return icons[status] || <Package className="w-4 h-4" />;
  };

  const filteredShipments = shipments.filter(shipment => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        shipment.awb.toLowerCase().includes(query) ||
        shipment.shipment_number.toLowerCase().includes(query) ||
        shipment.recipient.name.toLowerCase().includes(query) ||
        shipment.sender.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
          <p className="text-gray-600">Track and manage your shipments</p>
        </div>
        <Button onClick={fetchShipments} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.total_shipments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{analytics.total_spent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg. Value</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{Math.round(analytics.average_shipment_value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.delivery_success_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by AWB, shipment number, or recipient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="pickup_scheduled">Pickup Scheduled</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {Object.keys(statusSummary).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {Object.entries(statusSummary).map(([status, count]) => (
                <div key={status} className="flex items-center space-x-2">
                  <Badge className={getStatusColor(status)}>{formatStatus(status)}</Badge>
                  <span className="text-sm text-gray-600">({count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipments List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading shipments...</span>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No shipments found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter ? 'Try adjusting your filters' : 'You haven\'t shipped anything yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredShipments.map((shipment) => (
                <div key={shipment.awb} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(shipment.status)}
                        <Badge className={getStatusColor(shipment.status)}>
                          {formatStatus(shipment.status)}
                        </Badge>
                        {/* New shipment indicator */}
                        {new Date() - new Date(shipment.created_at) < 24 * 60 * 60 * 1000 && (
                          <Badge className="bg-green-500 text-white text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-sm">{shipment.awb}</p>
                        <p className="text-xs text-gray-500">{shipment.shipment_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(shipment.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      {shipment.invoice_available && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(shipment.id, 'invoice')}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Invoice
                        </Button>
                      )}
                      {shipment.label_available && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(shipment.id, 'label')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Label
                        </Button>
                      )}
                      {shipment.payment_status === 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(shipment.id, 'receipt')}
                        >
                          <Receipt className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Route</p>
                      <p className="font-medium">
                        {shipment.sender.city} → {shipment.recipient.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Carrier</p>
                      <p className="font-medium">{shipment.carrier}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Weight</p>
                      <p className="font-medium">
                        {shipment.chargeable_weight ? (
                          <span>
                            <span className="text-orange-600">{shipment.chargeable_weight} kg</span>
                            <span className="text-xs text-gray-400 ml-1">(chargeable)</span>
                          </span>
                        ) : (
                          `${shipment.package_info?.weight || 'N/A'} kg`
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-medium">₹{shipment.total_amount}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <Progress value={shipment.progress_percentage} className="w-24 h-2" />
                        <span className="text-xs text-gray-500">{shipment.progress_percentage}%</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipment Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-6">
              {/* Status and Progress */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedShipment.status)}>
                  {formatStatus(selectedShipment.status)}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Progress value={selectedShipment.progress_percentage} className="w-32" />
                  <span className="text-sm text-gray-600">{selectedShipment.progress_percentage}%</span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Shipment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>AWB:</strong> {selectedShipment.awb}</div>
                    <div><strong>Shipment Number:</strong> {selectedShipment.shipment_number}</div>
                    <div><strong>Carrier:</strong> {selectedShipment.carrier}</div>
                    <div><strong>Service:</strong> {selectedShipment.service_type}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    Package Details
                    {(selectedShipment.volumetric_weight || selectedShipment.chargeable_weight) && (
                      <Info className="w-4 h-4 ml-2 text-gray-400" title="Weight calculation details" />
                    )}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Actual Weight:</strong> {selectedShipment.package_info.weight} kg</div>
                    {selectedShipment.volumetric_weight && (
                      <div>
                        <strong>Volumetric Weight:</strong> {selectedShipment.volumetric_weight} kg
                        <span className="text-xs text-gray-500 ml-2">(L×W×H÷5000)</span>
                      </div>
                    )}
                    {selectedShipment.chargeable_weight && (
                      <div>
                        <strong>Chargeable Weight:</strong> 
                        <span className="text-orange-600 font-medium ml-1">{selectedShipment.chargeable_weight} kg</span>
                        <span className="text-xs text-gray-500 ml-2">(Higher of actual/volumetric)</span>
                      </div>
                    )}
                    <div><strong>Contents:</strong> {selectedShipment.package_info.contents}</div>
                    <div><strong>Value:</strong> ₹{selectedShipment.package_info.declared_value}</div>
                  </div>
                  {(selectedShipment.volumetric_weight || selectedShipment.chargeable_weight) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> Shipping charges are calculated based on chargeable weight, 
                        which is the higher value between actual weight and volumetric weight.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {selectedShipment.payment_details && (
                <div>
                  <h4 className="font-semibold mb-2">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Amount:</strong> ₹{selectedShipment.payment_details.amount}</div>
                    <div><strong>Status:</strong> 
                      <Badge className="ml-1" variant={selectedShipment.payment_details.status === 'paid' ? 'success' : 'secondary'}>
                        {selectedShipment.payment_details.status}
                      </Badge>
                    </div>
                    {selectedShipment.payment_details.method && (
                      <div><strong>Method:</strong> {selectedShipment.payment_details.method}</div>
                    )}
                    {selectedShipment.payment_details.transaction_id && (
                      <div><strong>Transaction ID:</strong> {selectedShipment.payment_details.transaction_id}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {selectedShipment.can_cancel && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setCancelModalOpen(true)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Shipment
                  </Button>
                )}
                {selectedShipment.can_reschedule && (
                  <Button 
                    variant="outline" 
                    onClick={() => setRescheduleModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Reschedule Pickup
                  </Button>
                )}
                {selectedShipment.invoice_available && (
                  <Button 
                    variant="outline" 
                    onClick={() => downloadDocument(selectedShipment.id, 'invoice')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Download Invoice
                  </Button>
                )}
                {selectedShipment.label_available && (
                  <Button 
                    variant="outline" 
                    onClick={() => downloadDocument(selectedShipment.id, 'label')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download Label
                  </Button>
                )}
                {selectedShipment.payment_details?.status === 'paid' && (
                  <Button 
                    variant="outline" 
                    onClick={() => downloadDocument(selectedShipment.id, 'receipt')}
                  >
                    <Receipt className="w-4 h-4 mr-1" />
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Shipment Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelReason">Reason for Cancellation</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please explain why you want to cancel this shipment"
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="refundRequested"
                checked={refundRequested}
                onChange={(e) => setRefundRequested(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="refundRequested">Request refund (3-5 business days)</Label>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleCancelShipment}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Shipment Modal */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Pickup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rescheduleDate">New Pickup Date</Label>
              <Input
                id="rescheduleDate"
                type="datetime-local"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="rescheduleReason">Reason (Optional)</Label>
              <Textarea
                id="rescheduleReason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Please explain why you want to reschedule"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setRescheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRescheduleShipment}>
                Reschedule Pickup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyShipments;