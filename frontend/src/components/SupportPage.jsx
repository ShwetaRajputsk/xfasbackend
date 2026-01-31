import React, { useState } from 'react';
import { 
  Phone, Mail, MessageCircle, Clock, Users, Shield, 
  Search, BookOpen, HelpCircle, Send, MapPin, ChevronRight 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

const SupportPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const supportChannels = [
    {
      icon: <Phone className="w-8 h-8 text-green-500" />,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "011-47501136",
      availability: "Mon-Fri, 9 AM - 7 PM IST",
      action: "Call Now"
    },
    {
      icon: <Mail className="w-8 h-8 text-blue-500" />,
      title: "Email Support",
      description: "Send us your questions anytime",
      contact: "contact@xfas.in",
      availability: "24/7 - Response within 4 hours",
      action: "Send Email"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-500" />,
      title: "Live Chat",
      description: "Get instant help with our chat support",
      contact: "Available on website",
      availability: "Mon-Fri, 9 AM - 7 PM IST",
      action: "Start Chat"
    }
  ];

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create my first shipment?",
          answer: "Simply click 'Get Quote' on our homepage, fill in your shipment details, compare rates from different carriers, and book your preferred option. You'll receive a confirmation email with tracking details."
        },
        {
          question: "What documents do I need for shipping?",
          answer: "For domestic shipments, you need a valid ID proof. For international shipments, you'll need invoice, packing list, and any required permits depending on the destination country."
        },
        {
          question: "How do I track my shipment?",
          answer: "Use the tracking number (AWB) provided in your confirmation email. Enter it on our tracking page or click the tracking link in your email for real-time updates."
        }
      ]
    },
    {
      category: "Pricing & Billing",
      questions: [
        {
          question: "How is shipping cost calculated?",
          answer: "Shipping costs are based on package weight, dimensions, distance, delivery speed, and carrier rates. We show transparent pricing with no hidden fees."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, UPI, net banking, and wallet payments. Enterprise customers can also use credit terms."
        },
        {
          question: "Can I get volume discounts?",
          answer: "Yes! Volume discounts are available for regular shippers. Contact our sales team to discuss custom pricing based on your shipping volume."
        }
      ]
    },
    {
      category: "Shipping Issues",
      questions: [
        {
          question: "What if my package is delayed?",
          answer: "Track your shipment for real-time updates. If there's an unexpected delay, our support team will proactively notify you and provide updated delivery estimates."
        },
        {
          question: "How do I report a damaged package?",
          answer: "Contact our support team immediately with photos of the damaged package and packaging. We'll initiate an investigation and claim process with the carrier."
        },
        {
          question: "Can I change the delivery address?",
          answer: "Address changes are possible before the package is picked up. Contact support immediately - some carriers may charge a fee for address modifications."
        }
      ]
    }
  ];

  const resources = [
    {
      icon: <BookOpen className="w-6 h-6 text-orange-500" />,
      title: "Shipping Guide",
      description: "Complete guide to domestic and international shipping",
      link: "#"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "Packaging Guidelines",
      description: "Best practices for packaging your items safely",
      link: "#"
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "API Documentation",
      description: "Integrate XFas Logistics with your systems",
      link: "#"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: "Service Updates",
      description: "Latest updates and service announcements",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            We're Here to Help
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Get the support you need, when you need it. Our expert team is ready to assist 
            you with all your shipping needs.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for help articles, guides, or FAQs..."
                className="pl-12 pr-4 py-3 text-lg bg-white text-gray-900"
              />
            </div>
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">Choose the support channel that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-4">
                    {channel.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {channel.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{channel.description}</p>
                  <div className="space-y-2 mb-6">
                    <p className="font-semibold text-gray-900">{channel.contact}</p>
                    <p className="text-sm text-gray-500">{channel.availability}</p>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    {channel.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
            <p className="text-lg text-gray-600">We'll get back to you within 24 hours</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    placeholder="What can we help you with?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    placeholder="Please describe your question or issue in detail..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Find quick answers to common questions</p>
          </div>

          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <HelpCircle className="w-6 h-6 text-orange-500 mr-2" />
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <Card key={faqIndex}>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          {faq.question}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Helpful Resources</h2>
            <p className="text-lg text-gray-600">Guides, documentation, and tools to help you succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {resource.icon}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {resource.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>011-47501136</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <span>9821984141</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>contact@xfas.in</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>Madhuban Tower, A-200 Road no 4, Gali no 10, Mahipalpur, New Delhi 110037</span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
              <p className="text-slate-300 mb-4">
                Stay updated with the latest news and shipping tips
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  LinkedIn
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  Twitter
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  Facebook
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;