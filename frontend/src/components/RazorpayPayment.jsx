import React, { useEffect, useCallback } from 'react';
import { useToast } from '../hooks/use-toast';
import MockPayment from './MockPayment';

const useRazorpayPayment = ({ 
  amount, 
  currency = 'INR', 
  orderId, 
  onSuccess, 
  onFailure, 
  customerDetails,
  description = 'XFas Logistics Payment'
}) => {
  const { toast } = useToast();
  const useMockPayments = process.env.REACT_APP_USE_MOCK_PAYMENTS === 'true';

  // If mock payments are enabled, return mock component
  if (useMockPayments) {
    const MockPaymentComponent = () => (
      <MockPayment
        amount={amount}
        currency={currency}
        orderId={orderId}
        onSuccess={onSuccess}
        onFailure={onFailure}
        customerDetails={customerDetails}
        description={description}
      />
    );
    
    return { 
      handlePayment: () => {}, // Not used in mock mode
      MockPaymentComponent 
    };
  }

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = useCallback(async () => {
    console.log('Razorpay handlePayment called with:', { amount, orderId, currency });
    
    if (!window.Razorpay) {
      toast({
        title: "Payment Error",
        description: "Razorpay SDK not loaded. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!orderId || !amount) {
      toast({
        title: "Payment Error",
        description: "Payment details not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Ensure minimum amount to avoid risk checks
    const finalAmount = Math.max(amount, 1); // Minimum ₹1
    const amountInPaise = Math.round(finalAmount * 100);

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RzOVYKxNXN9nXVe6', // Use provided key as fallback
      amount: amountInPaise, // Amount in paise
      currency: currency,
      name: 'XFas Logistics',
      description: description,
      order_id: orderId,
      // No image to avoid CORS issues with localhost
      handler: function (response) {
        // Payment successful
        console.log('Payment successful:', response);
        
        if (onSuccess) {
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
        }
        
        toast({
          title: "Payment Successful!",
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
      },
      prefill: {
        name: customerDetails?.name || 'John Doe',
        email: customerDetails?.email || 'john.doe@example.com',
        contact: customerDetails?.phone || '9876543210'
      },
      notes: {
        booking_type: 'shipping_logistics',
        customer_id: customerDetails?.id || 'cust_' + Date.now(),
        platform: 'web_application',
        environment: process.env.NODE_ENV || 'development',
        merchant_order_id: 'order_' + Date.now(),
        service_type: 'courier_booking',
        merchant_name: 'XFas Logistics',
        business_type: 'logistics_service'
      },
      theme: {
        color: '#f97316', // Orange color matching your theme
        backdrop_color: '#ffffff'
      },
      // Enhanced retry configuration
      retry: {
        enabled: true,
        max_count: 3
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          if (onFailure) {
            onFailure({
              error: 'payment_cancelled',
              description: 'Payment was cancelled by user'
            });
          }
        },
        // Add escape key handling
        escape: true,
        // Add backdrop click handling
        backdrop_close: false
      },
      // Enhanced configuration for better success rates
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Pay using ' + (currency === 'INR' ? 'UPI/Cards/NetBanking' : 'Cards'),
              instruments: [
                {
                  method: 'card'
                },
                {
                  method: 'upi'
                },
                {
                  method: 'netbanking'
                }
              ]
            }
          },
          sequence: ['block.banks'],
          preferences: {
            show_default_blocks: true
          },
          language: 'en'
        }
      },
      // Add test mode specific options for better success rates
      ...(process.env.NODE_ENV === 'development' && {
        // Disable some validations for test mode
        send_sms_hash: false,
        allow_rotation: false,
        remember_customer: false,
        readonly: {
          email: false,
          contact: false,
          name: false
        }
      })
    };

    try {
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.log('Payment failed:', response.error);
        
        // Log detailed error information
        console.log('Error details:', {
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
          metadata: response.error.metadata
        });
        
        if (onFailure) {
          onFailure({
            error: response.error.code,
            description: response.error.description,
            source: response.error.source,
            step: response.error.step,
            reason: response.error.reason,
            metadata: response.error.metadata
          });
        }
        
        // Show more specific error messages
        let errorMessage = response.error.description || "Payment could not be processed";
        
        if (response.error.code === 'BAD_REQUEST_ERROR') {
          if (response.error.reason === 'payment_risk_check_failed') {
            errorMessage = "Payment declined by security system. For testing, please use:\n• Card: 4111 1111 1111 1111\n• Expiry: 12/27 (any future date)\n• CVV: 123\n• Name: John Doe\n• Amount: Keep between ₹1-₹1000";
          } else if (response.error.reason === 'payment_failed') {
            errorMessage = "Payment failed. Please check your card details and try again.";
          } else {
            errorMessage = "Invalid payment details. Please verify your information.";
          }
        } else if (response.error.code === 'GATEWAY_ERROR') {
          errorMessage = "Payment gateway error. Please try again in a moment.";
        } else if (response.error.code === 'NETWORK_ERROR') {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (response.error.code === 'SERVER_ERROR') {
          errorMessage = "Server error. Please try again later.";
        }
        
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        });
      });

      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      
      if (onFailure) {
        onFailure({
          error: 'razorpay_error',
          description: error.message || 'Failed to open payment gateway'
        });
      }
      
      toast({
        title: "Payment Error",
        description: "Could not open payment gateway. Please try again.",
        variant: "destructive"
      });
    }
  }, [amount, currency, orderId, onSuccess, onFailure, customerDetails, description, toast]);

  return { handlePayment };
};

export default useRazorpayPayment;