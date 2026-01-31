import React, { useState, useEffect, useRef } from 'react';
import { Check, Shield, Truck, Star, ArrowRight, Filter, SortAsc, SortDesc, Zap, Award, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { quotesAPI } from '../services/api';

const QuoteComparison = ({ quotes, onSelectQuote, loading = false, recommendedQuote = null, quoteData = {}, packages = [], contentItems = [], shipmentType = 'parcel', onEditQuote, onUpdateQuote }) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [sortBy, setSortBy] = useState('recommended'); // 'cost', 'speed', 'recommended'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'express', 'standard', 'economy'
  const [showEditForm, setShowEditForm] = useState(false);
  const [priorityCountries, setPriorityCountries] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef(null);
  const [editFormData, setEditFormData] = useState({
    from_country: quoteData.from_country || 'IN',
    to_country: quoteData.to_country || quoteData.to || '',
    shipment_type: shipmentType,
    weight: packages.reduce((total, pkg) => {
      const weight = parseFloat(pkg.weight) || 0;
      const quantity = parseInt(pkg.quantity) || 1;
      return total + (weight * quantity);
    }, 0).toString(),
    length: packages[0]?.length || '',
    width: packages[0]?.width || '',
    height: packages[0]?.height || '',
    value: contentItems.reduce((total, item) => {
      const value = parseFloat(item.value) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (value * quantity);
    }, 0).toString()
  });
  const { toast } = useToast();

  // Function to get carrier logo
  const getCarrierLogo = (carrierName) => {
    if (!carrierName) return null;
    
    const carrierKey = carrierName.toLowerCase().replace(/\s+/g, '');
    const logoMap = {
      'arame': '/assets/images/carriers/arame.png',
      'bluedart': '/assets/images/carriers/bluedart.png',
      'dhl': '/assets/images/carriers/dhl.png',
      'dtdc': '/assets/images/carriers/dtdc.png',
      'fedex': '/assets/images/carriers/fedex.jpg',
      'ups': '/assets/images/carriers/ups.jpeg'
    };
    
    // Try exact match first
    if (logoMap[carrierKey]) {
      return logoMap[carrierKey];
    }
    
    // Try partial matches for common variations
    for (const [key, logo] of Object.entries(logoMap)) {
      if (carrierKey.includes(key) || key.includes(carrierKey)) {
        return logo;
      }
    }
    
    return null;
  };

  // Helper to get country name from code
  const getCountryName = (countryCode) => {
    // First try to find in Priority Connections countries
    const priorityCountry = priorityCountries.find(
      country => (country.code || country.countryCode) === countryCode
    );
    
    if (priorityCountry) {
      return priorityCountry.name || priorityCountry.countryName;
    }
    
    // Fallback to static mapping
    const countries = {
      'US': 'United States',
      'UK': 'United Kingdom', 
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'IN': 'India',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'JP': 'Japan',
      'SG': 'Singapore',
      'HK': 'Hong Kong',
      'AE': 'United Arab Emirates',
      'SA': 'Saudi Arabia'
    };
    return countries[countryCode] || countryCode;
  };

  // Debug: Log the quoteData to see what's being passed
  console.log('QuoteComparison - quoteData:', quoteData);

  // Debug: Log the quoteData to see what's being passed
  console.log('QuoteComparison - quoteData:', quoteData);

  // Load Priority Connections countries for proper country name mapping
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await quotesAPI.getPriorityConnectionsCountries();
        setPriorityCountries(response.countries || []);
      } catch (error) {
        console.error('Error loading countries in QuoteComparison:', error);
      }
    };

    loadCountries();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleSaveEdit = () => {
    // Validation
    if (!editFormData.to_country) {
      toast({
        title: "Missing Information",
        description: "Please select destination country",
        variant: "destructive"
      });
      return;
    }

    if (editFormData.shipment_type === 'parcel' && (!editFormData.weight || !editFormData.length || !editFormData.width || !editFormData.height)) {
      toast({
        title: "Missing Information", 
        description: "Please fill in weight and dimensions for parcel shipments",
        variant: "destructive"
      });
      return;
    }

    // Clear any pending updates immediately
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set updating state
    setIsUpdating(true);

    // Create updated data in the format expected by parent
    const updatedData = {
      from_country: editFormData.from_country,
      to_country: editFormData.to_country,
      shipment_type: editFormData.shipment_type,
      packages: [{
        id: 1,
        weight: editFormData.weight,
        length: editFormData.length,
        width: editFormData.width,
        height: editFormData.height,
        quantity: 1
      }],
      content_items: [{
        id: 1,
        description: editFormData.shipment_type === 'document' ? 'Documents' : 'General Items',
        quantity: 1,
        value: editFormData.value || '100',
        hsn_code: ''
      }]
    };

    // Call the update function immediately (no debouncing)
    if (onUpdateQuote) {
      onUpdateQuote(updatedData);
    }
    
    setShowEditForm(false);
    setIsUpdating(false);
    
    toast({
      title: "Details Updated",
      description: "Getting new quotes with updated information...",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Getting Best Rates...</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quotes Available</h3>
        <p className="text-gray-600">Please adjust your shipping details and try again.</p>
      </div>
    );
  }

  // Filter quotes based on service level
  const filteredQuotes = quotes.filter(quote => {
    if (filterBy === 'all') return true;
    return quote.service_level === filterBy;
  });

  // Sort quotes based on selected criteria
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'cost':
        return a.total_cost - b.total_cost;
      case 'recommended':
        // Put recommended quote first
        if (recommendedQuote) {
          if (a.carrier_name === recommendedQuote.carrier_name) return -1;
          if (b.carrier_name === recommendedQuote.carrier_name) return 1;
        }
        // Then sort by cost
        return a.total_cost - b.total_cost;
      default:
        return 0;
    }
  });

  const handleSelectQuote = (quote) => {
    setSelectedQuoteId(quote.carrier_reference || quote.rate_id);
    
    if (onSelectQuote) {
      onSelectQuote(quote);
    } else {
      toast({
        title: "Quote Selected",
        description: `Selected ${quote.carrier_name} for ₹${quote.total_cost}`,
      });
    }
  };

  const getBadgeForQuote = (quote, allQuotes) => {
    const cheapest = allQuotes.reduce((min, q) => q.total_cost < min.total_cost ? q : min);
    
    // Check if this is the AI recommended quote
    if (recommendedQuote && quote.carrier_name === recommendedQuote.carrier_name) {
      return { text: "AI Recommended", color: "bg-purple-500", icon: <Zap className="w-3 h-3" /> };
    }
    
    if (quote.carrier_reference === cheapest.carrier_reference) {
      return { text: "Best Price", color: "bg-green-500", icon: <Award className="w-3 h-3" /> };
    }
    
    return null;
  };

  const getServiceLevelColor = (level) => {
    switch (level) {
      case 'express': return 'text-red-600 bg-red-50';
      case 'overnight': return 'text-purple-600 bg-purple-50';
      case 'standard': return 'text-blue-600 bg-blue-50';
      case 'economy': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Summary Section */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">Quote Summary</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditForm(!showEditForm)}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              {showEditForm ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Details
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!showEditForm ? (
            // Summary View
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">From:</span>
                  <p className="font-medium">India</p>
                </div>
                <div>
                  <span className="text-slate-600">To:</span>
                  <p className="font-medium">{getCountryName(quoteData.to_country || quoteData.to) || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-600">Type:</span>
                  <p className="font-medium capitalize">{shipmentType}</p>
                </div>
                <div>
                  <span className="text-slate-600">Weight:</span>
                  <p className="font-medium">
                    {/* Always show actual weight entered by user */}
                    {packages.reduce((total, pkg) => {
                      const weight = parseFloat(pkg.weight) || 0;
                      const quantity = parseInt(pkg.quantity) || 1;
                      return total + (weight * quantity);
                    }, 0).toFixed(1)} kg (actual weight)
                  </p>
                </div>
              </div>
              
              {shipmentType === 'parcel' && packages.length > 0 && packages[0].length && (
                <div className="border-t pt-3">
                  <span className="text-slate-600 text-sm">Dimensions:</span>
                  <p className="text-sm font-medium">
                    {packages[0].length} × {packages[0].width} × {packages[0].height} cm
                    {/* Show volumetric weight right after dimensions only if it's greater than 0 */}
                    {quotes.length > 0 && quotes[0].volumetric_weight && quotes[0].volumetric_weight > 0 && (
                      <span className="text-slate-500 ml-2">
                        | Volumetric weight: {Math.ceil(quotes[0].volumetric_weight)} kg
                      </span>
                    )}
                  </p>
                </div>
              )}
              
              {contentItems.length > 0 && contentItems[0].value && (
                <div className="border-t pt-3">
                  <span className="text-slate-600 text-sm">Declared Value:</span>
                  <p className="text-sm font-medium">
                    ₹{contentItems.reduce((total, item) => {
                      const value = parseFloat(item.value) || 0;
                      const quantity = parseInt(item.quantity) || 1;
                      return total + (value * quantity);
                    }, 0)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Edit Form
            <div className="space-y-4">
              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">From</Label>
                  <Select value={editFormData.from_country} onValueChange={(value) => setEditFormData(prev => ({...prev, from_country: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">🇮🇳 India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">To</Label>
                  <Select value={editFormData.to_country} onValueChange={(value) => setEditFormData(prev => ({...prev, to_country: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityCountries.length > 0 ? (
                        priorityCountries.map((country) => (
                          <SelectItem 
                            key={country.code || country.countryCode} 
                            value={country.code || country.countryCode}
                          >
                            {country.name || country.countryName}
                          </SelectItem>
                        ))
                      ) : (
                        // Fallback options while loading
                        <>
                          <SelectItem value="US">🇺🇸 United States</SelectItem>
                          <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                          <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                          <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Shipment Type */}
              <div>
                <Label className="text-sm font-medium">Shipment Type</Label>
                <Select value={editFormData.shipment_type} onValueChange={(value) => setEditFormData(prev => ({...prev, shipment_type: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parcel">📦 Parcel</SelectItem>
                    <SelectItem value="document">📄 Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Weight and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Weight (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={editFormData.weight}
                    onChange={(e) => setEditFormData(prev => ({...prev, weight: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Value (₹)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={editFormData.value}
                    onChange={(e) => setEditFormData(prev => ({...prev, value: e.target.value}))}
                  />
                </div>
              </div>

              {/* Dimensions for Parcel */}
              {editFormData.shipment_type === 'parcel' && (
                <div>
                  <Label className="text-sm font-medium">Dimensions (cm) *</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <Input
                      type="number"
                      placeholder="Length"
                      value={editFormData.length}
                      onChange={(e) => setEditFormData(prev => ({...prev, length: e.target.value}))}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Width"
                      value={editFormData.width}
                      onChange={(e) => setEditFormData(prev => ({...prev, width: e.target.value}))}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Height"
                      value={editFormData.height}
                      onChange={(e) => setEditFormData(prev => ({...prev, height: e.target.value}))}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isUpdating ? 'Updating...' : 'Update Quote'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Compare Shipping Options</h3>
          <p className="text-sm text-gray-600">{sortedQuotes.length} options available</p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            {sortBy === 'cost' ? <SortAsc className="h-4 w-4 text-gray-500" /> : <SortDesc className="h-4 w-4 text-gray-500" />}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">AI Recommended</SelectItem>
                <SelectItem value="cost">Lowest Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {recommendedQuote && sortBy === 'recommended' && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-purple-900">AI Recommendation</h4>
              <p className="text-sm text-purple-700">
                Based on your shipment details, we recommend <strong>{recommendedQuote.carrier_name}</strong> 
                for the best balance of cost, speed, and reliability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quote Cards */}
      <div className="grid gap-4">
        {sortedQuotes.map((quote, index) => {
          const badge = getBadgeForQuote(quote, quotes);
          const isSelected = selectedQuoteId === (quote.carrier_reference || quote.rate_id);
          const isRecommended = recommendedQuote && quote.carrier_name === recommendedQuote.carrier_name;
          
          return (
            <Card 
              key={quote.carrier_reference || quote.rate_id || index}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-orange-500 border-orange-200' : 
                isRecommended ? 'ring-2 ring-purple-300 border-purple-200' :
                'hover:border-orange-200'
              }`}
              onClick={() => handleSelectQuote(quote)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${
                      isRecommended ? 'from-purple-100 to-purple-200' : 'from-orange-100 to-blue-100'
                    } rounded-lg flex items-center justify-center overflow-hidden`}>
                      {(() => {
                        const carrierLogo = getCarrierLogo(quote.carrier_name);
                        if (carrierLogo) {
                          return (
                            <img 
                              src={carrierLogo} 
                              alt={`${quote.carrier_name} logo`}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      {/* Fallback icon - hidden by default, shown if image fails */}
                      {isRecommended ? (
                        <Zap className="h-6 w-6 text-purple-600" style={{ display: getCarrierLogo(quote.carrier_name) ? 'none' : 'block' }} />
                      ) : (
                        <Truck className="h-6 w-6 text-orange-600" style={{ display: getCarrierLogo(quote.carrier_name) ? 'none' : 'block' }} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{quote.carrier_name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600">{quote.service_name}</p>
                        <Badge className={`text-xs ${getServiceLevelColor(quote.service_level)}`}>
                          {quote.service_level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">₹{quote.total_cost.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                </div>
                
                {badge && (
                  <div className="flex items-center">
                    <Badge className={`${badge.color} text-white w-fit flex items-center space-x-1`}>
                      {badge.icon}
                      <span>{badge.text}</span>
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Cost Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rate</span>
                    <span>₹{quote.base_rate.toFixed(0)}</span>
                  </div>
                  {quote.fuel_surcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Surcharge</span>
                      <span>₹{quote.fuel_surcharge.toFixed(0)}</span>
                    </div>
                  )}
                  {quote.insurance_cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance</span>
                      <span>₹{quote.insurance_cost.toFixed(0)}</span>
                    </div>
                  )}
                  {quote.additional_fees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Fees</span>
                      <span>₹{quote.additional_fees.toFixed(0)}</span>
                    </div>
                  )}
                </div>

                {/* Weight Information */}
                {(quote.weight !== undefined && quote.weight !== null) || quote.chargeable_weight || quote.volumetric_weight ? (
                  <div className="space-y-2 text-sm border-t pt-3">
                    {(quote.weight !== undefined && quote.weight !== null) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actual Weight</span>
                        <span>{quote.weight} kg</span>
                      </div>
                    )}
                    {quote.chargeable_weight && quote.chargeable_weight !== quote.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chargeable Weight</span>
                        <span className="font-medium text-orange-600">{quote.chargeable_weight} kg</span>
                      </div>
                    )}
                    {quote.volumetric_weight && quote.volumetric_weight > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volumetric Weight</span>
                        <span className="text-xs text-gray-500">{Math.ceil(quote.volumetric_weight)} kg</span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Features */}
                {quote.features && quote.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Included Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {quote.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className={`w-full ${
                    isSelected 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : isRecommended
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectQuote(quote);
                  }}
                >
                  {isSelected ? (
                    <>
                      Selected
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      {isRecommended ? 'Select Recommended' : 'Select This Option'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedQuoteId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Quote selected! You can now proceed to book your shipment.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteComparison;