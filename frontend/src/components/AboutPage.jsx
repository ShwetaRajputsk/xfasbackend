import React from 'react';
import { 
  Target, Users, Globe, Award, TrendingUp, Shield, 
  Clock, Heart, Star, CheckCircle, ArrowRight, Zap 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const AboutPage = () => {
  const stats = [
    { number: '50,000+', label: 'Shipments Delivered', icon: <CheckCircle className="w-6 h-6" /> },
    { number: '5,000+', label: 'Happy Customers', icon: <Users className="w-6 h-6" /> },
    { number: '200+', label: 'Cities Covered', icon: <Globe className="w-6 h-6" /> },
    { number: '99.8%', label: 'On-Time Delivery', icon: <Clock className="w-6 h-6" /> }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Reliability",
      description: "We ensure your packages reach their destination safely and on time, every time."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Innovation",
      description: "Cutting-edge technology and AI-powered solutions for smarter shipping decisions."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Customer First",
      description: "Your success is our priority. We go above and beyond to exceed expectations."
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Excellence",
      description: "Committed to delivering exceptional service and continuous improvement."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "XFas Logistics was born with a vision to revolutionize shipping in India"
    },
    {
      year: "2021",
      title: "Multi-Carrier Platform",
      description: "Launched our innovative platform connecting multiple logistics providers"
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Introduced AI-powered rate comparison and route optimization"
    },
    {
      year: "2023",
      title: "National Expansion",
      description: "Expanded services to cover 200+ cities across India"
    },
    {
      year: "2024",
      title: "International Shipping",
      description: "Launched international shipping services to 50+ countries"
    },
    {
      year: "2025",
      title: "Industry Leader",  
      description: "Recognized as a leading shipping technology platform in India"
    }
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "CEO & Founder",
      description: "15+ years in logistics and technology, former executive at leading shipping companies.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "Priya Sharma",
      role: "CTO",
      description: "Tech leader with expertise in AI/ML and logistics optimization systems.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "Amit Patel",
      role: "VP Operations",
      description: "Supply chain expert ensuring seamless operations across our network.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "Sneha Gupta",
      role: "Head of Customer Success",
      description: "Dedicated to ensuring exceptional customer experience and satisfaction.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Transforming Logistics with Technology
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              We're on a mission to make shipping simple, transparent, and accessible for businesses 
              of all sizes across India and beyond.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => window.location.href = '/quote'}
              >
                Get Started Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-slate-900"
                onClick={() => window.location.href = '/support'}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-orange-500">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At XFas Logistics, we believe shipping should be simple, transparent, and reliable. 
                Our mission is to empower businesses with innovative technology that makes logistics 
                effortless and cost-effective.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We're building the future of logistics by connecting businesses with the best shipping 
                options through our intelligent platform, ensuring every package reaches its destination 
                safely and on time.
              </p>
              <div className="flex space-x-4">
                <Badge className="bg-orange-100 text-orange-700 px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  Customer Focused
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Innovation Driven
                </Badge>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Vision</h3>
                    <p className="text-gray-600">To be India's most trusted logistics technology platform</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Reach</h3>
                    <p className="text-gray-600">Connecting India to the world through smart logistics</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Excellence</h3>
                    <p className="text-gray-600">Committed to delivering exceptional service quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">Key milestones in our growth story</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-orange-300"></div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-2xl font-bold text-orange-500 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">The passionate people behind XFas Logistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Shipping?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of businesses who trust XFas Logistics for their shipping needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-orange-500 hover:bg-gray-50"
              onClick={() => window.location.href = '/quote'}
            >
              Start Shipping Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-500"
              onClick={() => window.location.href = '/support'}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">Recognized By</h3>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <Badge variant="outline" className="px-4 py-2">Startup India</Badge>
            <Badge variant="outline" className="px-4 py-2">Digital India</Badge>
            <Badge variant="outline" className="px-4 py-2">Make in India</Badge>
            <Badge variant="outline" className="px-4 py-2">ISO Certified</Badge>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;