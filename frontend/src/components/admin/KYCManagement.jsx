import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  CheckIcon, 
  XIcon,
  RefreshIcon,
  DocumentIcon,
  UserIcon
} from '@heroicons/react/outline';
import api from '../../services/api';

const KYCManagement = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    userType: ''
  });

  useEffect(() => {
    fetchKYCRequests();
  }, [filters]);

  const fetchKYCRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.userType && { user_type: filters.userType })
      });

      const response = await api.get(`/admin/kyc?${params}`);
      // The API returns { success: true, data: { documents: [...], total_count: X } }
      setKycRequests(response.data.data?.documents || []);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      setKycRequests(getMockKYCRequests());
    } finally {
      setLoading(false);
    }
  };

  const getMockKYCRequests = () => [
    {
      id: '1',
      user_id: 'user1',
      user_name: 'John Doe',
      user_email: 'john@example.com',
      user_type: 'individual',
      status: 'pending',
      documents: {
        pan_card: { uploaded: true, verified: false },
        aadhaar_card: { uploaded: true, verified: false },
        address_proof: { uploaded: false, verified: false }
      },
      business_documents: {
        gst_certificate: { uploaded: false, verified: false },
        business_license: { uploaded: false, verified: false }
      },
      submitted_at: '2024-01-15T10:30:00Z',
      reviewed_at: null
    },
    {
      id: '2',
      user_id: 'user2',
      user_name: 'ABC Corp',
      user_email: 'admin@abc.com',
      user_type: 'business',
      status: 'approved',
      documents: {
        pan_card: { uploaded: true, verified: true },
        aadhaar_card: { uploaded: true, verified: true },
        address_proof: { uploaded: true, verified: true }
      },
      business_documents: {
        gst_certificate: { uploaded: true, verified: true },
        business_license: { uploaded: true, verified: true }
      },
      submitted_at: '2024-01-10T09:15:00Z',
      reviewed_at: '2024-01-12T14:20:00Z'
    },
    {
      id: '3',
      user_id: 'user3',
      user_name: 'Jane Smith',
      user_email: 'jane@business.com',
      user_type: 'business',
      status: 'rejected',
      documents: {
        pan_card: { uploaded: true, verified: false },
        aadhaar_card: { uploaded: true, verified: false },
        address_proof: { uploaded: false, verified: false }
      },
      business_documents: {
        gst_certificate: { uploaded: false, verified: false },
        business_license: { uploaded: true, verified: false }
      },
      submitted_at: '2024-01-12T11:20:00Z',
      reviewed_at: '2024-01-14T10:15:00Z',
      rejection_reason: 'Incomplete business documents'
    }
  ];

  const updateKYCStatus = async (kycId, status, reason = '') => {
    try {
      await api.put(`/admin/kyc/${kycId}/status`, { status, rejection_reason: reason });
      fetchKYCRequests();
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      approved: { color: 'bg-green-100 text-green-800', icon: '✅' },
      rejected: { color: 'bg-red-100 text-red-800', icon: '❌' }
    };
    const config = configs[status] || configs.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDocumentStatus = (document) => {
    if (!document.uploaded) return { text: 'Not Uploaded', color: 'text-red-600' };
    if (document.verified) return { text: 'Verified', color: 'text-green-600' };
    return { text: 'Pending Review', color: 'text-yellow-600' };
  };

  const getCompletionPercentage = (kyc) => {
    const totalDocs = kyc.user_type === 'business' ? 5 : 3;
    const uploadedDocs = [
      ...Object.values(kyc.documents),
      ...(kyc.user_type === 'business' ? Object.values(kyc.business_documents) : [])
    ].filter(doc => doc.uploaded).length;
    
    return Math.round((uploadedDocs / totalDocs) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            KYC Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Verify customer documents and GST information
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={fetchKYCRequests}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={filters.userType}
              onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', userType: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* KYC Requests Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            KYC Requests ({kycRequests.length})
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
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(kycRequests) && kycRequests.length > 0 ? kycRequests.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{kyc.user_name}</div>
                          <div className="text-sm text-gray-500">{kyc.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          kyc.user_type === 'business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {kyc.user_type}
                        </span>
                        <div>{getStatusBadge(kyc.status)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span>PAN Card:</span>
                          <span className={getDocumentStatus(kyc.documents.pan_card).color}>
                            {getDocumentStatus(kyc.documents.pan_card).text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Aadhaar:</span>
                          <span className={getDocumentStatus(kyc.documents.aadhaar_card).color}>
                            {getDocumentStatus(kyc.documents.aadhaar_card).text}
                          </span>
                        </div>
                        {kyc.user_type === 'business' && (
                          <div className="flex items-center justify-between">
                            <span>GST:</span>
                            <span className={getDocumentStatus(kyc.business_documents.gst_certificate).color}>
                              {getDocumentStatus(kyc.business_documents.gst_certificate).text}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${getCompletionPercentage(kyc)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{getCompletionPercentage(kyc)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(kyc.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-orange-600 hover:text-orange-900"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {kyc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateKYCStatus(kyc.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection:');
                                if (reason) updateKYCStatus(kyc.id, 'rejected', reason);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <DocumentIcon className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No KYC Requests</h3>
                        <p className="text-gray-500">There are no KYC documents to review at this time.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {kycRequests.filter(k => k.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {kycRequests.filter(k => k.status === 'approved').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <XIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {kycRequests.filter(k => k.status === 'rejected').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCManagement;