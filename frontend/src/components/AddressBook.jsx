import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Building2, 
  Home, 
  Warehouse, 
  Store,
  Edit,
  Trash2,
  Star,
  Clock,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import AddressCard from './addressbook/AddressCard';
import AddAddressModal from './addressbook/AddAddressModal';
import EditAddressModal from './addressbook/EditAddressModal';
import AddressSearchBar from './addressbook/AddressSearchBar';
import AddressStats from './addressbook/AddressStats';

const AddressBook = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [summary, setSummary] = useState(null);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
    fetchAddressBookSummary();
  }, []);

  // Filter addresses based on search and filter
  useEffect(() => {
    let filtered = addresses;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(address =>
        address.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'pickup') {
        filtered = filtered.filter(addr => addr.address_type === 'pickup' || addr.address_type === 'both');
      } else if (activeFilter === 'delivery') {
        filtered = filtered.filter(addr => addr.address_type === 'delivery' || addr.address_type === 'both');
      } else {
        filtered = filtered.filter(addr => addr.category === activeFilter);
      }
    }
    
    setFilteredAddresses(filtered);
  }, [addresses, searchQuery, activeFilter]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('xfas_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/address-book/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      } else {
        throw new Error('Failed to fetch addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressBookSummary = async () => {
    try {
      const token = localStorage.getItem('xfas_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/address-book/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      const token = localStorage.getItem('xfas_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/address-book/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const newAddress = await response.json();
        setAddresses(prev => [newAddress, ...prev]);
        setShowAddModal(false);
        toast({
          title: "Success",
          description: "Address added successfully",
        });
        fetchAddressBookSummary(); // Refresh summary
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditAddress = async (addressId, addressData) => {
    try {
      const token = localStorage.getItem('xfas_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/address-book/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const updatedAddress = await response.json();
        setAddresses(prev => prev.map(addr => 
          addr.id === addressId ? updatedAddress : addr
        ));
        setShowEditModal(false);
        setEditingAddress(null);
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
        fetchAddressBookSummary(); // Refresh summary
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const token = localStorage.getItem('xfas_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/address-book/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
        fetchAddressBookSummary(); // Refresh summary
      } else {
        throw new Error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId, addressType) => {
    try {
      const token = localStorage.getItem('xfas_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/address-book/addresses/${addressId}/set-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address_type: addressType })
      });

      if (response.ok) {
        // Refresh addresses to get updated default status
        fetchAddresses();
        fetchAddressBookSummary();
        toast({
          title: "Success",
          description: `Set as default ${addressType} address`,
        });
      } else {
        throw new Error('Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default:', error);
      toast({
        title: "Error",
        description: "Failed to set default address",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setShowEditModal(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'home': return Home;
      case 'office': return Building2;
      case 'warehouse': return Warehouse;
      case 'shop': return Store;
      default: return MapPin;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Addresses', icon: MapPin },
    { value: 'pickup', label: 'Pickup', icon: MapPin },
    { value: 'delivery', label: 'Delivery', icon: MapPin },
    { value: 'home', label: 'Home', icon: Home },
    { value: 'office', label: 'Office', icon: Building2 },
    { value: 'warehouse', label: 'Warehouse', icon: Warehouse },
    { value: 'shop', label: 'Shop', icon: Store },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Address Book</h1>
              <p className="mt-2 text-gray-600">
                Manage your pickup and delivery addresses
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && <AddressStats summary={summary} />}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search addresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={activeFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(option.value)}
                  className={activeFilter === option.value ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Addresses Grid */}
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || activeFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first address.'
              }
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Address
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={openEditModal}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefault}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <AddAddressModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAddress}
        />

        <EditAddressModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingAddress(null);
          }}
          onSave={handleEditAddress}
          address={editingAddress}
        />
      </div>
    </div>
  );
};

export default AddressBook;