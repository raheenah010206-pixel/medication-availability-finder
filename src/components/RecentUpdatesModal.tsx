import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from './Toast';

interface RecentUpdate {
  id: string;
  medication: {
    id: string;
    name: string;
    generic_name: string | null;
  };
  pharmacy: {
    id: string;
    name: string;
    address: string;
  };
  in_stock: boolean;
  price: number | null;
  last_updated: string;
}

interface RecentUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedication: (medicationId: string, medicationName: string) => void;
}

export function RecentUpdatesModal({
  isOpen,
  onClose,
  onSelectMedication,
}: RecentUpdatesModalProps) {
  const [updates, setUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchRecentUpdates();
    }
  }, [isOpen]);

  const fetchRecentUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('availability')
        .select(`
          id,
          in_stock,
          price,
          last_updated,
          medication:medications(id, name, generic_name),
          pharmacy:pharmacies(id, name, address)
        `)
        .order('last_updated', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching recent updates:', error);
        showToast('Failed to load recent updates', 'error');
      } else {
        setUpdates(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedication = (update: RecentUpdate) => {
    onSelectMedication(update.medication.id, update.medication.name);
    onClose();
    showToast(`Viewing ${update.medication.name}`, 'success');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Recent Updates</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LoadingSpinner text="Loading recent updates..." />
          ) : updates.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No recent updates yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map((update) => (
                <button
                  key={update.id}
                  onClick={() => handleSelectMedication(update)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {update.medication.name}
                      </h3>
                      {update.medication.generic_name && (
                        <p className="text-sm text-gray-600">
                          {update.medication.generic_name}
                        </p>
                      )}
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {update.pharmacy.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          update.in_stock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {update.in_stock ? 'In Stock' : 'Out of Stock'}
                      </div>
                      {update.price && (
                        <p className="text-sm text-gray-600 mt-2">
                          ${parseFloat(update.price.toString()).toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(update.last_updated)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
