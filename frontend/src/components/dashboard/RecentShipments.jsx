import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Eye, MoreHorizontal, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';

const RecentShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [searchTerm, statusFilter, shipments]);

  const fetchShipments = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShipments(data);
        setFilteredShipments(data);
      } else {
        throw new Error('Failed to fetch shipments');
      }
    } catch (error) {
      toast({
        title: "Error Loading Shipments",
        description: "Could not load your shipments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = [...shipments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.shipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.carrier_info?.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.recipient?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    setFilteredShipments(filtered);
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

  const handleTrackShipment = (awb) => {
    window.open(`/track?awb=${awb}`, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-500" />
              <span>My Shipments ({filteredShipments.length})</span>
            </CardTitle>
            <Button
              onClick={() => window.location.href = '/quote'}
              className="bg-orange-500 hover:bg-orange-600"
            >
              New Shipment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by AWB, shipment number, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipments List */}
      <Card>
        <CardContent className="p-0">
          {filteredShipments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredShipments.map((shipment, index) => (
                <div key={shipment.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {shipment.shipment_number}
                        </h3>
                        <Badge className={getStatusColor(shipment.status)}>
                          {formatStatus(shipment.status)}
                        </Badge>
                        {shipment.carrier_info?.tracking_number && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {shipment.carrier_info.tracking_number}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Route</p>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{shipment.sender?.city || 'N/A'}</span>
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">{shipment.recipient?.city || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 mb-1">Carrier</p>
                          <p className="font-medium">{shipment.carrier_info?.carrier_name || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 mb-1">Cost</p>
                          <p className="font-medium">₹{shipment.payment_info?.amount?.toLocaleString() || '0'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          Created: {new Date(shipment.created_at).toLocaleDateString()}
                          {shipment.estimated_delivery && (
                            <span className="ml-4">
                              Est. Delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {shipment.carrier_info?.tracking_number && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrackShipment(shipment.carrier_info.tracking_number)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Track
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No matching shipments' : 'No shipments yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first shipment to get started'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => window.location.href = '/quote'}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Create Shipment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentShipments;