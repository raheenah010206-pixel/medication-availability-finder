import React from 'react';
import { Pill, AlertCircle, HelpCircle, Zap } from 'lucide-react';
import { Medication } from '../types';

interface MedicationDetailsProps {
  medication: Medication;
}

export function MedicationDetails({ medication }: MedicationDetailsProps) {
  const medicationInfo: Record<string, { uses: string[]; sideEffects: string[]; dosageNote: string }> = {
    'Panadol': {
      uses: ['Headache and fever relief', 'Mild to moderate pain', 'Cold and flu symptoms'],
      sideEffects: ['Rare: nausea, upset stomach', 'Allergic reactions possible'],
      dosageNote: 'Take 1-2 tablets every 4-6 hours. Max 8 tablets per day'
    },
    'Flagyl': {
      uses: ['Bacterial infections', 'Parasitic infections', 'Protozoal infections'],
      sideEffects: ['Nausea or vomiting', 'Metallic taste in mouth', 'Dark urine (normal)'],
      dosageNote: 'Usually 400mg-500mg, 3 times daily. Take with food'
    },
    'Amoxil': {
      uses: ['Bacterial infections', 'Ear, nose, throat infections', 'Respiratory infections'],
      sideEffects: ['Allergic reactions possible', 'Nausea, diarrhea', 'Rash (stop if severe)'],
      dosageNote: 'Usually 250-500mg every 8 hours. Take with or without food'
    },
    'Aspirin': {
      uses: ['Pain and fever relief', 'Inflammation reduction', 'Heart health support'],
      sideEffects: ['Stomach upset or bleeding', 'Allergic reactions'],
      dosageNote: 'Usually 500mg-1g every 4-6 hours. Take with food'
    },
    'Chloroquine': {
      uses: ['Malaria prevention', 'Malaria treatment', 'Certain inflammatory conditions'],
      sideEffects: ['Nausea, headache', 'Vision changes', 'Dizziness'],
      dosageNote: 'Dosage varies by condition. Must be prescribed by doctor'
    },
    'Metformin': {
      uses: ['Type 2 diabetes management', 'Blood sugar control', 'PCOS management'],
      sideEffects: ['Nausea, diarrhea', 'Vitamin B12 deficiency (long-term)'],
      dosageNote: 'Usually starts at 500mg daily. Prescribed dose varies'
    },
  };

  const info = medicationInfo[medication.name] || {
    uses: ['Common medication used for various conditions'],
    sideEffects: ['Consult pharmacist for detailed information'],
    dosageNote: 'Always follow pharmacist or doctor instructions'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Pill className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-gray-900">{medication.name}</h3>
          {medication.generic_name && (
            <p className="text-sm text-gray-600">Generic: {medication.generic_name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-600" />
            Common Uses
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {info.uses.map((use, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Possible Side Effects
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {info.sideEffects.map((effect, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            Typical Dosage
          </h4>
          <p className="text-sm text-gray-600">{info.dosageNote}</p>
          <p className="text-xs text-gray-500 mt-2">Always follow your pharmacist or doctor's instructions</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
        <p className="font-semibold text-blue-900 mb-1">Important:</p>
        <p>This information is for educational purposes. Always consult with a pharmacist or doctor before taking any medication.</p>
      </div>
    </div>
  );
}
