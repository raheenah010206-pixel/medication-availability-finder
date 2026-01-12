import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import supabase from '../lib/supabase';
import { Pharmacy, PharmacyLocation } from '../types';

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  userLocation?: { latitude: number; longitude: number };
}

interface PharmacyWithLocation extends Pharmacy {
  location?: PharmacyLocation;
  distance?: number;
}

export default function PharmacyMap({ pharmacies, userLocation }: PharmacyMapProps) {
  const [pharmaciesWithLocation, setPharmaciesWithLocation] = useState<PharmacyWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithLocation | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchPharmacyLocations();
  }, [pharmacies]);

  const fetchPharmacyLocations = async () => {
    try {
      setLoading(true);
      const pharmacyIds = pharmacies.map(p => p.id);

      const { data, error } = await supabase
        .from('pharmacy_locations')
        .select('*')
        .in('pharmacy_id', pharmacyIds);

      if (error) throw error;

      const locationMap = new Map(data?.map(loc => [loc.pharmacy_id, loc]) || []);

      const enhanced = pharmacies.map(pharmacy => {
        const location = locationMap.get(pharmacy.id);
        let distance: number | undefined;

        if (location && userLocation) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            location.latitude,
            location.longitude
          );
        }

        return { ...pharmacy, location, distance };
      });

      const sorted = enhanced.sort((a, b) => {
        if (a.distance && b.distance) return a.distance - b.distance;
        return 0;
      });

      setPharmaciesWithLocation(sorted);
    } catch (error) {
      console.error('Error fetching pharmacy locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGetDirections = (pharmacy: PharmacyWithLocation) => {
    if (pharmacy.location) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.latitude},${pharmacy.location.longitude}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchPharmacyLocations();
        },
        error => {
          console.error('Error getting location:', error);
          alert('Unable to access your location. Please enable location services.');
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-gray-400">Loading locations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Nearby Pharmacies</h3>
          </div>
          <button
            onClick={handleUseMyLocation}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Use My Location
          </button>
        </div>

        {pharmaciesWithLocation.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No pharmacy locations available yet</p>
        ) : (
          <div className="space-y-3">
            {pharmaciesWithLocation.map((pharmacy, index) => (
              <div
                key={pharmacy.id}
                onClick={() => setSelectedPharmacy(pharmacy)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPharmacy?.id === pharmacy.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold text-gray-700">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pharmacy.address}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {pharmacy.distance && (
                        <span className="text-blue-600 font-medium">
                          {pharmacy.distance.toFixed(1)} miles away
                        </span>
                      )}
                      {pharmacy.phone && (
                        <a
                          href={`tel:${pharmacy.phone}`}
                          className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {pharmacy.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {pharmacy.hours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4" />
                    {pharmacy.hours}
                  </div>
                )}

                {pharmacy.location && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleGetDirections(pharmacy);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Get Directions
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPharmacy && selectedPharmacy.location && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Map View</h4>
          <div className="bg-gray-100 rounded-lg overflow-hidden h-64">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm mb-4">
                  {selectedPharmacy.name}
                </p>
                <button
                  onClick={() => handleGetDirections(selectedPharmacy)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Maps
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            Coordinates: {selectedPharmacy.location.latitude.toFixed(4)}, {selectedPharmacy.location.longitude.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}
