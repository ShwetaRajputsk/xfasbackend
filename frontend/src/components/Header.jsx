import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, User, LogOut, Wallet, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Check for login requirement from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'required' && !isAuthenticated) {
      setShowLogin(true);
      // Clean up the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [isAuthenticated]);

  const handleGetQuote = () => {
    window.location.href = '/quote';
  };

  const handleLogout = () => {
    logout();
    // Redirect to homepage after logout
    window.location.href = '/';
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100">
        {/* Top Bar */}
        <div className="bg-slate-900 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3" />
                  <span>+91-98765-43210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>contact@xfas.in</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:text-orange-400">
                        <User className="h-4 w-4 mr-2" />
                        {user?.first_name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                        Profile & Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/my-shipments'}>
                        My Shipments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/wallet'}>
                        <Wallet className="h-4 w-4 mr-2" />
                        My Wallet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:text-orange-400"
                      onClick={() => setShowLogin(true)}
                    >
                      Login
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => setShowRegister(true)}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <img 
                src="/assets/images/xfas-logo.png" 
                alt="XFas Logistics" 
                className="h-10 w-auto"
              />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-slate-900">XFas Logistics</h1>
                <p className="text-xs text-gray-500">Multi-Channel Shipping Solutions</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/#services" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Services
              </a>
              <a href="/pricing" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Pricing
              </a>
              <a href="/track" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Track Shipment
              </a>
              {isAuthenticated && (
                <a href="/dashboard" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Dashboard
                </a>
              )}
              <a href="/support" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Support
              </a>
              <a href="/about" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                About
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-orange-500 text-orange-500 hover:bg-orange-50"
                onClick={handleGetQuote}
              >
                Get Quote
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleGetQuote}
              >
                Ship Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                <a href="#services" className="block px-3 py-2 text-gray-700 hover:text-orange-500 font-medium">
                  Services
                </a>
                <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-orange-500 font-medium">
                  Pricing
                </a>
                <a href="#track" 
                   className="block px-3 py-2 text-gray-700 hover:text-orange-500 font-medium"
                   onClick={(e) => {
                     e.preventDefault();
                     window.location.href = '/track';
                   }}
                >
                  Track Shipment
                </a>
                <a href="#support" className="block px-3 py-2 text-gray-700 hover:text-orange-500 font-medium">
                  Support
                </a>
                <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-orange-500 font-medium">
                  About
                </a>
                
                {/* Mobile Auth */}
                <div className="px-3 py-2 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="text-gray-900 font-medium">
                        Welcome, {user?.first_name}!
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mb-2" 
                        onClick={() => {
                          window.location.href = '/dashboard';
                          setIsMenuOpen(false);
                        }}
                      >
                        Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full mb-2" 
                        onClick={() => {
                          window.location.href = '/profile';
                          setIsMenuOpen(false);
                        }}
                      >
                        Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full mb-2" 
                        onClick={() => {
                          window.location.href = '/my-shipments';
                          setIsMenuOpen(false);
                        }}
                      >
                        My Shipments
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full mb-2" 
                        onClick={() => {
                          window.location.href = '/wallet';
                          setIsMenuOpen(false);
                        }}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        My Wallet
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleLogout}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                        onClick={() => {
                          setShowLogin(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        Login
                      </Button>
                      <Button 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => {
                          setShowRegister(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                    onClick={handleGetQuote}
                  >
                    Get Quote
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </>
  );
};

export default Header;