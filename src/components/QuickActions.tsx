import React from 'react';
import { Plus, MapPin, Clock, TrendingUp } from 'lucide-react';

interface QuickActionsProps {
  onAddPharmacy: () => void;
  onShowNearby: () => void;
  onShowRecent: () => void;
  onShowPopular: () => void;
}

export function QuickActions({ onAddPharmacy, onShowNearby, onShowRecent, onShowPopular }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={onAddPharmacy}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <Plus className="h-6 w-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Add Pharmacy</span>
        </button>
        
        <button
          onClick={onShowNearby}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
        >
          <MapPin className="h-6 w-6 text-green-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Find Nearby</span>
        </button>
        
        <button
          onClick={onShowRecent}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <Clock className="h-6 w-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Recent Updates</span>
        </button>
        
        <button
          onClick={onShowPopular}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
        >
          <TrendingUp className="h-6 w-6 text-orange-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Popular Meds</span>
        </button>
      </div>
    </div>
  );
}