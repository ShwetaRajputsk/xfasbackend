import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        )}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: January 22, 2026</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span>Your Privacy Matters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            At XFas Logistics, we are committed to protecting your privacy and ensuring the security 
            of your personal information. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our shipping services and website.
          </p>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-green-600" />
            <span>1. Information We Collect</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">1.1 Personal Information</h4>
              <p className="text-gray-700 mb-2">
                We collect personal information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Company information (if applicable)</li>
                <li>Government-issued ID for customs and verification purposes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900">1.2 Shipment Information</h4>
              <p className="text-gray-700 mb-2">
                Information related to your shipments, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Package contents, weight, and dimensions</li>
                <li>Declared value and customs information</li>
                <li>Tracking and delivery status</li>
                <li>Special handling instructions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900">1.3 Technical Information</h4>
              <p className="text-gray-700 mb-2">
                We automatically collect certain technical information, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Website usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <span>2. How We Use Your Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            We use the information we collect for the following purposes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Service Delivery</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Process and fulfill shipping orders</li>
                <li>• Provide tracking and delivery updates</li>
                <li>• Handle customs clearance</li>
                <li>• Manage returns and claims</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Communication</h5>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Send booking confirmations</li>
                <li>• Provide customer support</li>
                <li>• Send service updates</li>
                <li>• Marketing communications (with consent)</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Legal Compliance</h5>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Comply with customs regulations</li>
                <li>• Meet legal and regulatory requirements</li>
                <li>• Prevent fraud and ensure security</li>
                <li>• Resolve disputes and claims</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h5 className="font-semibold text-orange-900 mb-2">Service Improvement</h5>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Analyze usage patterns</li>
                <li>• Improve our services</li>
                <li>• Develop new features</li>
                <li>• Enhance user experience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <span>3. Information Sharing and Disclosure</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            We may share your information in the following circumstances:
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">3.1 Service Providers</h4>
              <p className="text-gray-700">
                We share information with trusted third-party service providers who help us deliver 
                our services, including shipping carriers, payment processors, and technology providers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">3.2 Legal Requirements</h4>
              <p className="text-gray-700">
                We may disclose information when required by law, court order, or government request, 
                or to protect our rights, property, or safety.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">3.3 Business Transfers</h4>
              <p className="text-gray-700">
                In the event of a merger, acquisition, or sale of assets, your information may be 
                transferred as part of the business transaction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-red-600" />
            <span>4. Data Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-900 font-medium">Security Measures</p>
                <p className="text-red-800 text-sm">
                  We implement industry-standard security measures to protect your personal information 
                  from unauthorized access, disclosure, alteration, or destruction.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">4.1 Technical Safeguards</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure data storage with encryption at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication measures</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">4.2 Payment Security</h4>
              <p className="text-gray-700">
                Payment information is processed through Razorpay's secure payment gateway. 
                We do not store complete credit card information on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle>5. Your Rights and Choices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            You have the following rights regarding your personal information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Access and Correction</h5>
              <p className="text-sm text-gray-700">
                Request access to your personal information and correct any inaccuracies.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Data Portability</h5>
              <p className="text-sm text-gray-700">
                Request a copy of your personal information in a structured format.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Deletion</h5>
              <p className="text-sm text-gray-700">
                Request deletion of your personal information (subject to legal requirements).
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Marketing Opt-out</h5>
              <p className="text-sm text-gray-700">
                Unsubscribe from marketing communications at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cookies */}
      <Card>
        <CardHeader>
          <CardTitle>6. Cookies and Tracking Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            We use cookies and similar technologies to enhance your experience on our website:
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">6.1 Essential Cookies</h4>
              <p className="text-gray-700">
                Required for basic website functionality, including user authentication and security.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">6.2 Analytics Cookies</h4>
              <p className="text-gray-700">
                Help us understand how visitors use our website to improve our services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">6.3 Marketing Cookies</h4>
              <p className="text-gray-700">
                Used to deliver relevant advertisements and track campaign effectiveness (with your consent).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>7. Data Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            We retain your personal information for as long as necessary to provide our services, 
            comply with legal obligations, resolve disputes, and enforce our agreements. 
            Shipment records are typically retained for 7 years for legal and regulatory compliance.
          </p>
        </CardContent>
      </Card>

      {/* International Transfers */}
      <Card>
        <CardHeader>
          <CardTitle>8. International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            For international shipments, your information may be transferred to and processed in 
            countries other than India. We ensure appropriate safeguards are in place to protect 
            your information in accordance with applicable data protection laws.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Policy */}
      <Card>
        <CardHeader>
          <CardTitle>9. Changes to This Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any material 
            changes by posting the new Privacy Policy on our website and updating the "Last updated" 
            date. Your continued use of our services after any changes constitutes acceptance of the 
            updated Privacy Policy.
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>10. Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="font-medium">XFas Logistics Pvt. Ltd.</p>
              <p className="text-gray-700">Privacy Officer</p>
              <p className="text-gray-700">Email: contact@xfas.in</p>
              <p className="text-gray-700">Phone: 011-47501136</p>
              <p className="text-gray-700">WhatsApp: 9821984141</p>
              <p className="text-gray-700">Address: Madhuban Tower, A-200 Road no 4, Gali no 10, Mahipalpur, New Delhi 110037</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-6 border-t">
        <p className="text-sm text-gray-500">
          © 2026 XFas Logistics Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;