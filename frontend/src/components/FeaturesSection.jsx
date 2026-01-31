import React from 'react';
import { Network, MapPin, FileText, CreditCard, Shield, Building, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { features } from '../data/mockData';

const FeaturesSection = () => {
  const getFeatureIcon = (iconName) => {
    const iconMap = {
      Network: Network,
      MapPin: MapPin,
      FileText: FileText,
      CreditCard: CreditCard,
      Shield: Shield,
      Building: Building
    };
    const Icon = iconMap[iconName] || Network;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            Why Choose XFas
          </Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Everything You Need for Seamless Shipping
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Advanced features and reliable service that make XFas Logistics the preferred choice for 
            businesses and individuals across India.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <Card key={feature.id} className="group bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200">
              <CardHeader className="pb-4">
                <div className="bg-gradient-to-br from-orange-50 to-blue-50 p-4 rounded-xl inline-block mb-4 group-hover:from-orange-100 group-hover:to-blue-100 transition-all">
                  <div className="text-orange-600">
                    {getFeatureIcon(feature.icon)}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Highlight */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 lg:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Join 10,000+ Happy Customers
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Free account setup with no hidden fees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Dedicated account manager for businesses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Bulk shipping discounts up to 40%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>API integration for seamless workflow</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Priority customer support</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">99.8%</div>
                  <div className="text-sm opacity-90">Customer Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                  <div className="text-sm opacity-90">Customer Support</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">50K+</div>
                  <div className="text-sm opacity-90">Shipments Monthly</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">15+</div>
                  <div className="text-sm opacity-90">Carrier Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;