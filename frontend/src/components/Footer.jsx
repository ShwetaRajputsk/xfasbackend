import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src="/assets/images/xfas-logo.png" 
                  alt="XFas Logistics" 
                  className="h-8 w-auto mr-3"
                />
                <div>
                  <h3 className="text-xl font-bold">XFas Logistics Pvt Ltd</h3>
                  <p className="text-sm text-gray-400">Multi-Channel Shipping Solutions</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                India's leading multi-carrier shipping platform, offering competitive rates and reliable 
                delivery services for businesses and individuals across 190+ countries.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">
                    Madhuban Tower, A-200 Road no 4, Gali no 10, Mahipalpur, New Delhi 110037
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">
                    Phone: <a href="tel:01147501136" className="hover:text-orange-400">011-47501136</a>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">
                    WhatsApp: <a href="https://wa.me/919821984141" className="hover:text-orange-400">9821984141</a>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">
                    Email: <a href="mailto:contact@xfas.in" className="hover:text-orange-400">contact@xfas.in</a>
                  </span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Domestic Delivery</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">International Express</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Large & Heavy Parcels</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Document Delivery</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Same Day Delivery</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Cargo & Freight</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Track Shipment</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Get Quote</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Customer Support</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Shipping Calculator</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Packaging Guidelines</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Customs Information</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
                <p className="text-gray-300 text-sm">
                  Get the latest shipping tips, industry insights, and exclusive offers delivered to your inbox.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>&copy; 2025 XFas Logistics Pvt Ltd. All rights reserved.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-500 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-500 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-500 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-500 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;