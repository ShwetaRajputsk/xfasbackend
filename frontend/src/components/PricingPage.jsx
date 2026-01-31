import React from 'react';
import { Check, Star, ArrowRight, Package, Globe, Shield, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      price: "₹0",
      period: "per shipment",
      description: "Perfect for small businesses just getting started",
      features: [
        "Pay per shipment",
        "Basic rate comparison",
        "Standard support",
        "Email notifications",
        "Basic tracking",
        "Up to 10 shipments/month"
      ],
      buttonText: "Get Started",
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Business",
      price: "₹2,999",
      period: "per month",
      description: "Ideal for growing businesses with regular shipments",
      features: [
        "Unlimited shipments",
        "Advanced rate comparison",
        "Priority support",
        "SMS & Email notifications",
        "Real-time tracking",
        "Bulk operations",
        "API access",
        "Custom branding",
        "Analytics dashboard"
      ],
      buttonText: "Start Free Trial",
      popular: true,
      color: "border-orange-500"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large enterprises with high-volume shipping needs",
      features: [
        "Everything in Business",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom integrations",
        "Volume discounts",
        "White-label solution",
        "SLA guarantees",
        "Advanced analytics",
        "Multi-user access"
      ],
      buttonText: "Contact Sales",
      popular: false,
      color: "border-purple-500"
    }
  ];

  const services = [
    {
      icon: <Package className="w-8 h-8 text-orange-500" />,
      title: "Domestic Shipping",
      description: "Competitive rates across India",
      price: "Starting from ₹45"
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      title: "International Shipping",
      description: "Worldwide delivery network",
      price: "Starting from ₹850"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "Insurance",
      description: "Protect your shipments",
      price: "1% of declared value"
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: "Express Delivery",
      description: "Same day & next day delivery",
      price: "Starting from ₹150"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose from flexible pricing options designed to grow with your business. 
            No hidden fees, no surprises.
          </p>
          <div className="flex justify-center items-center space-x-4 mb-8">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="w-4 h-4 mr-1" />
              No setup fees
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Check className="w-4 h-4 mr-1" />
              Cancel anytime
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Check className="w-4 h-4 mr-1" />
              Free trial
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600">Select the perfect plan for your shipping needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`${plan.color} ${plan.popular ? 'ring-2 ring-orange-500 shadow-lg' : ''} relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    onClick={() => window.location.href = '/quote'}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Pricing</h2>
            <p className="text-lg text-gray-600">Transparent pricing for all our services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-lg font-bold text-orange-500">
                    {service.price}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing FAQ</h2>
            <p className="text-lg text-gray-600">Common questions about our pricing</p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How does pay-per-shipment work?
              </h3>
              <p className="text-gray-600">
                With our Starter plan, you only pay when you ship. There are no monthly fees or commitments. 
                Each shipment is charged based on the carrier rate plus a small service fee.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any differences in your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Are there any hidden fees?
              </h3>
              <p className="text-gray-600">
                No hidden fees, ever. All pricing is transparent and includes everything you need to get started. 
                Optional services like insurance are clearly priced separately.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Do you offer volume discounts?
              </h3>
              <p className="text-gray-600">
                Yes! Our Enterprise plan includes volume discounts for high-volume shippers. 
                Contact our sales team to discuss custom pricing for your specific needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of businesses already shipping with XFas Logistics
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-orange-500 hover:bg-gray-50"
              onClick={() => window.location.href = '/quote'}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-500"
              onClick={() => window.location.href = '/support'}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;