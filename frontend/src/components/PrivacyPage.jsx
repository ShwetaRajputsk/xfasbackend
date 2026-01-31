import React from 'react';
import { Shield, Eye, Lock, Users, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PrivacyPage = () => {
  const lastUpdated = "September 1, 2025";

  const sections = [
    {
      title: "Information We Collect",
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      content: [
        {
          subtitle: "Personal Information",
          items: [
            "Name, email address, phone number, and business details when you register",
            "Shipping addresses (sender and recipient information)",
            "Payment information (processed securely through our payment partners)",
            "Identity verification documents for compliance purposes"
          ]
        },
        {
          subtitle: "Shipment Information",
          items: [
            "Package details including weight, dimensions, and contents description",
            "Tracking and delivery information",
            "Communication preferences and customer service interactions"
          ]
        },
        {
          subtitle: "Technical Information",
          items: [
            "IP address, browser type, and device information",
            "Website usage data and analytics through cookies",
            "Log files for security and troubleshooting purposes"
          ]
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <Users className="w-6 h-6 text-green-500" />,
      content: [
        {
          subtitle: "Service Delivery",
          items: [
            "Process and fulfill your shipping requests",
            "Communicate with you about your shipments and account",
            "Provide customer support and resolve issues",
            "Send important service notifications and updates"
          ]
        },
        {
          subtitle: "Business Operations",
          items: [
            "Verify your identity and prevent fraud",
            "Comply with legal and regulatory requirements",
            "Improve our services and develop new features",
            "Conduct analytics to enhance user experience"
          ]
        },
        {
          subtitle: "Marketing Communications",
          items: [
            "Send promotional emails about our services (with your consent)",
            "Provide personalized recommendations and offers",
            "Conduct surveys and gather feedback"
          ]
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: <Eye className="w-6 h-6 text-orange-500" />,
      content: [
        {
          subtitle: "Shipping Partners",
          items: [
            "We share necessary shipment details with courier partners (FedEx, DHL, UPS, etc.) to fulfill deliveries",
            "Recipient information is shared only as required for successful delivery",
            "We ensure all partners maintain appropriate data protection standards"
          ]
        },
        {
          subtitle: "Service Providers",
          items: [
            "Payment processors for secure transaction handling",
            "Cloud storage providers for data hosting and backup",
            "Analytics and customer support tools to improve our services"  
          ]
        },
        {
          subtitle: "Legal Requirements",
          items: [
            "Government authorities when required by law or regulation",
            "Law enforcement agencies for legitimate investigations",
            "Courts or tribunals in response to legal proceedings"
          ]
        }
      ]
    },
    {
      title: "Data Security",
      icon: <Lock className="w-6 h-6 text-red-500" />,
      content: [
        {
          subtitle: "Security Measures",
          items: [
            "SSL encryption for all data transmission",
            "Secure cloud infrastructure with access controls",
            "Regular security audits and vulnerability assessments",
            "Employee training on data protection best practices"
          ]
        },
        {
          subtitle: "Access Controls",
          items: [
            "Multi-factor authentication for admin accounts",
            "Role-based access to customer information",
            "Regular review and updating of access permissions",
            "Secure deletion of data when no longer needed"
          ]
        }
      ]
    },
    {
      title: "Your Rights",
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      content: [
        {
          subtitle: "Data Access and Control",
          items: [
            "Access your personal information we hold about you",
            "Correct inaccurate or incomplete information",
            "Request deletion of your data (subject to legal requirements)",
            "Download your shipment history and account data"
          ]
        },
        {
          subtitle: "Communication Preferences",
          items: [
            "Opt-out of marketing communications at any time",
            "Choose your preferred communication channels",
            "Update your contact preferences in your account settings"
          ]
        }
      ]
    },
    {
      title: "Data Retention",
      icon: <Clock className="w-6 h-6 text-indigo-500" />,
      content: [
        {
          subtitle: "Retention Periods",
          items: [
            "Account information: Retained while your account is active",
            "Shipment records: Kept for 7 years for legal and tax compliance",
            "Payment information: Stored only as long as necessary for transaction processing",
            "Marketing data: Deleted when you opt-out or within 2 years of inactivity"
          ]
        },
        {
          subtitle: "Data Deletion",
          items: [
            "Automatic deletion after retention periods expire",
            "Secure deletion methods to prevent data recovery",
            "Notification to relevant parties when deletion affects ongoing services"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-orange-400" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            Your privacy is important to us. This policy explains how we collect, use, 
            and protect your personal information.
          </p>
          <p className="text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 mb-4">
                XFas Logistics ("we," "our," or "us") is committed to protecting your privacy and ensuring 
                the security of your personal information. This Privacy Policy describes how we collect, 
                use, disclose, and safeguard your information when you use our logistics and shipping services.
              </p>
              <p className="text-gray-600 mb-4">
                By using our services, you agree to the collection and use of information in accordance 
                with this policy. We will not use or share your information with anyone except as described 
                in this Privacy Policy.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 text-sm">
                  <strong>Important:</strong> If you do not agree with the terms of this Privacy Policy, 
                  please do not access or use our services.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  {section.icon}
                  <span className="ml-3">{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {section.content.map((subsection, subIndex) => (
                  <div key={subIndex} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {subsection.subtitle}
                    </h3>
                    <ul className="space-y-2">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start text-gray-600">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Cookies Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-gray-600 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. 
                Cookies are small data files stored on your device that help us:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Remember your preferences and settings
                </li>
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Analyze website traffic and usage patterns
                </li>
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Provide personalized content and advertisements
                </li>
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Ensure website security and prevent fraud
                </li>
              </ul>
              <p className="text-gray-600">
                You can control cookies through your browser settings. However, disabling cookies may 
                affect the functionality of our services.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* International Transfers */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-gray-600 mb-4">
                As we provide international shipping services, your information may be transferred to and 
                processed in countries outside of India. We ensure that such transfers are conducted in 
                accordance with applicable data protection laws and regulations.
              </p>
              <p className="text-gray-600">
                When transferring data internationally, we implement appropriate safeguards such as:
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Standard contractual clauses with service providers
                </li>
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Adequacy decisions for data protection standards
                </li>
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Certification schemes and codes of conduct
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-gray-600 mb-6">
                If you have any questions about this Privacy Policy, your data rights, or our privacy 
                practices, please contact us:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Email:</h3>
                  <p className="text-gray-600">privacy@xfas.in</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone:</h3>
                  <p className="text-gray-600">011-47501136</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Address:</h3>
                  <p className="text-gray-600">
                    XFas Logistics Private Limited<br />
                    Madhuban Tower, A-200 Road no 4, Gali no 10, Mahipalpur, New Delhi 110037
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Response Time:</strong> We will respond to your privacy-related inquiries 
                  within 30 days of receiving your request.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Updates */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                services, or applicable laws. When we make material changes, we will:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Update the "Last updated" date at the top of this policy
                </li>
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Notify you via email or through our website
                </li>
                <li className="flex items-start text-gray-600">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Provide you with the opportunity to review the changes
                </li>
              </ul>
              <p className="text-gray-600">
                Your continued use of our services after any policy updates constitutes your acceptance 
                of the revised Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;