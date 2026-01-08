import React, { useState, useEffect } from 'react';
import { Search, Plus, Pill, TrendingUp, Clock, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { supabase } from '../lib/supabase';
import { Medication } from '../types';
import { medicationCategories, getCategoryForMedication } from '../utils/medicationCategories';

interface MedicationSearchProps {
  onMedicationSelect: (medication: Medication) => void;
  selectedMedication: Medication | null;
}

export function MedicationSearch({ onMedicationSelect, selectedMedication }: MedicationSearchProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    let filtered = medications;

    if (searchTerm.trim()) {
      filtered = medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.generic_name && med.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      const categoryMeds = medicationCategories[selectedCategory] || [];
      filtered = filtered.filter(med =>
        categoryMeds.some(catMed => catMed.toLowerCase() === med.name.toLowerCase())
      );
    }

    setFilteredMedications(filtered);
  }, [searchTerm, medications, selectedCategory]);

  const fetchMedications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching medications:', error);
    } else {
      setMedications(data || []);
      setFilteredMedications(data || []);
    }
    setLoading(false);
  };

  const popularMedications = medications.slice(0, 6); // Show first 6 as popular
  const recentMedications = medications.slice(-4); // Show last 4 as recent

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Find Your Medication</h2>
          <p className="text-gray-600 mt-1">Search for medications available in Nigerian pharmacies</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search medications by name or generic name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search medications"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Medications
          </button>
          {Object.keys(medicationCategories).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading available medications..." />
      ) : (
        <div>
          {filteredMedications.length === 0 ? (
            <EmptyState 
              type="no-results" 
              searchQuery={searchTerm}
            />
          ) : (
            <>
              {/* Popular Medications Section */}
              {!searchTerm && popularMedications.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Popular Medications</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularMedications.map((medication) => (
                      <MedicationCard
                        key={medication.id}
                        medication={medication}
                        onSelect={onMedicationSelect}
                        isSelected={selectedMedication?.id === medication.id}
                        badge="Popular"
                        badgeColor="orange"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Medications Section */}
              {!searchTerm && recentMedications.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Recently Added</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentMedications.map((medication) => (
                      <MedicationCard
                        key={medication.id}
                        medication={medication}
                        onSelect={onMedicationSelect}
                        isSelected={selectedMedication?.id === medication.id}
                        badge="New"
                        badgeColor="purple"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Medications or Search Results */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {searchTerm ? `Search Results (${filteredMedications.length})` : 'All Medications'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMedications.map((medication) => {
                    const category = getCategoryForMedication(medication.name);
                    return (
                      <MedicationCard
                        key={medication.id}
                        medication={medication}
                        onSelect={onMedicationSelect}
                        isSelected={selectedMedication?.id === medication.id}
                        category={category}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface MedicationCardProps {
  medication: Medication;
  onSelect: (medication: Medication) => void;
  isSelected: boolean;
  badge?: string;
  badgeColor?: 'orange' | 'purple' | 'blue';
  category?: string | null;
}

function MedicationCard({ medication, onSelect, isSelected, badge, badgeColor, category }: MedicationCardProps) {
  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <button
      onClick={() => onSelect(medication)}
      className={`p-4 border rounded-lg text-left transition-all hover:shadow-md hover:scale-105 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Pill className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 text-sm">{medication.name}</h3>
        </div>
        {badge && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeClasses()}`}>
            {badge}
          </span>
        )}
      </div>
      {medication.generic_name && (
        <p className="text-xs text-gray-600 mt-1">
          Generic: {medication.generic_name}
        </p>
      )}
      {category && (
        <p className="text-xs text-blue-600 mt-2 font-medium">
          {category}
        </p>
      )}
    </button>
  );
}