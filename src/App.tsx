import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MedicationSearch } from './components/MedicationSearch';
import { PharmacyCard } from './components/PharmacyCard';
import { AddPharmacyModal } from './components/AddPharmacyModal';
import { RecentUpdatesModal } from './components/RecentUpdatesModal';
import { PopularMedsModal } from './components/PopularMedsModal';
import { WelcomeGuide } from './components/WelcomeGuide';
import { LoadingSpinner } from './components/LoadingSpinner';
import { EmptyState } from './components/EmptyState';
import { QuickActions } from './components/QuickActions';
import { supabase } from './lib/supabase';
import { Medication, Pharmacy, Availability } from './types';
import { useDebounce } from './hooks/useDebounce';
import { useToast } from './components/Toast';

function App() {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPharmacy, setShowAddPharmacy] = useState(false);
  const [showRecentUpdates, setShowRecentUpdates] = useState(false);
  const [showPopularMeds, setShowPopularMeds] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedMedication) {
      fetchAvailabilities(selectedMedication.id);
    } else {
      setAvailabilities([]);
      setPharmacies([]);
    }
  }, [selectedMedication]);

  useEffect(() => {
    if (debouncedSearch) {
      searchMedication(debouncedSearch);
    }
  }, [debouncedSearch]);

  const searchMedication = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .or(`name.ilike.%${query}%,generic_name.ilike.%${query}%`)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error searching medication:', error);
        showToast('Failed to search medication', 'error');
      } else if (data) {
        await supabase
          .from('medications')
          .update({ search_count: (data.search_count || 0) + 1 })
          .eq('id', data.id);

        setSelectedMedication(data);
        showToast(`Found ${data.name}`, 'success');
      } else {
        showToast('No medication found', 'warning');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('An error occurred while searching', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilities = async (medicationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('availability')
        .select(`
          *,
          pharmacy:pharmacies(*)
        `)
        .eq('medication_id', medicationId)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching availabilities:', error);
        showToast('Failed to load pharmacy data', 'error');
        setAvailabilities([]);
        setPharmacies([]);
      } else {
        setAvailabilities(data || []);
        const uniquePharmacies = Array.from(
          new Map(
            (data || [])
              .map((a: Availability) => a.pharmacy)
              .filter((p): p is Pharmacy => p !== null)
              .map((p) => [p.id, p])
          ).values()
        );
        setPharmacies(uniquePharmacies);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('An error occurred', 'error');
      setAvailabilities([]);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationSelect = (medication: Medication) => {
    setSelectedMedication(medication);
    setSearchQuery('');
  };

  const handleModalMedicationSelect = async (medicationId: string, medicationName: string) => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching medication:', error);
        showToast('Failed to load medication', 'error');
      } else if (data) {
        await supabase
          .from('medications')
          .update({ search_count: (data.search_count || 0) + 1 })
          .eq('id', data.id);

        setSelectedMedication(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('An error occurred', 'error');
    }
  };

  const handlePharmacyAdded = () => {
    showToast('Pharmacy added successfully', 'success');
    if (selectedMedication) {
      fetchAvailabilities(selectedMedication.id);
    }
  };

  const handleAvailabilityUpdate = () => {
    showToast('Availability updated successfully', 'success');
    if (selectedMedication) {
      fetchAvailabilities(selectedMedication.id);
    }
  };

  const getAvailabilityForPharmacy = (pharmacyId: string): Availability | null => {
    return availabilities.find((a) => a.pharmacy_id === pharmacyId) || null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeGuide />

      <Layout onSearch={setSearchQuery} searchQuery={searchQuery}>
        <div className="space-y-8">
          <QuickActions
            onAddPharmacy={() => setShowAddPharmacy(true)}
            onShowNearby={() => showToast('Nearby search coming soon', 'info')}
            onShowRecent={() => setShowRecentUpdates(true)}
            onShowPopular={() => setShowPopularMeds(true)}
          />

          <MedicationSearch
            onMedicationSelect={handleMedicationSelect}
            selectedMedication={selectedMedication}
          />

          {selectedMedication && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Availability for {selectedMedication.name}
                  </h2>
                  {selectedMedication.generic_name && (
                    <p className="text-gray-600 mt-1">
                      Generic: {selectedMedication.generic_name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddPharmacy(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Pharmacy
                </button>
              </div>

              {loading ? (
                <LoadingSpinner text="Loading pharmacy information..." />
              ) : pharmacies.length === 0 ? (
                <EmptyState
                  type="no-pharmacies"
                  onAddPharmacy={() => setShowAddPharmacy(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pharmacies.map((pharmacy) => (
                    <PharmacyCard
                      key={pharmacy.id}
                      pharmacy={pharmacy}
                      availability={getAvailabilityForPharmacy(pharmacy.id)}
                      medicationId={selectedMedication.id}
                      onUpdate={handleAvailabilityUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedMedication && !loading && (
            <EmptyState type="no-medication" />
          )}
        </div>
      </Layout>

      <AddPharmacyModal
        isOpen={showAddPharmacy}
        onClose={() => setShowAddPharmacy(false)}
        onAdd={handlePharmacyAdded}
      />

      <RecentUpdatesModal
        isOpen={showRecentUpdates}
        onClose={() => setShowRecentUpdates(false)}
        onSelectMedication={handleModalMedicationSelect}
      />

      <PopularMedsModal
        isOpen={showPopularMeds}
        onClose={() => setShowPopularMeds(false)}
        onSelectMedication={handleModalMedicationSelect}
      />
    </div>
  );
}

export default App;
