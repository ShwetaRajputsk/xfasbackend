import React from 'react';
import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { testimonials } from '../data/mockData';

const TestimonialsSection = () => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800 border-green-200">
            Customer Reviews
          </Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Trusted by thousands of businesses and individuals for reliable, cost-effective shipping solutions.
          </p>
          
          {/* Overall Rating */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <div className="flex items-center space-x-1">
              {renderStars(5)}
            </div>
            <div className="text-2xl font-bold text-slate-900">4.9</div>
            <div className="text-slate-600">
              Based on 2,500+ reviews
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-orange-200">
                <Quote className="h-8 w-8" />
              </div>
              
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Comment */}
                <p className="text-slate-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.comment}"
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Testimonials Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-1 mb-3">
                {renderStars(5)}
              </div>
              <p className="text-sm text-slate-600 mb-4">
                "Fastest delivery I've ever experienced. My package reached USA in just 4 days!"
              </p>
              <div className="font-medium text-slate-900">Amit Singh</div>
              <div className="text-xs text-slate-500">Mumbai</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-1 mb-3">
                {renderStars(5)}
              </div>
              <p className="text-sm text-slate-600 mb-4">
                "Best rates in the market! Saved over 40% compared to other services."
              </p>
              <div className="font-medium text-slate-900">Kavita Reddy</div>
              <div className="text-xs text-slate-500">Bangalore</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-1 mb-3">
                {renderStars(4)}
              </div>
              <p className="text-sm text-slate-600 mb-4">
                "Excellent customer support. They helped me with complex customs documentation."
              </p>
              <div className="font-medium text-slate-900">David Chen</div>
              <div className="text-xs text-slate-500">Delhi</div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Metrics */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">10,000+</div>
              <div className="text-slate-600 text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">50,000+</div>
              <div className="text-slate-600 text-sm">Parcels Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">4.9/5</div>
              <div className="text-slate-600 text-sm">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">99.8%</div>
              <div className="text-slate-600 text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
            Start Your First Shipment
          </Button>
          <p className="text-sm text-slate-600 mt-4">
            Join thousands of satisfied customers • No setup fees • Free account
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;