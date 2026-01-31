import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  RefreshIcon
} from '@heroicons/react/outline';
import api from '../../services/api';

const CourierRateManagement = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    carrier_name: '',
    service_type: 'standard',
    base_rate_per_kg: '',
    fuel_surcharge_percentage: '0',
    insurance_rate_percentage: '0.5',
    domestic_multiplier: '1.0',
    international_multiplier: '2.5',
    min_weight: '0.5',
    max_weight: '50',
    pickup_cutoff_time: '18:00',
    estimated_delivery_days: '3'
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/carrier-rates');
      setRates(response.data);
    } catch (error) {
      console.error('Error fetching rates:', error);
      setRates(getMockRates());
    } finally {
      setLoading(false);
    }
  };

  const getMockRates = () => [
    {
      id: '1',
      carrier_name: 'XFas Self Network',
      service_type: 'standard',
      base_rate_per_kg: 45.00,
      fuel_surcharge_percentage: 2.5,
      insurance_rate_percentage: 0.5,
      domestic_multiplier: 1.0,
      international_multiplier: 2.5,
      min_weight: 0.5,
      max_weight: 50,
      pickup_cutoff_time: '18:00',
      estimated_delivery_days: 3,
      is_active: true
    },
    {
      id: '2',
      carrier_name: 'FedEx',
      service_type: 'express',
      base_rate_per_kg: 65.00,
      fuel_surcharge_percentage: 3.0,
      insurance_rate_percentage: 0.8,
      domestic_multiplier: 1.2,
      international_multiplier: 3.0,
      min_weight: 0.5,
      max_weight: 30,
      pickup_cutoff_time: '17:00',
      estimated_delivery_days: 2,
      is_active: true
    },
    {
      id: '3',
      carrier_name: 'DHL',
      service_type: 'overnight',
      base_rate_per_kg: 85.00,
      fuel_surcharge_percentage: 3.5,
      insurance_rate_percentage: 1.0,
      domestic_multiplier: 1.5,
      international_multiplier: 3.5,
      min_weight: 0.5,
      max_weight: 25,
      pickup_cutoff_time: '16:00',
      estimated_delivery_days: 1,
      is_active: true
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingRate ? `/admin/carrier-rates/${editingRate.id}` : '/admin/carrier-rates';

      const payload = {
        ...formData,
        base_rate_per_kg: parseFloat(formData.base_rate_per_kg),
        fuel_surcharge_percentage: parseFloat(formData.fuel_surcharge_percentage),
        insurance_rate_percentage: parseFloat(formData.insurance_rate_percentage),
        domestic_multiplier: parseFloat(formData.domestic_multiplier),
        international_multiplier: parseFloat(formData.international_multiplier),
        min_weight: parseFloat(formData.min_weight),
        max_weight: parseFloat(formData.max_weight),
        estimated_delivery_days: parseInt(formData.estimated_delivery_days)
      };

      if (editingRate) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      
      setShowModal(false);
      setEditingRate(null);
      setFormData({
        carrier_name: '',
        service_type: 'standard',
        base_rate_per_kg: '',
        fuel_surcharge_percentage: '0',
        insurance_rate_percentage: '0.5',
        domestic_multiplier: '1.0',
        international_multiplier: '2.5',
        min_weight: '0.5',
        max_weight: '50',
        pickup_cutoff_time: '18:00',
        estimated_delivery_days: '3'
      });
      fetchRates();
    } catch (error) {
      console.error('Error saving rate:', error);
    }
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      carrier_name: rate.carrier_name,
      service_type: rate.service_type,
      base_rate_per_kg: rate.base_rate_per_kg.toString(),
      fuel_surcharge_percentage: rate.fuel_surcharge_percentage.toString(),
      insurance_rate_percentage: rate.insurance_rate_percentage.toString(),
      domestic_multiplier: rate.domestic_multiplier.toString(),
      international_multiplier: rate.international_multiplier.toString(),
      min_weight: rate.min_weight.toString(),
      max_weight: rate.max_weight.toString(),
      pickup_cutoff_time: rate.pickup_cutoff_time,
      estimated_delivery_days: rate.estimated_delivery_days.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (rateId) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      try {
      await api.delete(`/admin/carrier-rates/${rateId}`);
      fetchRates();
      } catch (error) {
        console.error('Error deleting rate:', error);
      }
    }
  };

  const toggleRateStatus = async (rateId, currentStatus) => {
    try {
      await api.put(`/admin/carrier-rates/${rateId}/status`, { is_active: !currentStatus });
      fetchRates();
    } catch (error) {
      console.error('Error updating rate status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Courier Rate Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure and manage pricing for different carriers
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={fetchRates}
            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingRate(null);
              setFormData({
                carrier_name: '',
                service_type: 'standard',
                base_rate_per_kg: '',
                fuel_surcharge_percentage: '0',
                insurance_rate_percentage: '0.5',
                domestic_multiplier: '1.0',
                international_multiplier: '2.5',
                min_weight: '0.5',
                max_weight: '50',
                pickup_cutoff_time: '18:00',
                estimated_delivery_days: '3'
              });
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Rate
          </button>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Carrier Rates ({rates.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rate.carrier_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rate.service_type === 'express' ? 'bg-blue-100 text-blue-800' :
                        rate.service_type === 'overnight' ? 'bg-purple-100 text-purple-800' :
                        rate.service_type === 'economy' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rate.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{rate.base_rate_per_kg}/kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.estimated_delivery_days} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rate.min_weight}-{rate.max_weight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRateStatus(rate.id, rate.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rate.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rate.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(rate)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Edit Rate"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Rate"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRate ? 'Edit Carrier Rate' : 'Add New Carrier Rate'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Carrier Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.carrier_name}
                      onChange={(e) => setFormData({...formData, carrier_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Type</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.service_type}
                      onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                    >
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="economy">Economy</option>
                      <option value="overnight">Overnight</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Rate per KG (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.base_rate_per_kg}
                      onChange={(e) => setFormData({...formData, base_rate_per_kg: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Days</label>
                    <input
                      type="number"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.estimated_delivery_days}
                      onChange={(e) => setFormData({...formData, estimated_delivery_days: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Weight (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.min_weight}
                      onChange={(e) => setFormData({...formData, min_weight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Weight (KG)</label>
                    <input
                      type="number"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.max_weight}
                      onChange={(e) => setFormData({...formData, max_weight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fuel Surcharge (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.fuel_surcharge_percentage}
                      onChange={(e) => setFormData({...formData, fuel_surcharge_percentage: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={formData.insurance_rate_percentage}
                      onChange={(e) => setFormData({...formData, insurance_rate_percentage: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                  >
                    {editingRate ? 'Update Rate' : 'Create Rate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierRateManagement;