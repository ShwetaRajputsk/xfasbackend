import React from 'react';
import { Package, TrendingUp, Clock, CheckCircle, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

const DashboardStats = ({ stats }) => {
  // Provide default values to prevent undefined errors
  const safeStats = {
    total_shipments: 0,
    active_shipments: 0,
    delivered_shipments: 0,
    pending_shipments: 0,
    total_spent: 0,
    this_month_spent: 0,
    success_rate: 0,
    on_time_delivery_rate: 0,
    average_delivery_time: 0,
    shipments_this_month: 0,
    favorite_carrier: null,
    carrier_distribution: {},
    ...stats
  };

  const statCards = [
    {
      title: "Total Shipments",
      value: safeStats.total_shipments || 0,
      icon: Package,
      change: `+${safeStats.shipments_this_month || 0}`,
      changeLabel: "this month",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Shipments",
      value: safeStats.active_shipments || 0,
      icon: Clock,
      change: `${safeStats.pending_shipments || 0}`,
      changeLabel: "pending pickup",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Delivered",
      value: safeStats.delivered_shipments || 0,
      icon: CheckCircle,
      change: `${Math.round(safeStats.success_rate || 0)}%`,
      changeLabel: "success rate",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Spent",
      value: `₹${(safeStats.total_spent || 0).toLocaleString()}`,
      icon: DollarSign,
      change: `₹${(safeStats.this_month_spent || 0).toLocaleString()}`,
      changeLabel: "this month",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${stat.color}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{stat.changeLabel}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Additional Stats Row */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">On-Time Delivery</span>
                <span className="font-medium">{(safeStats.on_time_delivery_rate || 0).toFixed(1)}%</span>
              </div>
              <Progress value={safeStats.on_time_delivery_rate || 0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium">{(safeStats.success_rate || 0).toFixed(1)}%</span>
              </div>
              <Progress value={safeStats.success_rate || 0} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Avg. Delivery Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(safeStats.average_delivery_time || 0).toFixed(1)} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Favorite Carrier</p>
                <p className="text-lg font-semibold text-gray-900">
                  {safeStats.favorite_carrier || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carrier Distribution */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Carrier Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(safeStats.carrier_distribution || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(safeStats.carrier_distribution || {})
                .sort(([,a], [,b]) => (b || 0) - (a || 0))
                .slice(0, 5)
                .map(([carrier, count]) => {
                  const percentage = (safeStats.total_shipments > 0) ? ((count || 0) / safeStats.total_shipments) * 100 : 0;
                  return (
                    <div key={carrier} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{carrier}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count || 0}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No carrier data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;