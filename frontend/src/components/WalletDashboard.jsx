import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { 
  Plus, 
  Wallet, 
  IndianRupee, 
  TrendingUp, 
  History,
  CreditCard,
  Smartphone,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

const WalletDashboard = () => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/payments/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.data);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/payments/wallet/transactions?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) < 10) {
      toast.error('Minimum top-up amount is ₹10');
      return;
    }

    try {
      const response = await fetch('/api/payments/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('xfas_token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(topupAmount),
          payment_method: selectedPaymentMethod
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Top-up initiated successfully');
        setIsTopupOpen(false);
        setTopupAmount('');
        
        // If it's a wallet payment, refresh immediately
        if (selectedPaymentMethod === 'wallet') {
          fetchWalletData();
          fetchTransactions();
        } else {
          // For gateway payments, show payment URL or instructions
          if (data.data.payment.payment_url) {
            window.open(data.data.payment.payment_url, '_blank');
          }
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to initiate top-up');
      }
    } catch (error) {
      console.error('Error during top-up:', error);
      toast.error('Failed to process top-up');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'WALLET_LOAD':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'WALLET_DEDUCT':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'upi':
        return <Smartphone className="h-4 w-4" />;
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'net_banking':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          My Wallet
        </h1>
        <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Money
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Money to Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="10"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum amount: ₹10</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'upi', label: 'UPI', icon: 'smartphone' },
                    { value: 'credit_card', label: 'Credit Card', icon: 'credit-card' },
                    { value: 'debit_card', label: 'Debit Card', icon: 'credit-card' },
                    { value: 'net_banking', label: 'Net Banking', icon: 'building-2' }
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setSelectedPaymentMethod(method.value)}
                      className={`p-3 border rounded-lg text-sm flex items-center gap-2 ${
                        selectedPaymentMethod === method.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {getPaymentMethodIcon(method.value)}
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleTopup} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!topupAmount || parseFloat(topupAmount) < 10}
              >
                Add ₹{topupAmount || '0'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallet Stats */}
      {walletBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Current Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(walletBalance.balance)}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          {/* Daily Limit */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Daily Remaining</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(walletBalance.daily_remaining)}
                  </p>
                  <p className="text-xs text-gray-500">
                    of ₹{walletBalance.daily_limit?.toLocaleString('en-IN')}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Wallet Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Wallet Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={walletBalance.is_active ? "default" : "destructive"}
                      className={walletBalance.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {walletBalance.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {walletBalance.is_frozen && (
                      <Badge variant="destructive">Frozen</Badge>
                    )}
                  </div>
                </div>
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your wallet transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.transaction_type === 'WALLET_LOAD' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'WALLET_LOAD' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Balance: {formatCurrency(transaction.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;