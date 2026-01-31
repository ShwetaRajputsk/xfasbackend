import React from 'react';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const TermsAndConditions = ({ onBack }) => {
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
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
            <p className="text-gray-600">Last updated: January 22, 2026</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span>Welcome to XFas Logistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            These Terms and Conditions ("Terms") govern your use of XFas Logistics services and website. 
            By using our services, you agree to be bound by these Terms. Please read them carefully before 
            proceeding with any shipment booking.
          </p>
        </CardContent>
      </Card>

      {/* Acceptance of Terms */}
      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            By accessing and using XFas Logistics services, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms and Conditions and our Privacy Policy.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-900 font-medium">Agreement Required</p>
                <p className="text-blue-700 text-sm">
                  You must be at least 18 years old and have the legal capacity to enter into contracts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>2. Our Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            XFas Logistics provides multi-channel shipping solutions including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Domestic and international shipping services</li>
            <li>Package tracking and monitoring</li>
            <li>Insurance and liability coverage options</li>
            <li>Customs clearance assistance</li>
            <li>Real-time shipping quotes and comparisons</li>
          </ul>
        </CardContent>
      </Card>

      {/* User Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle>3. User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">3.1 Accurate Information</h4>
              <p className="text-gray-700">
                You must provide accurate, complete, and up-to-date information for all shipments, 
                including sender and recipient details, package contents, and declared values.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">3.2 Prohibited Items</h4>
              <p className="text-gray-700">
                You agree not to ship any prohibited or restricted items as outlined in our 
                prohibited items list. This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Explosives, flammable materials, and hazardous substances</li>
                <li>Illegal drugs, weapons, and ammunition</li>
                <li>Counterfeit goods and copyrighted materials</li>
                <li>Live animals and perishable items without proper packaging</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">3.3 Packaging Requirements</h4>
              <p className="text-gray-700">
                You are responsible for proper packaging to ensure safe transport. 
                Inadequate packaging may result in damage and void insurance coverage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle>4. Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">4.1 Payment Methods</h4>
              <p className="text-gray-700">
                We accept online payments through Razorpay (credit cards, debit cards, UPI, net banking) 
                and partial payment options with 10% minimum advance payment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">4.2 Pricing</h4>
              <p className="text-gray-700">
                All prices are quoted in Indian Rupees (INR) and include applicable taxes unless 
                otherwise specified. Prices may vary based on weight, dimensions, destination, and service level.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">4.3 Refunds</h4>
              <p className="text-gray-700">
                Refunds are processed according to our refund policy. Cancellations must be made 
                before the shipment is picked up or dispatched.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liability and Insurance */}
      <Card>
        <CardHeader>
          <CardTitle>5. Liability and Insurance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-900 font-medium">Important Notice</p>
                <p className="text-yellow-800 text-sm">
                  Our liability is limited to the declared value of the shipment or the actual loss, 
                  whichever is lower, unless additional insurance is purchased.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">5.1 Standard Liability</h4>
              <p className="text-gray-700">
                Standard liability coverage is limited to ₹1,000 per kg or the declared value, 
                whichever is lower, for domestic shipments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">5.2 Additional Insurance</h4>
              <p className="text-gray-700">
                Additional insurance coverage is available for high-value items. 
                Insurance premiums are calculated based on the declared value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Terms */}
      <Card>
        <CardHeader>
          <CardTitle>6. Delivery Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">6.1 Delivery Timeframes</h4>
              <p className="text-gray-700">
                Delivery timeframes are estimates and may vary due to factors beyond our control, 
                including weather conditions, customs delays, and local restrictions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">6.2 Failed Delivery Attempts</h4>
              <p className="text-gray-700">
                If delivery cannot be completed due to incorrect address or recipient unavailability, 
                additional charges may apply for re-delivery attempts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy and Data Protection */}
      <Card>
        <CardHeader>
          <CardTitle>7. Privacy and Data Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Your privacy is important to us. Please review our Privacy Policy to understand how we 
            collect, use, and protect your personal information. By using our services, you consent 
            to the collection and use of your information as described in our Privacy Policy.
          </p>
        </CardContent>
      </Card>

      {/* Modifications */}
      <Card>
        <CardHeader>
          <CardTitle>8. Modifications to Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            We reserve the right to modify these Terms and Conditions at any time. Changes will be 
            effective immediately upon posting on our website. Your continued use of our services 
            after any changes constitutes acceptance of the new Terms.
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>9. Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-gray-700">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="font-medium">XFas Logistics Pvt. Ltd.</p>
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

export default TermsAndConditions;