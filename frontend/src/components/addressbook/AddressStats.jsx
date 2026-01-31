import React from 'react';
import { MapPin, Building2, Home, Warehouse, Store, Star, TrendingUp } from 'lucide-react';

const AddressStats = ({ summary }) => {
  const stats = [
    {
      label: 'Total Addresses',
      value: summary.total_addresses,
      icon: MapPin,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Pickup Addresses',
      value: summary.pickup_addresses,
      icon: MapPin,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Delivery Addresses',
      value: summary.delivery_addresses,
      icon: MapPin,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Both Types',
      value: summary.both_addresses,
      icon: MapPin,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="mb-8 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Default Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Default Pickup */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Default Pickup Address</h3>
            </div>
          </div>
          {summary.default_pickup ? (
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{summary.default_pickup.label}</p>
              <p className="text-sm text-gray-600">{summary.default_pickup.name}</p>
              <p className="text-sm text-gray-500">
                {summary.default_pickup.city}, {summary.default_pickup.state}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No default pickup address set</p>
          )}
        </div>

        {/* Default Delivery */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Default Delivery Address</h3>
            </div>
          </div>
          {summary.default_delivery ? (
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{summary.default_delivery.label}</p>
              <p className="text-sm text-gray-600">{summary.default_delivery.name}</p>
              <p className="text-sm text-gray-500">
                {summary.default_delivery.city}, {summary.default_delivery.state}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No default delivery address set</p>
          )}
        </div>
      </div>

      {/* Quick Access Sections */}
      {(summary.recently_used.length > 0 || summary.most_used.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Used */}
          {summary.recently_used.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium text-gray-900">Recently Used</h3>
              </div>
              <div className="space-y-3">
                {summary.recently_used.slice(0, 3).map((address) => (
                  <div key={address.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{address.label}</p>
                      <p className="text-xs text-gray-500">{address.city}, {address.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Used */}
          {summary.most_used.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Star className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium text-gray-900">Most Used</h3>
              </div>
              <div className="space-y-3">
                {summary.most_used.slice(0, 3).map((address, index) => (
                  <div key={address.id} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{address.label}</p>
                      <p className="text-xs text-gray-500">
                        Used {address.usage_count} time{address.usage_count !== 1 ? 's' : ''} • {address.city}, {address.state}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressStats;