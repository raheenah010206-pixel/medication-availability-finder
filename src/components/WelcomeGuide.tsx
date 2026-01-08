import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function WelcomeGuide() {
  const [hasSeenGuide, setHasSeenGuide] = useLocalStorage('naijameds-welcome-guide', false);
  const [showGuide, setShowGuide] = useState(false);

  if (hasSeenGuide && !showGuide) return null;

  const handleDismiss = () => {
    setHasSeenGuide(true);
    setShowGuide(false);
  };

  const steps = [
    {
      title: 'Search for Medications',
      description: 'Find any medication available in Nigerian pharmacies. Search by brand name or generic name.',
      tip: 'Start typing to see suggestions'
    },
    {
      title: 'Find Nearby Pharmacies',
      description: 'See which pharmacies have your medication in stock, with current prices and availability status.',
      tip: 'Green badge = in stock, Red badge = out of stock'
    },
    {
      title: 'Help the Community',
      description: 'Update stock status and prices to help other Nigerians find their medications faster.',
      tip: 'Sign in to contribute and earn achievements'
    }
  ];

  return (
    <>
      {!hasSeenGuide && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-blue-200 p-4 max-w-xs z-40">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Welcome to NaijaMeds!</h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss welcome message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Find medications across Nigerian pharmacies. Compare prices and help others in your community.
          </p>
          <button
            onClick={() => setShowGuide(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Learn more
          </button>
        </div>
      )}

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">How NaijaMeds Works</h2>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close guide"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                      <span className="text-blue-600 font-semibold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    <p className="text-xs text-blue-600">{step.tip}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Searching
            </button>
          </div>
        </div>
      )}
    </>
  );
}