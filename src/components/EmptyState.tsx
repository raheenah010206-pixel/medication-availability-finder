import React from 'react';
import { Search, MapPin, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'no-medication' | 'no-pharmacies';
  searchQuery?: string;
  onAddPharmacy?: () => void;
}

export function EmptyState({ type, searchQuery, onAddPharmacy }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: `No results found for "${searchQuery}"`,
          description: 'Try searching with different keywords or check your spelling.',
          action: null
        };
      
      case 'no-medication':
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: 'Start by searching for a medication',
          description: 'Enter the name of a medication to find its availability across Nigerian pharmacies.',
          action: null
        };
      
      case 'no-pharmacies':
        return {
          icon: <MapPin className="h-12 w-12 text-gray-400" />,
          title: 'No pharmacies found in your area',
          description: 'Help us grow our database by adding a pharmacy near you.',
          action: onAddPharmacy ? (
            <button
              onClick={onAddPharmacy}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Pharmacy
            </button>
          ) : null
        };
      
      default:
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: 'No data available',
          description: 'Please try again later.',
          action: null
        };
    }
  };

  const content = getContent();

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {content.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {content.description}
      </p>
      {content.action}
    </div>
  );
}