import React, { useState, useEffect } from 'react';
import { ArrowRight, Package, FileText, Calculator, Shield, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { quotesAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const Hero = () => {
  const [shipmentType, setShipmentType] = useState('parcel');
  const [quoteData, setQuoteData] = useState({
    from: 'IN',
    to: '',
    weight: '',
    value: '',
    length: '',
    width: '',
    height: ''
  });
  
  // New states for instant quotes
  const [priorityCountries, setPriorityCountries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
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

  // Load Priority Connections countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await quotesAPI.getPriorityConnectionsCountries();
        setPriorityCountries(response.countries || []);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // Handle URL parameters for pre-filling form (when coming back from edit)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.size > 0) {
      const newQuoteData = { ...quoteData };
      
      if (urlParams.get('from')) newQuoteData.from = urlParams.get('from');
      if (urlParams.get('to')) newQuoteData.to = urlParams.get('to');
      if (urlParams.get('weight')) newQuoteData.weight = urlParams.get('weight');
      if (urlParams.get('value')) newQuoteData.value = urlParams.get('value');
      if (urlParams.get('length')) newQuoteData.length = urlParams.get('length');
      if (urlParams.get('width')) newQuoteData.width = urlParams.get('width');
      if (urlParams.get('height')) newQuoteData.height = urlParams.get('height');
      
      if (urlParams.get('type')) {
        setShipmentType(urlParams.get('type'));
      }
      
      setQuoteData(newQuoteData);
      
      // Clear URL parameters after loading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!quoteData.to) {
      toast({
        title: "Missing Information",
        description: "Please select destination country",
        variant: "destructive"
      });
      return;
    }
    
    // For parcel shipments, weight is required
    if (shipmentType === 'parcel' && !quoteData.weight) {
      toast({
        title: "Missing Information", 
        description: "Please enter package weight",
        variant: "destructive"
      });
      return;
    }
    
    // For parcel shipments, weight is required
    if (shipmentType === 'parcel' && !quoteData.weight) {
      toast({
        title: "Missing Information", 
        description: "Please enter package weight",
        variant: "destructive"
      });
      return;
    }
    
    // Dimensions are optional - if not provided, only actual weight will be used
    // If provided, volumetric weight will be calculated and compared with actual weight
    
    // For document shipments, weight is optional (will use default)
    const finalWeight = shipmentType === 'document' ? 0.5 : (parseFloat(quoteData.weight) || 0.5);

    setLoading(true);
    setShowQuotes(false);
    
    try {
      const requestData = {
        from_country: quoteData.from,
        to_country: quoteData.to,
        weight: finalWeight,
        shipment_type: shipmentType,
        declared_value: parseFloat(quoteData.value) || 0,
        // Send dimensions only if they are provided (not empty or zero)
        length: quoteData.length && parseFloat(quoteData.length) > 0 ? parseFloat(quoteData.length) : null,
        width: quoteData.width && parseFloat(quoteData.width) > 0 ? parseFloat(quoteData.width) : null,
        height: quoteData.height && parseFloat(quoteData.height) > 0 ? parseFloat(quoteData.height) : null,
        packages: [{
          id: 1,
          weight: finalWeight,
          // Use provided dimensions or defaults based on shipment type
          length: (quoteData.length && parseFloat(quoteData.length) > 0) ? parseFloat(quoteData.length) : 
                  (shipmentType === 'document' ? 21 : 30),
          width: (quoteData.width && parseFloat(quoteData.width) > 0) ? parseFloat(quoteData.width) : 
                 (shipmentType === 'document' ? 29.7 : 20),
          height: (quoteData.height && parseFloat(quoteData.height) > 0) ? parseFloat(quoteData.height) : 
                  (shipmentType === 'document' ? 1 : 10),
          quantity: 1
        }],
        content_items: [{
          id: 1,
          description: shipmentType === 'document' ? 'Documents' : 'General Items',
          quantity: 1,
          value: parseFloat(quoteData.value) || (shipmentType === 'document' ? 500 : 100),
          hsn_code: ''
        }]
      };

      console.log('DEBUG: Sending quote request with dimensions:', {
        weight: finalWeight,
        length: quoteData.length && parseFloat(quoteData.length) > 0 ? parseFloat(quoteData.length) : null,
        width: quoteData.width && parseFloat(quoteData.width) > 0 ? parseFloat(quoteData.width) : null,
        height: quoteData.height && parseFloat(quoteData.height) > 0 ? parseFloat(quoteData.height) : null,
        shipment_type: shipmentType,
        dimensions_provided: !!(quoteData.length || quoteData.width || quoteData.height)
      });

      const response = await quotesAPI.createQuote(requestData);
      
      console.log('DEBUG: Quote response received:', response);
      console.log('DEBUG: First quote weight info:', response.carrier_quotes?.[0] ? {
        carrier_name: response.carrier_quotes[0].carrier_name,
        weight: response.carrier_quotes[0].weight,
        chargeable_weight: response.carrier_quotes[0].chargeable_weight,
        volumetric_weight: response.carrier_quotes[0].volumetric_weight
      } : 'No quotes');
      
      if (response.carrier_quotes && response.carrier_quotes.length > 0) {
        setQuotes(response.carrier_quotes);
        setShowQuotes(true);
        toast({
          title: "Quotes Generated",
          description: `Found ${response.carrier_quotes.length} shipping options`
        });
      } else {
        toast({
          title: "No Quotes Available",
          description: "No carriers available for this route. Please try different options.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Quote error:', error);
      toast({
        title: "Quote Failed",
        description: error.response?.data?.detail || "Failed to get quotes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-16 lg:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f97316%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Text */}
          <div className="text-left">
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              <span>Trusted by 10,000+ Businesses</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Multi-Channel
              <span className="text-orange-500 block">Shipping</span>
              Made Simple
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Compare rates from 15+ premium carriers. Save up to 60% on domestic and international shipping. 
              Door-to-door delivery with real-time tracking.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Calculator className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Save up to 60%</p>
                  <p className="text-sm text-slate-600">Compare & choose best rates</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">190+ Countries</p>
                  <p className="text-sm text-slate-600">Worldwide delivery network</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                onClick={() => window.location.href = '/quote'}
              >
                Start Shipping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Column - Quote Form */}
          <div className="lg:justify-self-end w-full max-w-md">
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-slate-900">Get Instant Quote</CardTitle>
                <p className="text-slate-600">Compare rates from multiple carriers</p>
              </CardHeader>
              
              <CardContent>
                {!showQuotes ? (
                  <form onSubmit={handleQuoteSubmit} className="space-y-4">
                    {/* Shipment Type */}
                    <Tabs value={shipmentType} onValueChange={setShipmentType} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="parcel" className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>Parcel</span>
                        </TabsTrigger>
                        <TabsTrigger value="document" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Document</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="parcel" className="space-y-4 mt-4">
                        {/* From/To */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="from" className="text-sm font-medium">From</Label>
                            <Select value={quoteData.from} onValueChange={(value) => setQuoteData({...quoteData, from: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IN">🇮🇳 India</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="to" className="text-sm font-medium">To</Label>
                            <Select value={quoteData.to} onValueChange={(value) => setQuoteData({...quoteData, to: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingCountries ? (
                                  <div className="px-2 py-1 text-xs text-slate-500">Loading destinations...</div>
                                ) : (
                                  priorityCountries.map((country) => (
                                    <SelectItem key={country.code || country.countryCode} value={country.code || country.countryCode}>
                                      {country.name || country.countryName}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Weight, Value, and Dimensions for Parcel */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="weight" className="text-sm font-medium">
                                Weight (kg) *
                              </Label>
                              <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                placeholder="1.0"
                                value={quoteData.weight}
                                onChange={(e) => setQuoteData({...quoteData, weight: e.target.value})}
                                required
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="value" className="text-sm font-medium">Value (₹)</Label>
                              <Input
                                id="value"
                                type="number"
                                placeholder="1000"
                                value={quoteData.value}
                                onChange={(e) => setQuoteData({...quoteData, value: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Dimensions (cm) - Optional</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                type="number"
                                placeholder="Length"
                                value={quoteData.length}
                                onChange={(e) => setQuoteData({...quoteData, length: e.target.value})}
                                min="0"
                                step="0.1"
                              />
                              <Input
                                type="number"
                                placeholder="Width"
                                value={quoteData.width}
                                onChange={(e) => setQuoteData({...quoteData, width: e.target.value})}
                                min="0"
                                step="0.1"
                              />
                              <Input
                                type="number"
                                placeholder="Height"
                                value={quoteData.height}
                                onChange={(e) => setQuoteData({...quoteData, height: e.target.value})}
                                min="0"
                                step="0.1"
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              For accurate pricing - volumetric weight will be calculated if dimensions are provided
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="document" className="space-y-4 mt-4">
                        {/* From/To for Documents */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="from-doc" className="text-sm font-medium">From</Label>
                            <Select value={quoteData.from} onValueChange={(value) => setQuoteData({...quoteData, from: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IN">🇮🇳 India</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="to-doc" className="text-sm font-medium">To</Label>
                            <Select value={quoteData.to} onValueChange={(value) => setQuoteData({...quoteData, to: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingCountries ? (
                                  <div className="px-2 py-1 text-xs text-slate-500">Loading destinations...</div>
                                ) : (
                                  priorityCountries.map((country) => (
                                    <SelectItem key={country.code || country.countryCode} value={country.code || country.countryCode}>
                                      {country.name || country.countryName}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="value-doc" className="text-sm font-medium">Document Value (₹)</Label>
                          <Input
                            id="value-doc"
                            type="number"
                            placeholder="500"
                            value={quoteData.value}
                            onChange={(e) => setQuoteData({...quoteData, value: e.target.value})}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Quotes...
                        </>
                      ) : (
                        <>
                          Get Instant Quote
                          <Calculator className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  /* Instant Quotes Display */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">Shipping Quotes</h3>
                        <p className="text-sm text-slate-600">
                          {/* Show weight information professionally */}
                          {quotes.length > 0 ? (
                            <>
                              {parseFloat(quoteData.weight || 0).toFixed(1)}kg from India to {
                                priorityCountries.find(country => 
                                  (country.code || country.countryCode) === quoteData.to
                                )?.name || 
                                priorityCountries.find(country => 
                                  (country.code || country.countryCode) === quoteData.to
                                )?.countryName || 
                                'destination'
                              }
                            </>
                          ) : (
                            `${quoteData.weight || 'N/A'}kg from India to destination`
                          )}
                        </p>
                        {/* Show volumetric weight information if calculated and greater than 0 */}
                        {quotes.length > 0 && quotes[0].volumetric_weight && 
                         quotes[0].volumetric_weight > 0 &&
                         quotes[0].volumetric_weight > parseFloat(quoteData.weight || 0) ? (
                          <p className="text-xs text-slate-500 mt-1">
                            Volumetric weight: {Math.ceil(quotes[0].volumetric_weight)}kg applies for pricing
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQuotes(false)}
                      >
                        New Quote
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {quotes.slice(0, 3).map((quote, index) => (
                        <div key={index} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-orange-100 p-2 rounded-lg w-10 h-10 flex items-center justify-center overflow-hidden">
                                {(() => {
                                  const carrierLogo = getCarrierLogo(quote.carrier_name);
                                  if (carrierLogo) {
                                    return (
                                      <img 
                                        src={carrierLogo} 
                                        alt={`${quote.carrier_name} logo`}
                                        className="w-8 h-8 object-contain"
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
                                <Package 
                                  className="h-4 w-4 text-orange-600" 
                                  style={{ display: getCarrierLogo(quote.carrier_name) ? 'none' : 'block' }} 
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{quote.carrier_name}</p>
                                <p className="text-sm text-slate-600">{quote.estimated_delivery_days} days</p>
                                {/* Professional weight information display */}
                                <div className="text-xs text-slate-500 space-y-0.5">
                                  {/* Show actual weight */}
                                  <div>Actual weight: {parseFloat(quoteData.weight || 0).toFixed(1)}kg</div>
                                  {/* Show volumetric weight only if dimensions were provided AND volumetric weight is greater than 0 */}
                                  {quote.volumetric_weight && 
                                   quote.volumetric_weight > 0 &&
                                   (quoteData.length || quoteData.width || quoteData.height) ? (
                                    <div>Volumetric: {Math.ceil(quote.volumetric_weight)}kg</div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">₹{quote.total_cost.toFixed(0)}</p>
                              <p className="text-xs text-slate-500">All inclusive</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t">
                      <Button 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => {
                          // Pass the form data to quote page via URL parameters
                          const searchParams = new URLSearchParams();
                          
                          if (quoteData.from) searchParams.set('from', quoteData.from);
                          if (quoteData.to) searchParams.set('to', quoteData.to);
                          
                          // Use the same weight logic as in form submission
                          const finalWeight = shipmentType === 'document' ? 
                            (quoteData.weight || '0.5') : 
                            quoteData.weight;
                          if (finalWeight) searchParams.set('weight', finalWeight);
                          
                          if (quoteData.value) searchParams.set('value', quoteData.value);
                          searchParams.set('type', shipmentType);
                          
                          // Add dimensions only if they have values
                          if (quoteData.length && parseFloat(quoteData.length) > 0) {
                            searchParams.set('length', quoteData.length);
                          }
                          if (quoteData.width && parseFloat(quoteData.width) > 0) {
                            searchParams.set('width', quoteData.width);
                          }
                          if (quoteData.height && parseFloat(quoteData.height) > 0) {
                            searchParams.set('height', quoteData.height);
                          }
                          
                          // Add default dimensions for documents if not provided
                          if (shipmentType === 'document') {
                            if (!quoteData.length) searchParams.set('length', '21');
                            if (!quoteData.width) searchParams.set('width', '29.7');
                            if (!quoteData.height) searchParams.set('height', '1');
                          }
                          
                          searchParams.set('autoSubmit', 'true'); // Auto-submit the form
                          
                          const queryString = searchParams.toString();
                          window.location.href = `/quote${queryString ? '?' + queryString : ''}`;
                        }}
                      >
                        View All Options & Book
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;