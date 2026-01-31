import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import WalletDashboard from './WalletDashboard';
import PaymentSelection from './PaymentSelection';
import { Package, CreditCard, Wallet, TestTube } from 'lucide-react';

const PaymentTest = () => {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // Mock shipment data for testing payment
  const mockShipmentData = {
    id: 'test-shipment-123',
    package_info: {
      declared_value: 2500,
      dimensions: {
        length: 30,
        width: 20,
        height: 15,
        weight: 2.5
      },
      type: 'parcel',
      contents_description: 'Electronics - Mobile Phone'
    },
    shipping_charges: 450,
    sender: {
      name: 'Test Sender',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001'
    },
    recipient: {
      name: 'Test Recipient',
      city: 'Delhi',
      state: 'Delhi',
      postal_code: '110001'
    }
  };

  const handlePaymentComplete = (paymentData) => {
    console.log('Payment completed:', paymentData);
    alert('Payment completed successfully! Check console for details.');
    setShowPaymentFlow(false);
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment System Testing</h1>
        <p className="text-gray-600">Test all payment functionality including wallet, COD, and gateway payments</p>
      </div>

      {/* Quick Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Quick Test Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.location.href = '/wallet'}
              className="bg-blue-600 hover:bg-blue-700 h-16 flex flex-col items-center gap-2"
            >
              <Wallet className="h-6 w-6" />
              <span>Test Wallet Dashboard</span>
            </Button>

            <Button
              onClick={() => setShowPaymentFlow(true)}
              className="bg-green-600 hover:bg-green-700 h-16 flex flex-col items-center gap-2"
            >
              <CreditCard className="h-6 w-6" />
              <span>Test Payment Flow</span>
            </Button>

            <Button
              onClick={() => {
                fetch('/api/payments/cod/calculate-charges', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
                  },
                  body: JSON.stringify({ shipment_value: 2500 })
                })
                .then(res => res.json())
                .then(data => alert(`COD Charges: ₹${data.data.cod_charges}`))
                .catch(err => alert('Error calculating COD charges'));
              }}
              className="bg-orange-600 hover:bg-orange-700 h-16 flex flex-col items-center gap-2"
            >
              <Package className="h-6 w-6" />
              <span>Test COD Calculator</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment Flow Test</h2>
                <Button variant="outline" onClick={() => setShowPaymentFlow(false)}>
                  ✕
                </Button>
              </div>
              
              <PaymentSelection
                shipmentData={mockShipmentData}
                onPaymentComplete={handlePaymentComplete}
                onPaymentCancel={handlePaymentCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feature Tabs */}
      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallet">Wallet Features</TabsTrigger>
          <TabsTrigger value="cod">COD Features</TabsTrigger>
          <TabsTrigger value="gateway">Gateway Features</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet System Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Available Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>View wallet balance and transaction history</li>
                    <li>Add money using UPI, Cards, Net Banking</li>
                    <li>Daily spending limits with tracking</li>
                    <li>1% cashback on wallet payments</li>
                    <li>Instant payments for shipments</li>
                    <li>Auto-refunds to wallet</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Test Actions:</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.href = '/wallet'}
                      className="w-full"
                    >
                      Open Wallet Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        fetch('/api/payments/wallet/balance', {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
                          }
                        })
                        .then(res => res.json())
                        .then(data => alert(`Wallet Balance: ₹${data.data.balance}`))
                        .catch(err => alert('Error fetching balance'));
                      }}
                      className="w-full"
                    >
                      Check Balance via API
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cod" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>COD (Cash on Delivery) Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">COD Configuration:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Base charge: ₹50</li>
                    <li>Percentage charge: 2% of shipment value</li>
                    <li>Minimum charge: ₹25</li>
                    <li>Maximum charge: ₹500</li>
                    <li>Free COD above ₹2,000</li>
                    <li>Available pan-India</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Test COD Calculations:</h4>
                  <div className="space-y-2">
                    {[500, 1000, 2500, 5000].map(value => (
                      <Button 
                        key={value}
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          fetch('/api/payments/cod/calculate-charges', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
                            },
                            body: JSON.stringify({ shipment_value: value })
                          })
                          .then(res => res.json())
                          .then(data => alert(`For ₹${value}: COD Charges = ₹${data.data.cod_charges}`))
                          .catch(err => alert('Error calculating COD'));
                        }}
                        className="w-full"
                      >
                        Calculate for ₹{value.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateway" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Supported Gateways:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Razorpay (Integrated)</li>
                    <li>Stripe (Framework ready)</li>
                    <li>PayPal (Framework ready)</li>
                    <li>UPI, Cards, Net Banking</li>
                    <li>Webhook handling</li>
                    <li>Automatic retry mechanisms</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Payment Methods:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Credit/Debit Cards</li>
                    <li>UPI (GPay, PhonePe, Paytm)</li>
                    <li>Net Banking (All banks)</li>
                    <li>EMI Options</li>
                    <li>International Cards</li>
                    <li>Wallet Integrations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Wallet APIs:</h4>
                  <div className="space-y-1 text-sm font-mono bg-gray-50 p-3 rounded">
                    <div>GET /api/payments/wallet/balance</div>
                    <div>POST /api/payments/wallet/topup</div>
                    <div>GET /api/payments/wallet/transactions</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Payment APIs:</h4>
                  <div className="space-y-1 text-sm font-mono bg-gray-50 p-3 rounded">
                    <div>POST /api/payments/payment-summary</div>
                    <div>POST /api/payments/process-payment</div>
                    <div>GET /api/payments/history</div>
                    <div>POST /api/payments/refund</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">COD APIs:</h4>
                  <div className="space-y-1 text-sm font-mono bg-gray-50 p-3 rounded">
                    <div>POST /api/payments/cod/calculate-charges</div>
                    <div>GET /api/payments/cod/availability/:code</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Analytics APIs:</h4>
                  <div className="space-y-1 text-sm font-mono bg-gray-50 p-3 rounded">
                    <div>GET /api/payments/analytics/summary</div>
                    <div>POST /api/payments/webhooks/razorpay</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentTest;