import React from 'react';
import { Calculator, CreditCard, Clock, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { howItWorks } from '../data/mockData';

const HowItWorksSection = () => {
  const getStepIcon = (iconName) => {
    const iconMap = {
      Calculator: Calculator,
      CreditCard: CreditCard,
      Clock: Clock,
      MapPin: MapPin
    };
    const Icon = iconMap[iconName] || Calculator;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
            How It Works
          </Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Ship in 4 Simple Steps
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From getting quotes to delivery tracking, our streamlined process makes shipping 
            effortless and transparent at every step.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {howItWorks.map((step, index) => (
            <div key={step.step} className="relative">
              <Card className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200 text-center h-full">
                <CardHeader className="pb-4">
                  <div className="relative mx-auto">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-full inline-block mb-4 shadow-lg">
                      <div className="text-white">
                        {getStepIcon(step.icon)}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Arrow connector (hidden on mobile and last item) */}
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-orange-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                What Makes Us Different?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Instant Rate Comparison</p>
                    <p className="text-sm text-slate-600">Compare rates from 15+ carriers in real-time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Flexible Pickup Options</p>
                    <p className="text-sm text-slate-600">Same-day pickup or drop at 5,000+ locations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Smart Tracking</p>
                    <p className="text-sm text-slate-600">Real-time notifications via SMS, email & WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Customs Support</p>
                    <p className="text-sm text-slate-600">Complete documentation for international shipments</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Ready to Get Started?</h4>
              <p className="text-slate-600 text-sm mb-6">
                Create your free account and get instant access to discounted shipping rates from premium carriers.
              </p>
              
              <div className="space-y-3">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Create Free Account
                </Button>
                <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                  Get Quote First
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 text-center mt-4">
                No setup fees • No monthly charges • Pay per shipment
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-500 mb-2">2 mins</div>
            <div className="text-slate-600 text-sm">Average Booking Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500 mb-2">5,000+</div>
            <div className="text-slate-600 text-sm">Drop-off Locations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500 mb-2">24 hrs</div>
            <div className="text-slate-600 text-sm">Pickup Response Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500 mb-2">100%</div>
            <div className="text-slate-600 text-sm">Transparent Pricing</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;