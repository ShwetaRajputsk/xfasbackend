import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote,
  IndianRupee,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const PaymentSelection = ({ shipmentData, onPaymentComplete, onPaymentCancel }) => {
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [codCharges, setCodCharges] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shipmentData) {
      fetchPaymentSummary();
    }
  }, [shipmentData]);

  useEffect(() => {
    if (selectedMethod === 'cod') {
      calculateCODCharges();
    }
  }, [selectedMethod, shipmentData]);

  const fetchPaymentSummary = async () => {
    try {
      const response = await fetch('/api/payments/payment-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
        },
        body: JSON.stringify({
          shipment_id: shipmentData.id || 'temp',
          shipment_value: shipmentData.package_info?.declared_value || 1000,
          shipping_charges: shipmentData.shipping_charges || 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentSummary(data.data);
        // Auto-select wallet if available and sufficient balance
        if (data.data.can_use_wallet) {
          setSelectedMethod('wallet');
        } else if (data.data.available_methods.includes('upi')) {
          setSelectedMethod('upi');
        }
      } else {
        throw new Error('Failed to fetch payment summary');
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      toast.error('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  const calculateCODCharges = async () => {
    try {
      const response = await fetch('/api/payments/cod/calculate-charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
        },
        body: JSON.stringify({
          shipment_value: shipmentData.package_info?.declared_value || 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCodCharges(data.data.cod_charges);
      }
    } catch (error) {
      console.error('Error calculating COD charges:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/payments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
        },
        body: JSON.stringify({
          shipment_id: shipmentData.id,
          payment_method: selectedMethod,
          use_wallet_balance: selectedMethod === 'wallet'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Payment processed successfully');
        
        // Handle different payment methods
        if (selectedMethod === 'wallet' || selectedMethod === 'cod') {
          // Payment completed immediately
          onPaymentComplete(data.data);
        } else {
          // Gateway payment - redirect to payment page
          if (data.data.payment?.payment_url) {
            window.open(data.data.payment.payment_url, '_blank');
          }
          onPaymentComplete(data.data);
        }
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPaymentMethodInfo = (method) => {
    const methods = {
      wallet: {
        label: 'XFas Wallet',
        icon: <Wallet className="h-5 w-5" />,
        description: 'Pay instantly from your wallet balance',
        discount: '1% cashback',
        color: 'bg-blue-50 border-blue-200'
      },
      upi: {
        label: 'UPI',
        icon: <Smartphone className="h-5 w-5" />,
        description: 'Pay via UPI apps like GPay, PhonePe, Paytm',
        discount: null,
        color: 'bg-green-50 border-green-200'
      },
      credit_card: {
        label: 'Credit Card',
        icon: <CreditCard className="h-5 w-5" />,
        description: 'Visa, MasterCard, RuPay, Amex',
        discount: null,
        color: 'bg-purple-50 border-purple-200'
      },
      debit_card: {
        label: 'Debit Card',
        icon: <CreditCard className="h-5 w-5" />,
        description: 'All major debit cards accepted',
        discount: null,
        color: 'bg-indigo-50 border-indigo-200'
      },
      net_banking: {
        label: 'Net Banking',
        icon: <Building2 className="h-5 w-5" />,
        description: 'Pay directly from your bank account',
        discount: null,
        color: 'bg-gray-50 border-gray-200'
      },
      cod: {
        label: 'Cash on Delivery',
        icon: <Banknote className="h-5 w-5" />,
        description: 'Pay when your shipment is delivered',
        discount: null,
        color: 'bg-orange-50 border-orange-200'
      }
    };

    return methods[method] || methods.upi;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentSummary) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load payment options</p>
          <Button onClick={fetchPaymentSummary} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Shipment Value:</span>
              <span>{formatCurrency(paymentSummary.breakdown.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping Charges:</span>
              <span>{formatCurrency(paymentSummary.breakdown.shipping_charges)}</span>
            </div>
            {selectedMethod === 'cod' && codCharges > 0 && (
              <div className="flex justify-between text-sm">
                <span>COD Charges:</span>
                <span>{formatCurrency(codCharges)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Tax (GST 18%):</span>
              <span>{formatCurrency(paymentSummary.breakdown.tax_amount)}</span>
            </div>
            {paymentSummary.breakdown.wallet_discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Wallet Discount:</span>
                <span>-{formatCurrency(paymentSummary.breakdown.wallet_discount)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span>{formatCurrency(
                paymentSummary.breakdown.total_amount + (selectedMethod === 'cod' ? codCharges : 0)
              )}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          {paymentSummary.wallet_balance > 0 && (
            <div className="text-sm text-gray-600">
              Wallet Balance: {formatCurrency(paymentSummary.wallet_balance)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentSummary.available_methods.map((method) => {
              const methodInfo = getPaymentMethodInfo(method);
              const isSelected = selectedMethod === method;
              const isWalletInsufficient = method === 'wallet' && !paymentSummary.can_use_wallet;

              return (
                <button
                  key={method}
                  onClick={() => !isWalletInsufficient && setSelectedMethod(method)}
                  disabled={isWalletInsufficient}
                  className={`w-full p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : isWalletInsufficient
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : `${methodInfo.color} hover:border-blue-300`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {methodInfo.icon}
                      <div className="text-left">
                        <div className="font-medium">{methodInfo.label}</div>
                        <div className="text-sm text-gray-600">{methodInfo.description}</div>
                        {isWalletInsufficient && (
                          <div className="text-xs text-red-500">Insufficient balance</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {methodInfo.discount && (
                        <Badge variant="secondary" className="text-xs">
                          {methodInfo.discount}
                        </Badge>
                      )}
                      {isSelected && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onPaymentCancel}
          className="flex-1"
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={!selectedMethod || processing}
        >
          {processing ? 'Processing...' : `Pay ${formatCurrency(
            paymentSummary.breakdown.total_amount + (selectedMethod === 'cod' ? codCharges : 0)
          )}`}
        </Button>
      </div>
    </div>
  );
};

export default PaymentSelection;