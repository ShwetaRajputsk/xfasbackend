import React from 'react';
import { ArrowRight, Truck, Plane, Package, Clock, MapPin, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { services } from '../data/mockData';

const ServicesSection = () => {
  const getServiceIcon = (index) => {
    const icons = [Truck, Plane, Package];
    const Icon = icons[index];
    return <Icon className="h-8 w-8" />;
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
            Our Services
          </Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Multi-Channel Shipping Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From domestic deliveries to international express, we provide comprehensive shipping solutions 
            for businesses and individuals across India and worldwide.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={service.id} className="group bg-white hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-xl group-hover:bg-orange-200 transition-colors">
                    <div className="text-orange-600">
                      {getServiceIcon(index)}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                    {service.deliveryTime}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                  {service.title}
                </CardTitle>
                <p className="text-orange-600 font-semibold">{service.subtitle}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                  {service.description}
                </p>
                
                {/* Features */}
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Starting from</p>
                      <p className="text-lg font-bold text-slate-900">{service.price}</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600 text-white group-hover:shadow-lg transition-all"
                    >
                      Get Quote
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-xl inline-block mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Same Day Pickup</h3>
              <p className="text-sm text-slate-600">Schedule pickup within hours from major cities</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-xl inline-block mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Real-Time Tracking</h3>
              <p className="text-sm text-slate-600">Monitor your shipments with live GPS tracking</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-xl inline-block mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Insurance Protection</h3>
              <p className="text-sm text-slate-600">Comprehensive coverage for valuable shipments</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-xl inline-block mb-4">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Custom Packaging</h3>
              <p className="text-sm text-slate-600">Professional packaging for fragile items</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
            Explore All Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;