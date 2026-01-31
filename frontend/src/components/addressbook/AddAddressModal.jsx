import React, { useState } from 'react';
import { X, MapPin, Building2, Home, Warehouse, Store } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const AddAddressModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    label: '',
    address_type: 'both',
    category: 'other',
    name: '',
    company: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    landmark: '',
    is_default_pickup: false,
    is_default_delivery: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const addressTypes = [
    { value: 'pickup', label: 'Pickup Only', icon: MapPin },
    { value: 'delivery', label: 'Delivery Only', icon: MapPin },
    { value: 'both', label: 'Both Pickup & Delivery', icon: MapPin }
  ];

  const categories = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'office', label: 'Office', icon: Building2 },
    { value: 'warehouse', label: 'Warehouse', icon: Warehouse },
    { value: 'shop', label: 'Shop', icon: Store },
    { value: 'other', label: 'Other', icon: MapPin }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar Islands'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone format (Indian phone number)
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 13 || 
          (phoneDigits.length === 10 && !['6', '7', '8', '9'].includes(phoneDigits[0]))) {
        newErrors.phone = 'Please enter a valid Indian phone number';
      }
    }

    // Validate postal code (6 digits for India)
    if (formData.postal_code && formData.country === 'India') {
      if (!/^\d{6}$/.test(formData.postal_code)) {
        newErrors.postal_code = 'Please enter a valid 6-digit postal code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      // Reset form
      setFormData({
        label: '',
        address_type: 'both',
        category: 'other',
        name: '',
        company: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        landmark: '',
        is_default_pickup: false,
        is_default_delivery: false
      });
      setErrors({});
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form and errors when closing
      setFormData({
        label: '',
        address_type: 'both',
        category: 'other',
        name: '',
        company: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        landmark: '',
        is_default_pickup: false,
        is_default_delivery: false
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            <span>Add New Address</span>
          </DialogTitle>
          <DialogDescription>
            Add a new address to your address book for quick access during shipping.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Address Label *</Label>
            <Input
              id="label"
              placeholder="e.g., Home, Office, Main Warehouse"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className={errors.label ? 'border-red-500' : ''}
            />
            {errors.label && <p className="text-sm text-red-500">{errors.label}</p>}
          </div>

          {/* Address Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_type">Address Type *</Label>
              <Select value={formData.address_type} onValueChange={(value) => handleInputChange('address_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {addressTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center space-x-2">
                        <cat.icon className="h-4 w-4" />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Contact Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                placeholder="Company name"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Textarea
              id="street"
              placeholder="Building number, street name, area"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              rows={2}
              className={errors.street ? 'border-red-500' : ''}
            />
            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                placeholder="123456"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className={errors.postal_code ? 'border-red-500' : ''}
              />
              {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              placeholder="Near famous place, building, etc."
              value={formData.landmark}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
            />
          </div>

          {/* Default Settings */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">Default Settings</Label>
            <div className="space-y-2">
              {(formData.address_type === 'pickup' || formData.address_type === 'both') && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_default_pickup"
                    checked={formData.is_default_pickup}
                    onChange={(e) => handleInputChange('is_default_pickup', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_default_pickup" className="text-sm">
                    Set as default pickup address
                  </Label>
                </div>
              )}
              
              {(formData.address_type === 'delivery' || formData.address_type === 'both') && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_default_delivery"
                    checked={formData.is_default_delivery}
                    onChange={(e) => handleInputChange('is_default_delivery', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_default_delivery" className="text-sm">
                    Set as default delivery address
                  </Label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
              {loading ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAddressModal;