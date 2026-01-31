import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Building, 
  Shield, Edit, Save, X, AlertCircle, CheckCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { profileAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import OTPInput from '../ui/otp-input';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    business_info: {
      company_name: '',
      gst_number: '',
      pan_number: '',
      business_type: '',
      industry: '',
      cin_number: ''
    },
    preferred_language: 'en',
    timezone: 'Asia/Kolkata',
    notification_preferences: {
      email_notifications: true,
      sms_notifications: true,
      push_notifications: true,
      marketing_emails: false
    }
  });
  
  // Verification state
  const [verificationState, setVerificationState] = useState({
    showEmailOTP: false,
    showPhoneOTP: false,
    emailOTPLoading: false,
    phoneOTPLoading: false,
    emailOTPError: null,
    phoneOTPError: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await profileAPI.getProfile();
      setProfileData(profile);
      
      // Initialize form data
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        business_info: profile.business_info || {
          company_name: '',
          gst_number: '',
          pan_number: '',
          business_type: '',
          industry: '',
          cin_number: ''
        },
        preferred_language: profile.preferred_language || 'en',
        timezone: profile.timezone || 'Asia/Kolkata',
        notification_preferences: profile.notification_preferences || {
          email_notifications: true,
          sms_notifications: true,
          push_notifications: true,
          marketing_emails: false
        }
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = { ...formData };
      
      // Remove empty business info if user is individual
      if (profileData.user_type === 'individual') {
        delete updateData.business_info;
      }
      
      const updatedProfile = await profileAPI.updateProfile(updateData);
      setProfileData(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    fetchProfile();
  };

  // Email verification handlers
  const requestEmailVerification = async () => {
    try {
      setVerificationState(prev => ({ ...prev, emailOTPLoading: true, emailOTPError: null }));
      await profileAPI.requestEmailVerification();
      setVerificationState(prev => ({ ...prev, showEmailOTP: true, emailOTPLoading: false }));
      
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email for the OTP code'
      });
    } catch (error) {
      console.error('Failed to request email verification:', error);
      setVerificationState(prev => ({ 
        ...prev, 
        emailOTPLoading: false,
        emailOTPError: error.response?.data?.detail || 'Failed to send verification email'
      }));
    }
  };

  const confirmEmailVerification = async (otpCode) => {
    try {
      setVerificationState(prev => ({ ...prev, emailOTPLoading: true, emailOTPError: null }));
      await profileAPI.confirmEmailVerification(otpCode);
      
      // Refresh profile data
      await fetchProfile();
      
      setVerificationState(prev => ({ 
        ...prev, 
        showEmailOTP: false, 
        emailOTPLoading: false 
      }));
      
      toast({
        title: 'Success',
        description: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Failed to verify email:', error);
      setVerificationState(prev => ({ 
        ...prev, 
        emailOTPLoading: false,
        emailOTPError: error.response?.data?.detail || 'Invalid OTP code'
      }));
    }
  };

  // Phone verification handlers
  const requestPhoneVerification = async () => {
    try {
      setVerificationState(prev => ({ ...prev, phoneOTPLoading: true, phoneOTPError: null }));
      await profileAPI.requestPhoneVerification();
      setVerificationState(prev => ({ ...prev, showPhoneOTP: true, phoneOTPLoading: false }));
      
      toast({
        title: 'Verification SMS Sent',
        description: 'Please check your phone for the OTP code'
      });
    } catch (error) {
      console.error('Failed to request phone verification:', error);
      setVerificationState(prev => ({ 
        ...prev, 
        phoneOTPLoading: false,
        phoneOTPError: error.response?.data?.detail || 'Failed to send verification SMS'
      }));
    }
  };

  const confirmPhoneVerification = async (otpCode) => {
    try {
      setVerificationState(prev => ({ ...prev, phoneOTPLoading: true, phoneOTPError: null }));
      await profileAPI.confirmPhoneVerification(otpCode);
      
      // Refresh profile data
      await fetchProfile();
      
      setVerificationState(prev => ({ 
        ...prev, 
        showPhoneOTP: false, 
        phoneOTPLoading: false 
      }));
      
      toast({
        title: 'Success',
        description: 'Phone verified successfully'
      });
    } catch (error) {
      console.error('Failed to verify phone:', error);
      setVerificationState(prev => ({ 
        ...prev, 
        phoneOTPLoading: false,
        phoneOTPError: error.response?.data?.detail || 'Invalid OTP code'
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load profile data</p>
        <Button onClick={fetchProfile} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {profileData.first_name} {profileData.last_name}
              </CardTitle>
              <p className="text-gray-600">{profileData.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={profileData.user_type === 'business' ? 'default' : 'secondary'}>
                  {profileData.user_type === 'business' ? 'Business' : 'Individual'}
                </Badge>
                {profileData.is_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-orange-500" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.first_name || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              ) : (
                <p className="text-gray-900">{profileData.last_name || 'Not provided'}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{profileData.email}</span>
                {profileData.is_email_verified ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Unverified
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={requestEmailVerification}
                      disabled={verificationState.emailOTPLoading}
                    >
                      Verify
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Email OTP Verification */}
              {verificationState.showEmailOTP && (
                <div className="mt-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Verify Email Address
                  </h4>
                  <p className="text-sm text-orange-700 mb-4">
                    Enter the 6-digit code sent to your email
                  </p>
                  <OTPInput
                    length={6}
                    onComplete={confirmEmailVerification}
                    onResend={requestEmailVerification}
                    isLoading={verificationState.emailOTPLoading}
                    error={verificationState.emailOTPError}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <>
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{profileData.phone || 'Not provided'}</span>
                  </>
                )}
                
                {!isEditing && profileData.phone && (
                  profileData.is_phone_verified ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Unverified
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={requestPhoneVerification}
                        disabled={verificationState.phoneOTPLoading}
                      >
                        Verify
                      </Button>
                    </div>
                  )
                )}
              </div>
              
              {/* Phone OTP Verification */}
              {verificationState.showPhoneOTP && (
                <div className="mt-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Verify Phone Number
                  </h4>
                  <p className="text-sm text-orange-700 mb-4">
                    Enter the 6-digit code sent to your phone
                  </p>
                  <OTPInput
                    length={6}
                    onComplete={confirmPhoneVerification}
                    onResend={requestPhoneVerification}
                    isLoading={verificationState.phoneOTPLoading}
                    error={verificationState.phoneOTPError}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information (if user is business type) */}
      {profileData.user_type === 'business' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-orange-500" />
              <span>Business Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.business_info.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value, 'business_info')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business_info?.company_name || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.business_info.gst_number}
                    onChange={(e) => handleInputChange('gst_number', e.target.value, 'business_info')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 22ABCDE1234F1Z5"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business_info?.gst_number || 'Not provided'}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.business_info.pan_number}
                    onChange={(e) => handleInputChange('pan_number', e.target.value, 'business_info')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., ABCDE1234F"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business_info?.pan_number || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                {isEditing ? (
                  <select
                    value={formData.business_info.business_type}
                    onChange={(e) => handleInputChange('business_type', e.target.value, 'business_info')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Business Type</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="pvt_ltd">Private Limited</option>
                    <option value="public_ltd">Public Limited</option>
                    <option value="llp">Limited Liability Partnership</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profileData.business_info?.business_type || 'Not provided'}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.business_info.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value, 'business_info')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., E-commerce, Manufacturing"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business_info?.industry || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIN Number (if applicable)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.business_info.cin_number}
                    onChange={(e) => handleInputChange('cin_number', e.target.value, 'business_info')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Corporate Identification Number"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.business_info?.cin_number || 'Not provided'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              {isEditing ? (
                <select
                  value={formData.preferred_language}
                  onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profileData.preferred_language === 'en' ? 'English' : profileData.preferred_language}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              {isEditing ? (
                <select
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="UTC">UTC</option>
                </select>
              ) : (
                <p className="text-gray-900">{profileData.timezone}</p>
              )}
            </div>
          </div>
          
          {/* Notification Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Notification Preferences
            </label>
            <div className="space-y-3">
              {[
                { key: 'email_notifications', label: 'Email Notifications' },
                { key: 'sms_notifications', label: 'SMS Notifications' },
                { key: 'push_notifications', label: 'Push Notifications' },
                { key: 'marketing_emails', label: 'Marketing Emails' }
              ].map((pref) => (
                <div key={pref.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={pref.key}
                    checked={formData.notification_preferences[pref.key]}
                    onChange={(e) => 
                      handleInputChange(pref.key, e.target.checked, 'notification_preferences')
                    }
                    disabled={!isEditing}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor={pref.key} className="text-sm text-gray-700">
                    {pref.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;