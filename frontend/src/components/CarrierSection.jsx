import React from 'react';
import { carriers } from '../data/mockData';

const CarrierSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Compare Rates & Save up to 60%
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Partner with India's leading multi-carrier shipping platform. Get the best rates from premium carriers.
          </p>
        </div>

        {/* Carrier Logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {carriers.map((carrier) => (
            <div 
              key={carrier.id} 
              className="group bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300 w-full h-24 flex items-center justify-center"
            >
              <img
                src={carrier.logo}
                alt={carrier.name}
                className="max-h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">15+</div>
            <div className="text-slate-600">Premium Carriers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">190+</div>
            <div className="text-slate-600">Countries Covered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">60%</div>
            <div className="text-slate-600">Average Savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">98.5%</div>
            <div className="text-slate-600">On-Time Delivery</div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-8 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">100% Secure</p>
                <p className="text-sm text-slate-600">SSL Encrypted Payments</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Insurance Coverage</p>
                <p className="text-sm text-slate-600">Up to ₹50,000 protection</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5zm-4.218 4.218a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06 0l4.5-4.5a.75.75 0 00-1.06-1.06L12 6.75l-1.72-1.72a.75.75 0 00-1.06 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">24/7 Support</p>
                <p className="text-sm text-slate-600">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarrierSection;