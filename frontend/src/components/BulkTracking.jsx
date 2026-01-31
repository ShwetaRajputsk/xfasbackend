import React, { useState } from 'react';
import { Upload, Download, Search, CheckCircle, AlertCircle, Package, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';

const BulkTracking = () => {
  const [awbList, setAwbList] = useState('');
  const [trackingResults, setTrackingResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBulkTrack = async () => {
    const awbNumbers = awbList
      .split('\n')
      .map(awb => awb.trim().toUpperCase())
      .filter(awb => awb.length > 0);

    if (awbNumbers.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter at least one AWB number",
        variant: "destructive"
      });
      return;
    }

    if (awbNumbers.length > 50) {
      toast({
        title: "Too Many AWBs",
        description: "Maximum 50 AWB numbers allowed per request",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/tracking/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            awb_numbers: awbNumbers
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTrackingResults(result.data);
          toast({
            title: "Bulk Tracking Complete",
            description: `Tracked ${result.data.tracked_count} of ${awbNumbers.length} AWBs`
          });
        } else {
          throw new Error(result.error || 'Failed to track AWBs');
        }
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to track AWBs');
      }
    } catch (error) {
      console.error('Bulk tracking error:', error);
      toast({
        title: "Bulk Tracking Failed",
        description: error.message || "Could not track AWBs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setAwbList(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a .txt file with AWB numbers",
        variant: "destructive"
      });
    }
  };

  const exportResults = () => {
    if (!trackingResults) return;

    const csvContent = [
      'AWB,Status,Carrier,Progress,Sender City,Recipient City,Last Update',
      ...trackingResults.shipments.map(shipment => 
        `${shipment.awb},${shipment.status},${shipment.carrier},${shipment.progress_percentage}%,${shipment.sender.city},${shipment.recipient.city},${new Date(shipment.last_updated).toLocaleDateString()}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_tracking_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="space-y-6">
      {/* Bulk Tracking Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-orange-500" />
            <span>Bulk Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter AWB Numbers (one per line, max 50)
              </label>
              <Textarea
                placeholder="XF1234567890&#10;FX9876543210&#10;DH5555666677&#10;..."
                value={awbList}
                onChange={(e) => setAwbList(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBulkTrack}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loading ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track All AWBs
                  </>
                )}
              </Button>

              <div className="text-sm text-gray-500">or</div>

              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span>Upload .txt file</span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {awbList && (
                <Button
                  variant="outline"
                  onClick={() => setAwbList('')}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p>• Supported formats: XF1234567890, FX1234567890, DH1234567890, etc.</p>
              <p>• Enter one AWB number per line</p>
              <p>• Maximum 50 AWB numbers per request</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Tracking Results */}
      {trackingResults && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span>Tracking Summary</span>
                </CardTitle>
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{trackingResults.tracked_count}</div>
                  <div className="text-sm text-gray-600">Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{trackingResults.not_found_count}</div>
                  <div className="text-sm text-gray-600">Not Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{trackingResults.summary.total_declared_value?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(trackingResults.summary.on_time_percentage || 0)}%
                  </div>
                  <div className="text-sm text-gray-600">On Time</div>
                </div>
              </div>

              {/* Status Distribution */}
              {trackingResults.summary.status_distribution && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Status Distribution</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(trackingResults.summary.status_distribution).map(([status, count]) => (
                      <Badge key={status} className={getStatusColor(status)}>
                        {formatStatus(status)}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Results */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingResults.shipments.map((shipment, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono text-sm font-bold">{shipment.awb}</span>
                          <Badge className={getStatusColor(shipment.status)}>
                            {formatStatus(shipment.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Carrier:</span>
                            <p className="font-medium">{shipment.carrier}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Route:</span>
                            <p className="font-medium">{shipment.sender.city} → {shipment.recipient.city}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Progress:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <Progress value={shipment.progress_percentage} className="h-2 flex-grow" />
                              <span className="text-xs font-medium">{shipment.progress_percentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/track?awb=${shipment.awb}`, '_blank')}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Not Found AWBs */}
                {trackingResults.not_found.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                      AWBs Not Found ({trackingResults.not_found.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {trackingResults.not_found.map((awb, index) => (
                        <Badge key={index} variant="outline" className="font-mono text-red-600 border-red-200">
                          {awb}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BulkTracking;