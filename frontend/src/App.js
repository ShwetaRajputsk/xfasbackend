import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Hero from './components/Hero';
import CarrierSection from './components/CarrierSection';
import ServicesSection from './components/ServicesSection';
import FeaturesSection from './components/FeaturesSection';
import TestimonialsSection from './components/TestimonialsSection';
import HowItWorksSection from './components/HowItWorksSection';
import Footer from './components/Footer';
import QuoteForm from './components/QuoteForm';
import TrackingPage from './components/TrackingPage';
import PricingPage from './components/PricingPage';
import SupportPage from './components/SupportPage';
import AboutPage from './components/AboutPage';
import PrivacyPage from './components/PrivacyPage';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import AdminApp from './components/AdminApp';
import UserDashboard from './components/UserDashboard';
import UserProfile from './components/profile/UserProfile';
import MyShipments from './components/MyShipments';
import WalletDashboard from './components/WalletDashboard';
import PaymentTest from './components/PaymentTest';
import { useAuth } from './contexts/AuthContext';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CarrierSection />
      <ServicesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

const QuotePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuoteForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

const TrackPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TrackingPage />
      <Footer />
    </div>
  );
};

const PricingPageWrapper = () => {
  return (
    <>
      <Header />
      <PricingPage />
      <Footer />
    </>
  );
};

const SupportPageWrapper = () => {
  return (
    <>
      <Header />
      <SupportPage />
      <Footer />
    </>
  );
};

const AboutPageWrapper = () => {
  return (
    <>
      <Header />
      <AboutPage />
      <Footer />
    </>
  );
};

const TermsAndConditionsPageWrapper = () => {
  return (
    <>
      <Header />
      <TermsAndConditions />
      <Footer />
    </>
  );
};

const PrivacyPolicyPageWrapper = () => {
  return (
    <>
      <Header />
      <PrivacyPolicy />
      <Footer />
    </>
  );
};

const PrivacyPageWrapper = () => {
  return (
    <>
      <Header />
      <PrivacyPage />
      <Footer />
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Automatically redirect to homepage instead of showing "Please Sign In" message
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// User Dashboard Page
const DashboardPageWrapper = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <UserDashboard />
      </div>
    </ProtectedRoute>
  );
};

// User Profile Page
const ProfilePageWrapper = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
};

// My Shipments Page
const MyShipmentsPageWrapper = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MyShipments />
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Wallet Page
const WalletPageWrapper = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <WalletDashboard />
      </div>
    </ProtectedRoute>
  );
};

// Payment Test Page
const PaymentTestPageWrapper = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PaymentTest />
      </div>
    </ProtectedRoute>
  );
};


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quote" element={<QuotePage />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/pricing" element={<PricingPageWrapper />} />
              <Route path="/support" element={<SupportPageWrapper />} />
              <Route path="/about" element={<AboutPageWrapper />} />
              <Route path="/privacy" element={<PrivacyPageWrapper />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditionsPageWrapper />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPageWrapper />} />
              <Route path="/dashboard" element={<DashboardPageWrapper />} />
              <Route path="/profile" element={<ProfilePageWrapper />} />
              <Route path="/my-shipments" element={<MyShipmentsPageWrapper />} />
              <Route path="/wallet" element={<WalletPageWrapper />} />
              <Route path="/payment-test" element={<PaymentTestPageWrapper />} />
              <Route path="/admin/*" element={<AdminApp />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;