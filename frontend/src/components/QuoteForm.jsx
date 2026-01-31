import React, { useState, useEffect } from 'react';
import { Calculator, Package, FileText, MapPin, Plus, Trash2, AlertTriangle, X, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { quotesAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import QuoteComparison from './QuoteComparison';
import BookingFlow from './BookingFlow';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';

// Prohibited Items List
const prohibitedItems = [
  "Explosives and Fireworks",
  "Flammable Liquids and Gases",
  "Toxic and Infectious Substances",
  "Radioactive Materials",
  "Corrosive Materials",
  "Weapons and Ammunition",
  "Illegal Drugs and Narcotics",
  "Counterfeit Goods",
  "Live Animals",
  "Human Remains",
  "Perishable Food Items (without proper packaging)",
  "Lithium Batteries (loose/uninstalled)",
  "Aerosols and Compressed Gases",
  "Magnetized Materials",
  "Cash and Negotiable Instruments"
];

const QuoteForm = () => {
  const [shipmentType, setShipmentType] = useState('parcel');
  const [quoteData, setQuoteData] = useState({
    from_country: 'IN',
    from_postal_code: '',
    to_country: '',
    to_postal_code: '',
    shipment_type: 'parcel',
    weight: '',
    length: '',
    width: '',
    height: '',
    declared_value: '',
    insurance_required: false,
    signature_required: false
  });
  
  // State for Priority Connections data (only real data)
  const [priorityCountries, setPriorityCountries] = useState([]);
  const [priorityProviders, setPriorityProviders] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  
  // New state for multiple packages
  const [packages, setPackages] = useState([
    { id: 1, weight: '', length: '', width: '', height: '', quantity: 1 }
  ]);
  
  // New state for content items
  const [contentItems, setContentItems] = useState([
    { id: 1, description: '', quantity: 1, value: '', hsn_code: '' }
  ]);
  
  const [showProhibitedItems, setShowProhibitedItems] = useState(false);
  const [quotes, setQuotes] = useState(null);
  const [recommendedQuote, setRecommendedQuote] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [quoteResponse, setQuoteResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentRequestController, setCurrentRequestController] = useState(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Load Priority Connections countries on component mount (only real data)
  useEffect(() => {
    const loadPriorityConnectionsData = async () => {
      setLoadingCountries(true);
      try {
        const response = await quotesAPI.getPriorityConnectionsCountries();
        setPriorityCountries(response.countries || []);
      } catch (error) {
        console.error('Error loading Priority Connections countries:', error);
        toast({
          title: "Error",
          description: "Could not load international destinations. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingCountries(false);
      }
    };

    loadPriorityConnectionsData();
  }, []);

  // Cleanup: Cancel any pending requests on unmount
  useEffect(() => {
    return () => {
      if (currentRequestController) {
        currentRequestController.abort();
      }
    };
  }, [currentRequestController]);

  // Handle URL parameters from Hero form - run after countries are loaded
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    
    if (urlParams.get('from')) params.from_country = urlParams.get('from');
    if (urlParams.get('to')) params.to_country = urlParams.get('to');
    if (urlParams.get('weight')) params.weight = urlParams.get('weight');
    if (urlParams.get('value')) params.declared_value = urlParams.get('value');
    if (urlParams.get('length')) params.length = urlParams.get('length');
    if (urlParams.get('width')) params.width = urlParams.get('width');
    if (urlParams.get('height')) params.height = urlParams.get('height');
    if (urlParams.get('type')) {
      const type = urlParams.get('type');
      setShipmentType(type);
      params.shipment_type = type;
    }
    
    if (Object.keys(params).length > 0) {
      console.log('QuoteForm - URL params found:', params);
      setQuoteData(prev => ({ ...prev, ...params }));
      
      // Pre-fill packages array with weight from URL parameters
      if (urlParams.get('weight')) {
        const weight = urlParams.get('weight');
        const newPackages = [{
          id: 1,
          weight: weight,
          length: urlParams.get('length') || '',
          width: urlParams.get('width') || '',
          height: urlParams.get('height') || '',
          quantity: 1
        }];
        setPackages(newPackages);
      }
      
      // Pre-fill content items with value from URL parameters
      if (urlParams.get('value')) {
        const value = urlParams.get('value');
        const shipmentType = urlParams.get('type') || 'parcel';
        const newContentItems = [{
          id: 1,
          description: shipmentType === 'document' ? 'Documents' : 'General Items',
          quantity: 1,
          value: value,
          hsn_code: ''
        }];
        setContentItems(newContentItems);
      }
      
      // Auto-submit if flag is present and we have minimum required data
      // Only auto-submit after countries are loaded to ensure the country selection is valid
      if (urlParams.get('autoSubmit') === 'true' && params.to_country && urlParams.get('weight') && priorityCountries.length > 0) {
        setShouldAutoSubmit(true);
      }
    }
  }, [priorityCountries]); // Run this effect when countries are loaded

  // Load providers when destination country changes (only real data)
  useEffect(() => {
    const loadProviders = async () => {
      if (!quoteData.to_country) {
        setPriorityProviders([]);
        return;
      }

      // Get country name from Priority Connections countries
      const selectedCountry = priorityCountries.find(
        country => country.code === quoteData.to_country || country.countryCode === quoteData.to_country
      );
      
      if (!selectedCountry) return;

      const countryName = selectedCountry.name || selectedCountry.countryName;
      
      setLoadingProviders(true);
      try {
        const response = await quotesAPI.getPriorityConnectionsProviders(countryName);
        setPriorityProviders(response.providers || []);
      } catch (error) {
        console.error('Error loading providers:', error);
        setPriorityProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    };

    loadProviders();
  }, [quoteData.to_country, priorityCountries]);

  // Restore saved booking state after authentication
  useEffect(() => {
    if (user && !authLoading) {
      const savedState = localStorage.getItem('xfas_pending_booking');
      if (savedState) {
        try {
          const formState = JSON.parse(savedState);
          
          // Check if the saved state is not too old (within 1 hour)
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - formState.timestamp < oneHour) {
            // Restore form state
            setQuoteData(formState.quoteData || quoteData);
            setPackages(formState.packages || packages);
            setContentItems(formState.contentItems || contentItems);
            setShipmentType(formState.shipmentType || shipmentType);
            setQuotes(formState.quotes || null);
            setRecommendedQuote(formState.recommendedQuote || null);
            setQuoteResponse(formState.quoteResponse || null);
            
            // Close any open modals
            setShowLoginModal(false);
            setShowRegisterModal(false);
            
            // If there was a selected quote, proceed with booking
            if (formState.selectedQuote) {
              const quote = formState.selectedQuote;
              setSelectedQuote({
                ...quote,
                ...formState.quoteData,
                shipment_type: formState.shipmentType
              });
              setShowBookingFlow(true);
              
              toast({
                title: "Welcome Back!",
                description: `Continuing with ${quote.carrier_name} booking - ₹${quote.total_cost}`
              });
            } else {
              toast({
                title: "Form Restored",
                description: "Your quote information has been restored. You can continue where you left off."
              });
            }
          }
          
          // Clear the saved state after restoration
          localStorage.removeItem('xfas_pending_booking');
        } catch (error) {
          console.error('Error restoring saved booking state:', error);
          localStorage.removeItem('xfas_pending_booking');
        }
      }
    }
  }, [user, authLoading]);

  const handleInputChange = (name, value) => {
    setQuoteData(prev => ({
      ...prev,
      [name]: value,
      shipment_type: shipmentType
    }));
  };

  // Package management functions
  const addPackage = () => {
    setPackages([...packages, { 
      id: Date.now(), 
      weight: '', 
      length: '', 
      width: '', 
      height: '', 
      quantity: 1 
    }]);
  };

  const removePackage = (id) => {
    if (packages.length > 1) {
      setPackages(packages.filter(pkg => pkg.id !== id));
    }
  };

  const updatePackage = (id, field, value) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { ...pkg, [field]: value } : pkg
    ));
  };

  // Content items management functions
  const addContentItem = () => {
    setContentItems([...contentItems, { 
      id: Date.now(), 
      description: '', 
      quantity: 1, 
      value: '', 
      hsn_code: '' 
    }]);
  };

  const removeContentItem = (id) => {
    if (contentItems.length > 1) {
      setContentItems(contentItems.filter(item => item.id !== id));
    }
  };

  const updateContentItem = (id, field, value) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Use current state data
    await handleSubmitWithData();
  };

  const handleSubmitWithData = async (overrideData = null) => {
    // Use override data if provided, otherwise use current state
    const currentQuoteData = overrideData ? {
      from_country: overrideData.from_country,
      to_country: overrideData.to_country,
      shipment_type: overrideData.shipment_type
    } : quoteData;
    
    const currentPackages = overrideData ? overrideData.packages : packages;
    const currentContentItems = overrideData ? overrideData.content_items : contentItems;
    const currentShipmentType = overrideData ? overrideData.shipment_type : shipmentType;
    
    console.log('📊 handleSubmitWithData called with:', {
      override: !!overrideData,
      weight: currentPackages[0]?.weight,
      dimensions: `${currentPackages[0]?.length}x${currentPackages[0]?.width}x${currentPackages[0]?.height}`
    });
    
    // Cancel any existing request
    if (currentRequestController) {
      console.log('🚫 Cancelling previous request');
      currentRequestController.abort();
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    setCurrentRequestController(controller);
    
    // Generate a unique request ID for debugging
    const requestId = Date.now();
    console.log(`🚀 Starting new request ${requestId}`);
    
    // Validation
    if (!currentQuoteData.to_country) {
      toast({
        title: "Missing Information",
        description: "Please select destination country",
        variant: "destructive"
      });
      setCurrentRequestController(null);
      return;
    }

    // Validate packages for parcel shipments
    if (currentShipmentType === 'parcel') {
      // Ensure we have at least one package with weight (dimensions are optional)
      if (currentPackages.length === 0 || !currentPackages[0].weight) {
        toast({
          title: "Missing Information", 
          description: "Please fill in weight for parcel shipments",
          variant: "destructive"
        });
        setCurrentRequestController(null);
        return;
      }
    }

    // Validate content items
    if (currentContentItems.length === 0 || !currentContentItems[0].description) {
      toast({
        title: "Missing Information", 
        description: "Please provide a description of your shipment contents",
        variant: "destructive"
      });
      setCurrentRequestController(null);
      return;
    }

    setLoading(true);
    
    try {
      // Calculate total weight from all packages
      const totalWeight = currentPackages.reduce((sum, pkg) => {
        const pkgWeight = parseFloat(pkg.weight) || 0;
        const pkgQty = parseInt(pkg.quantity) || 1;
        return sum + (pkgWeight * pkgQty);
      }, 0);

      // Calculate total declared value from content items
      const totalValue = currentContentItems.reduce((sum, item) => {
        const itemValue = parseFloat(item.value) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        return sum + (itemValue * itemQty);
      }, 0);

      const requestData = {
        ...currentQuoteData,
        weight: totalWeight || parseFloat(currentQuoteData.weight) || 0.5,
        length: parseFloat(currentPackages[0]?.length) || null,
        width: parseFloat(currentPackages[0]?.width) || null,
        height: parseFloat(currentPackages[0]?.height) || null,
        declared_value: totalValue || parseFloat(currentQuoteData.declared_value) || 0,
        packages: currentPackages,
        content_items: currentContentItems
      };

      console.log(`📤 Request ${requestId} data:`, {
        weight: requestData.weight,
        length: requestData.length,
        width: requestData.width,
        height: requestData.height
      });

      const response = await quotesAPI.createQuote(requestData, { signal: controller.signal });
      
      // Only update state if request wasn't aborted
      if (!controller.signal.aborted) {
        console.log(`✅ Request ${requestId} completed successfully`);
        if (response.carrier_quotes && response.carrier_quotes.length > 0) {
          setQuotes(response.carrier_quotes);
          setRecommendedQuote(response.recommended_quote || null);
          setQuoteResponse(response);
          toast({
            title: "Quotes Generated",
            description: `Found ${response.carrier_quotes.length} shipping options${response.recommended_quote ? ' with AI recommendation' : ''}`
          });
        } else {
          toast({
            title: "No Quotes Available",
            description: "No carriers available for this route. Please try different options.",
            variant: "destructive"
          });
        }
      } else {
        console.log(`🚫 Request ${requestId} was aborted`);
      }
    } catch (error) {
      // Don't show error if request was aborted
      if (!controller.signal.aborted) {
        console.error(`❌ Request ${requestId} failed:`, error);
        toast({
          title: "Quote Failed",
          description: error.response?.data?.detail || "Failed to get quotes. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log(`🚫 Request ${requestId} was aborted (in catch)`);
      }
    } finally {
      if (!controller.signal.aborted) {
        console.log(`🏁 Request ${requestId} finished`);
        setLoading(false);
        setCurrentRequestController(null);
      }
    }
  };

  // Auto-submit effect when data is loaded
  useEffect(() => {
    if (shouldAutoSubmit && quoteData.to_country) {
      // Check if we have weight either in quoteData or packages
      const hasWeight = quoteData.weight || packages.some(pkg => pkg.weight);
      
      if (hasWeight) {
        setShouldAutoSubmit(false);
        // Small delay to ensure state is fully updated
        const timer = setTimeout(() => {
          handleSubmit();
        }, 500); // Increased delay to ensure packages are populated
        return () => clearTimeout(timer);
      }
    }
  }, [shouldAutoSubmit, quoteData.to_country, quoteData.weight, packages]);

  // New effect to handle direct quote fetching when coming from Hero
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoSubmit = urlParams.get('autoSubmit');
    
    // If we have autoSubmit and all required data, fetch quotes immediately
    if (autoSubmit === 'true' && quoteData.to_country && !quotes && !loading) {
      const hasWeight = quoteData.weight || packages.some(pkg => pkg.weight);
      const hasRequiredData = shipmentType === 'document' || 
        (shipmentType === 'parcel' && hasWeight); // Dimensions are optional
      
      if (hasRequiredData) {
        handleSubmit();
      }
    }
  }, [quoteData, packages, shipmentType, quotes, loading]);

  // Ensure we always have at least one package and content item
  useEffect(() => {
    if (packages.length === 0) {
      setPackages([{ id: 1, weight: '', length: '', width: '', height: '', quantity: 1 }]);
    }
    if (contentItems.length === 0) {
      setContentItems([{ id: 1, description: '', quantity: 1, value: '', hsn_code: '' }]);
    }
  }, [packages.length, contentItems.length]);

  const handleSelectQuote = (quote) => {
    if (!user) {
      // Save current form state and selected quote to localStorage for restoration after login
      const formState = {
        quoteData,
        packages,
        contentItems,
        shipmentType,
        quotes,
        selectedQuote: quote,
        recommendedQuote,
        quoteResponse,
        timestamp: Date.now()
      };
      
      localStorage.setItem('xfas_pending_booking', JSON.stringify(formState));
      
      // Show login modal instead of redirecting
      setShowLoginModal(true);
      
      toast({
        title: "Sign In Required",
        description: "Please sign in to proceed with booking. Your quote will be saved.",
        variant: "destructive"
      });
      
      return;
    }

    setSelectedQuote({
      ...quote,
      // Add original quote data for booking
      ...quoteData,
      shipment_type: shipmentType
    });
    setShowBookingFlow(true);
    
    toast({
      title: "Quote Selected",
      description: `Selected ${quote.carrier_name} - ₹${quote.total_cost}. Proceeding to booking.`
    });
  };

  const handleBackToQuotes = () => {
    setShowBookingFlow(false);
    setSelectedQuote(null);
  };

  const handleBookingComplete = (bookingResult) => {
    toast({
      title: "Booking Successful!",
      description: `Your AWB number is ${bookingResult.carrier_info?.tracking_number}`,
    });
    
    // Don't auto-reset the form - let user stay on confirmation page
    // User can manually navigate away using the provided buttons
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {showBookingFlow ? (
        <BookingFlow
          selectedQuote={selectedQuote}
          quoteId={quoteResponse?.id}
          onBack={handleBackToQuotes}
          onComplete={handleBookingComplete}
        />
      ) : loading && !quotes ? (
        // Show loading state when fetching quotes
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
              <Calculator className="mr-3 h-6 w-6 text-orange-500" />
              Getting Your Quotes
            </CardTitle>
            <p className="text-slate-600">Comparing rates from multiple carriers...</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
          </CardContent>
        </Card>
      ) : !quotes ? (
        // Show simple quote form when no quotes exist
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
              <Calculator className="mr-3 h-6 w-6 text-orange-500" />
              Get Shipping Quote
            </CardTitle>
            <p className="text-slate-600">Compare rates from multiple carriers instantly</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="mt-6 space-y-6">
                  {/* From/To Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-lg font-semibold">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        <span>From</span>
                      </div>
                      
                      <div>
                        <Label>Country</Label>
                        <Select 
                          value={quoteData.from_country} 
                          onValueChange={(value) => handleInputChange('from_country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IN">🇮🇳 India</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Postal Code (Optional)</Label>
                        <Input
                          placeholder="400001"
                          value={quoteData.from_postal_code}
                          onChange={(e) => handleInputChange('from_postal_code', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-lg font-semibold">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <span>To</span>
                      </div>
                      
                      <div>
                        <Label>Country</Label>
                        <Select 
                          value={quoteData.to_country} 
                          onValueChange={(value) => handleInputChange('to_country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityCountries.length > 0 && (
                              priorityCountries.map((country) => (
                                <SelectItem 
                                  key={country.code || country.countryCode} 
                                  value={country.code || country.countryCode}
                                >
                                  {country.name || country.countryName}
                                </SelectItem>
                              ))
                            )}
                            
                            {loadingCountries && (
                              <div className="px-2 py-1 text-xs text-slate-500">
                                Loading destinations...
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Postal Code (Optional)</Label>
                        <Input
                          placeholder="10001"
                          value={quoteData.to_postal_code}
                          onChange={(e) => handleInputChange('to_postal_code', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Package Details for Parcel */}
                  <TabsContent value="parcel" className="space-y-4 mt-4">
                    <div className="space-y-4">
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
                            value={packages[0]?.weight || ''}
                            onChange={(e) => updatePackage(packages[0]?.id || 1, 'weight', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="value" className="text-sm font-medium">Value (₹)</Label>
                          <Input
                            id="value"
                            type="number"
                            placeholder="1000"
                            value={contentItems[0]?.value || ''}
                            onChange={(e) => updateContentItem(contentItems[0]?.id || 1, 'value', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Dimensions (cm) - Optional</Label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          <Input
                            type="number"
                            placeholder="Length"
                            value={packages[0]?.length || ''}
                            onChange={(e) => updatePackage(packages[0]?.id || 1, 'length', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Width"
                            value={packages[0]?.width || ''}
                            onChange={(e) => updatePackage(packages[0]?.id || 1, 'width', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Height"
                            value={packages[0]?.height || ''}
                            onChange={(e) => updatePackage(packages[0]?.id || 1, 'height', e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          If provided, volumetric weight will be calculated and compared with actual weight
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Content Description *</Label>
                        <Input
                          placeholder="e.g., Electronics, Clothing, Books"
                          value={contentItems[0]?.description || ''}
                          onChange={(e) => updateContentItem(contentItems[0]?.id || 1, 'description', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="document" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="value-doc" className="text-sm font-medium">Document Value (₹)</Label>
                      <Input
                        id="value-doc"
                        type="number"
                        placeholder="500"
                        value={contentItems[0]?.value || ''}
                        onChange={(e) => updateContentItem(contentItems[0]?.id || 1, 'value', e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Additional Services</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={quoteData.insurance_required}
                        onCheckedChange={(checked) => handleInputChange('insurance_required', checked)}
                      />
                      <Label htmlFor="insurance" className="text-sm">
                        Insurance Coverage (Recommended for valuable items)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="signature"
                        checked={quoteData.signature_required}
                        onCheckedChange={(checked) => handleInputChange('signature_required', checked)}
                      />
                      <Label htmlFor="signature" className="text-sm">
                        Signature Required on Delivery
                      </Label>
                    </div>
                  </div>
                </div>
              </Tabs>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? "Getting Quotes..." : "Compare Rates & Get Quote"}
                <Calculator className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <QuoteComparison 
          key={`${quoteData.to_country}-${packages[0]?.weight}-${packages[0]?.length}-${packages[0]?.width}-${packages[0]?.height}-${Date.now()}`}
          quotes={quotes} 
          onSelectQuote={handleSelectQuote}
          loading={loading}
          recommendedQuote={recommendedQuote}
          quoteData={quoteData}
          packages={packages}
          contentItems={contentItems}
          shipmentType={shipmentType}
          onEditQuote={() => {
            // Redirect back to home page with current data pre-filled
            const searchParams = new URLSearchParams();
            
            if (quoteData.from_country) searchParams.set('from', quoteData.from_country);
            if (quoteData.to_country) searchParams.set('to', quoteData.to_country);
            if (shipmentType) searchParams.set('type', shipmentType);
            
            // Get weight from packages or quoteData
            const totalWeight = packages.reduce((total, pkg) => {
              const weight = parseFloat(pkg.weight) || 0;
              const quantity = parseInt(pkg.quantity) || 1;
              return total + (weight * quantity);
            }, 0);
            if (totalWeight > 0) searchParams.set('weight', totalWeight.toString());
            
            // Get value from content items or quoteData
            const totalValue = contentItems.reduce((total, item) => {
              const value = parseFloat(item.value) || 0;
              const quantity = parseInt(item.quantity) || 1;
              return total + (value * quantity);
            }, 0);
            if (totalValue > 0) searchParams.set('value', totalValue.toString());
            
            // Get dimensions from first package
            if (packages.length > 0 && packages[0].length) {
              searchParams.set('length', packages[0].length);
              searchParams.set('width', packages[0].width);
              searchParams.set('height', packages[0].height);
            }
            
            const queryString = searchParams.toString();
            window.location.href = `/${queryString ? '?' + queryString : ''}`;
          }}
          onUpdateQuote={(updatedData) => {
            console.log('🔄 onUpdateQuote called with:', updatedData);
            
            // Update the form data with edited values
            setQuoteData(prev => ({
              ...prev,
              from_country: updatedData.from_country,
              to_country: updatedData.to_country,
              shipment_type: updatedData.shipment_type
            }));
            setPackages(updatedData.packages);
            setContentItems(updatedData.content_items);
            setShipmentType(updatedData.shipment_type);
            
            // Clear existing quotes immediately to show loading state
            setQuotes(null);
            setRecommendedQuote(null);
            setSelectedQuote(null);
            setQuoteResponse(null);
            
            // Call handleSubmit with the updated data directly (don't wait for state update)
            handleSubmitWithData(updatedData);
          }}
        />
      )}
      
      {/* Debug: Log data being passed to QuoteComparison */}
      {quotes && console.log('QuoteForm - Data for QuoteComparison:', { quoteData, packages, contentItems, shipmentType })}
      
      {/* Login and Register Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default QuoteForm;