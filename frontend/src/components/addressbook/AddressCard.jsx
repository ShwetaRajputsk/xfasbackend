import React from 'react';
import { Edit, Trash2, Star, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, getCategoryIcon }) => {
  const CategoryIcon = getCategoryIcon(address.category);
  
  const getAddressTypeColor = (type) => {
    switch (type) {
      case 'pickup': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'home': return 'bg-pink-100 text-pink-800';
      case 'office': return 'bg-blue-100 text-blue-800';
      case 'warehouse': return 'bg-yellow-100 text-yellow-800';
      case 'shop': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUsageStats = () => {
    if (address.usage_count === 0) {
      return 'Never used';
    }
    
    const lastUsed = address.last_used_at 
      ? new Date(address.last_used_at).toLocaleDateString()
      : 'Unknown';
    
    return `Used ${address.usage_count} time${address.usage_count !== 1 ? 's' : ''} • Last: ${lastUsed}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <CategoryIcon className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {address.label}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge className={getAddressTypeColor(address.address_type)}>
                {address.address_type === 'both' ? 'Pickup & Delivery' : address.address_type}
              </Badge>
              <Badge variant="secondary" className={getCategoryColor(address.category)}>
                {address.category}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Default Status */}
        {(address.is_default_pickup || address.is_default_delivery) && (
          <div className="flex flex-col space-y-1">
            {address.is_default_pickup && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                <Star className="h-3 w-3 mr-1" />
                Default Pickup
              </Badge>
            )}
            {address.is_default_delivery && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                <Star className="h-3 w-3 mr-1" />
                Default Delivery
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium">{address.name}</p>
            {address.company && <p className="text-gray-500">{address.company}</p>}
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.postal_code}</p>
            {address.landmark && <p className="text-gray-500">Near {address.landmark}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{address.phone}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{address.email}</span>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
        <Clock className="h-3 w-3" />
        <span>{formatUsageStats()}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(address)}
          className="flex-1 min-w-0"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        
        {/* Set Default Buttons */}
        {(address.address_type === 'pickup' || address.address_type === 'both') && !address.is_default_pickup && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address.id, 'pickup')}
            className="text-xs"
          >
            <Star className="h-3 w-3 mr-1" />
            Default Pickup
          </Button>
        )}
        
        {(address.address_type === 'delivery' || address.address_type === 'both') && !address.is_default_delivery && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address.id, 'delivery')}
            className="text-xs"
          >
            <Star className="h-3 w-3 mr-1" />
            Default Delivery
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(address.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AddressCard;