import React, { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CreditCard, Smartphone, Building } from 'lucide-react';

const MockPayment = ({ 
  amount, 
  currency = 'INR', 
  orderId, 
  onSuccess, 
  onFailure, 
  customerDetails,
  description = 'XFas Logistics Payment'
}) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '4111 1111 1111 1111',
    expiry: '12/27',
    cvv: '123',
    name: 'John Doe'
  });
  const [upiId, setUpiId] = useState('success@razorpay');

  const handleMockPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock payment response
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const mockSignature = `mock_signature_${Math.random().toString(36).substring(7)}`;
      
      // Simulate success/failure based on test data
      const shouldSucceed = 
        (selectedMethod === 'card' && cardDetails.number === '4111 1111 1111 1111') ||
        (selectedMethod === 'upi' && upiId === 'success@razorpay') ||
        selectedMethod === 'netbanking';
      
      if (shouldSucceed) {
        toast({
          title: "Payment Successful! (Mock)",
          description: `Payment ID: ${mockPaymentId}`,
        });
        
        if (onSuccess) {
          onSuccess({
            razorpay_payment_id: mockPaymentId,
            razorpay_order_id: orderId,
            razorpay_signature: mockSignature
          });
        }
      } else {
        throw new Error('Mock payment failed - use test card 4111 1111 1111 1111 or UPI success@razorpay');
      }
      
    } catch (error) {
      toast({
        title: "Payment Failed (Mock)",
        description: error.message,
        variant: "destructive"
      });
      
      if (onFailure) {
        onFailure({
          error: 'mock_payment_failed',
          description: error.message
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Mock Payment Gateway
        </CardTitle>
        <div className="text-center text-sm text-gray-600">
          Development Mode - No Real Money
        </div>
        <div className="text-center text-lg font-semibold">
          ₹{amount} {currency}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label>Select Payment Method</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={selectedMethod === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMethod('card')}
              className="flex flex-col items-center p-3 h-auto"
            >
              <CreditCard className="w-4 h-4 mb-1" />
              <span className="text-xs">Card</span>
            </Button>
            <Button
              variant={selectedMethod === 'upi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMethod('upi')}
              className="flex flex-col items-center p-3 h-auto"
            >
              <Smartphone className="w-4 h-4 mb-1" />
              <span className="text-xs">UPI</span>
            </Button>
            <Button
              variant={selectedMethod === 'netbanking' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMethod('netbanking')}
              className="flex flex-col items-center p-3 h-auto"
            >
              <Building className="w-4 h-4 mb-1" />
              <span className="text-xs">Net Banking</span>
            </Button>
          </div>
        </div>

        {/* Card Details */}
        {selectedMethod === 'card' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                placeholder="4111 1111 1111 1111"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  placeholder="12/27"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  placeholder="123"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        {/* UPI Details */}
        {selectedMethod === 'upi' && (
          <div>
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="success@razorpay"
            />
            <div className="text-xs text-gray-500 mt-1">
              Use "success@razorpay" for successful payment
            </div>
          </div>
        )}

        {/* Net Banking */}
        {selectedMethod === 'netbanking' && (
          <div className="text-center text-sm text-gray-600">
            Select any bank - all will succeed in mock mode
          </div>
        )}

        {/* Test Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg text-xs">
          <div className="font-semibold mb-1">Test Instructions:</div>
          <div>• Card: Use 4111 1111 1111 1111 for success</div>
          <div>• UPI: Use success@razorpay for success</div>
          <div>• Net Banking: All banks succeed</div>
        </div>

        {/* Pay Button */}
        <Button 
          onClick={handleMockPayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
        </Button>

        <div className="text-center text-xs text-gray-500">
          This is a mock payment for development. No real money will be charged.
        </div>
      </CardContent>
    </Card>
  );
};

export default MockPayment;