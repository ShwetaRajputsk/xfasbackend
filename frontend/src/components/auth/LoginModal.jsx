import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting login process...');
      console.log('Form data:', { email: formData.email, passwordLength: formData.password.length });
      
      // Test toast to ensure toast system works
      console.log('Testing toast system...');
      
      const result = await login(formData);
      console.log('Login result received:', result);
      
      if (result && result.success === true) {
        console.log('Login successful, showing success toast');
        toast({
          title: "Login Successful",
          description: "Welcome back to XFas Logistics!"
        });
        onClose();
        
        // Check if there's a pending booking - if so, don't redirect, let QuoteForm handle it
        const pendingBooking = localStorage.getItem('xfas_pending_booking');
        if (!pendingBooking) {
          // Only redirect to dashboard if there's no pending booking
          setTimeout(() => {
            console.log('Redirecting to dashboard...');
            window.location.href = '/dashboard';
          }, 500);
        }
        // If there is a pending booking, the QuoteForm useEffect will handle restoration
      } else {
        // Login failed - stay on form and show error
        console.log('Login failed, showing error toast');
        const errorMessage = result?.error || 'Login failed';
        console.error('Login error details:', { result, errorMessage });
        
        // Don't close modal, don't redirect - just show error
        try {
          toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive"
          });
          console.log('Error toast displayed');
        } catch (toastError) {
          console.error('Toast error:', toastError);
          alert('Login failed: ' + errorMessage); // Fallback
        }
      }
    } catch (error) {
      console.error('Login exception caught:', error);
      try {
        toast({
          title: "Error", 
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      } catch (toastError) {
        console.error('Toast error in catch:', toastError);
        alert('Login error: Something went wrong. Please try again.'); // Fallback
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome Back
          </DialogTitle>
          <p className="text-gray-600 text-center">
            Sign in to your XFas Logistics account
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Sign up here
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;