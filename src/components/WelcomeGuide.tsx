import React, { useState } from 'react';
import { X, Search, MapPin, Users, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function WelcomeGuide() {
  const [hasSeenGuide, setHasSeenGuide] = useLocalStorage('naijameds-welcome-guide', false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: 'Search for Medications',
      description: 'Find any medication available in Nigerian pharmacies. Search by brand name or generic name.'
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: 'Find Nearby Pharmacies',
      description: 'See which pharmacies have your medication in stock, with current prices and availability status.'
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: 'Help the Community',
      description: 'Update stock status and prices to help other Nigerians find their medications faster.'
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-orange-600" />,
      title: 'Get Started',
      description: 'Ready to find your medications? Start by searching above or browse popular medications.'
    }
  ];

  if (hasSeenGuide) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasSeenGuide(true);
    }
  };

  const handleSkip = () => {
    setHasSeenGuide(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Welcome to NaijaMeds!</h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}