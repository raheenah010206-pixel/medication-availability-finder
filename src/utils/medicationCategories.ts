export const medicationCategories: Record<string, string[]> = {
  'Pain & Fever': [
    'Panadol', 'Ibuprofen', 'Aspirin', 'Advil', 'Tylenol'
  ],
  'Antibiotics': [
    'Amoxil', 'Ciprofloxacin', 'Septrin'
  ],
  'Anti-Malarial': [
    'Chloroquine', 'Artemether', 'Paludrine'
  ],
  'Digestive Health': [
    'Flagyl', 'Omeprazole', 'Pepto-Bismol'
  ],
  'Chronic Diseases': [
    'Metformin', 'Insulin', 'Lisinopril'
  ],
  'Allergies & Cold': [
    'Benadryl', 'Zyrtec', 'Vitamin C'
  ]
};

export function getCategoryForMedication(medicationName: string): string | null {
  for (const [category, medications] of Object.entries(medicationCategories)) {
    if (medications.some(med => med.toLowerCase() === medicationName.toLowerCase())) {
      return category;
    }
  }
  return null;
}

export function getMedicationsInCategory(category: string): string[] {
  return medicationCategories[category] || [];
}
