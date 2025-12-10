import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Pill } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from './Toast';

interface PopularMed {
  id: string;
  name: string;
  generic_name: string | null;
  search_count: number;
}

interface PopularMedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedication: (medicationId: string, medicationName: string) => void;
}

export function PopularMedsModal({
  isOpen,
  onClose,
  onSelectMedication,
}: PopularMedsModalProps) {
  const [medications, setMedications] = useState<PopularMed[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPopularMeds();
    }
  }, [isOpen]);

  const fetchPopularMeds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('id, name, generic_name, search_count')
        .order('search_count', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error fetching popular medications:', error);
        showToast('Failed to load popular medications', 'error');
      } else {
        setMedications(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedication = (med: PopularMed) => {
    onSelectMedication(med.id, med.name);
    onClose();
    showToast(`Viewing ${med.name}`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Popular Medications</h2>
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
            <LoadingSpinner text="Loading popular medications..." />
          ) : medications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No medications tracked yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((med, index) => (
                <button
                  key={med.id}
                  onClick={() => handleSelectMedication(med)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {med.name}
                        </h3>
                        {med.generic_name && (
                          <p className="text-sm text-gray-600">
                            {med.generic_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-orange-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">
                          {med.search_count} searches
                        </span>
                      </div>
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
