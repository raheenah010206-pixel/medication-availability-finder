import React, { useState, useEffect } from 'react';
import { Heart, X, AlertCircle } from 'lucide-react';
import { Medication } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SavedMedicationsPanelProps {
  onMedicationSelect: (medication: Medication) => void;
  selectedMedicationId?: string;
}

export function SavedMedicationsPanel({ onMedicationSelect, selectedMedicationId }: SavedMedicationsPanelProps) {
  const [savedMedications, setSavedMedications] = useLocalStorage<Medication[]>('naijameds-saved-medications', []);
  const [isExpanded, setIsExpanded] = useState(false);

  if (savedMedications.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <div className="flex items-start gap-2">
          <Heart className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Save Your Medications</p>
            <p className="text-blue-700 text-xs mt-1">Heart a medication to save it here for quick access later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500 fill-current" />
          <span className="font-semibold text-gray-900">My Medications ({savedMedications.length})</span>
        </div>
        <span className="text-gray-500 text-sm">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
          {savedMedications.map((med) => (
            <div key={med.id} className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded transition-colors group">
              <button
                onClick={() => onMedicationSelect(med)}
                className={`flex-1 text-left text-sm transition-colors ${
                  selectedMedicationId === med.id
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <div className="font-medium">{med.name}</div>
                {med.generic_name && (
                  <div className="text-xs text-gray-500">Generic: {med.generic_name}</div>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSavedMedications(savedMedications.filter(m => m.id !== med.id));
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove from saved"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function useSavedMedications() {
  const [savedMedications, setSavedMedications] = useLocalStorage<Medication[]>('naijameds-saved-medications', []);

  const addSavedMedication = (medication: Medication) => {
    if (!savedMedications.find(m => m.id === medication.id)) {
      setSavedMedications([...savedMedications, medication]);
    }
  };

  const removeSavedMedication = (medicationId: string) => {
    setSavedMedications(savedMedications.filter(m => m.id !== medicationId));
  };

  const isSaved = (medicationId: string) => {
    return savedMedications.some(m => m.id === medicationId);
  };

  return {
    savedMedications,
    addSavedMedication,
    removeSavedMedication,
    isSaved
  };
}
