import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Loader2, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import OTPInput from '../ui/otp-input';
import { authAPI } from '../../services/api';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    user_type: 'individual',
    business_info: {
      company_name: '',
      business_type: '',
      gst_number: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form', 'otp', 'success'
  const [otpData, setOtpData] = useState({ email: '', phone: '', purpose: 'registration' });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [registrationMethod, setRegistrationMethod] = useState('password'); // 'password', 'email_otp'
  
  const { register } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('business_')) {
      const businessField = name.replace('business_', '');
      setFormData({
        ...formData,
        business_info: {
          ...formData.business_info,
          [businessField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        user_type: formData.user_type
      };

      if (formData.user_type === 'business') {
        submitData.business_info = formData.business_info;
      }

      const result = await register(submitData);
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome to XFas Logistics!"
        });
        onClose();
        
        // Check if there's a pending booking - if so, don't redirect, let QuoteForm handle it
        const pendingBooking = localStorage.getItem('xfas_pending_booking');
        if (!pendingBooking) {
          // Only redirect to dashboard if there's no pending booking
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        }
        // If there is a pending booking, the QuoteForm useEffect will handle restoration
      } else {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Join XFas Logistics
          </DialogTitle>
          <p className="text-gray-600 text-center">
            Create your account and start shipping
          </p>
        </DialogHeader>

        <Tabs value={formData.user_type} onValueChange={(value) => setFormData({...formData, user_type: value})}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Business Information */}
            <TabsContent value="business" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_company_name">Company Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="business_company_name"
                    name="business_company_name"
                    placeholder="Your Company Ltd."
                    value={formData.business_info.company_name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required={formData.user_type === 'business'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="business_business_type">Business Type</Label>
                  <Select 
                    name="business_business_type" 
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      business_info: {...formData.business_info, business_type: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="e-commerce">E-commerce</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_gst_number">GST Number</Label>
                  <Input
                    id="business_gst_number"
                    name="business_gst_number"
                    placeholder="GST Number"
                    value={formData.business_info.gst_number}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Tabs>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Sign in here
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;