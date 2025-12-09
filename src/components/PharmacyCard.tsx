import React, { useState } from 'react';
import { MapPin, Phone, Clock, CheckCircle, XCircle, DollarSign, Flag, MoreHorizontal, Star, Navigation } from 'lucide-react';
import { Pharmacy, Availability } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, formatTimeAgo } from '../utils/formatters';
import { UpdateAvailabilityModal } from './UpdateAvailabilityModal';
import { HelpTooltip } from './HelpTooltip';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  availability: Availability | null;
  medicationId: string;
  onUpdate: () => void;
}

export function PharmacyCard({ pharmacy, availability, medicationId, onUpdate }: PharmacyCardProps) {
  const { user } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleGetDirections = () => {
    const encodedAddress = encodeURIComponent(pharmacy.address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCallPharmacy = () => {
    if (pharmacy.phone) {
      window.location.href = `tel:${pharmacy.phone}`;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{pharmacy.name}</h3>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-1 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-300 hover:text-red-400'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{pharmacy.address}</span>
                <button
                  onClick={handleGetDirections}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  aria-label="Get directions"
                >
                  <Navigation className="h-4 w-4" />
                </button>
              </div>
              
              {pharmacy.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{pharmacy.phone}</span>
                  <button
                    onClick={handleCallPharmacy}
                    className="text-green-600 hover:text-green-700 transition-colors"
                    aria-label="Call pharmacy"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{pharmacy.hours}</span>
                <HelpTooltip content="These are the general operating hours. Call ahead to confirm availability." />
              </div>
            </div>
          </div>

          {availability && (
            <div className="ml-4 text-right">
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                availability.in_stock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {availability.in_stock ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{availability.in_stock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
          )}
        </div>

        {availability && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-lg">{formatPrice(availability.price)}</span>
                {availability.price && (
                  <HelpTooltip content="Price may vary. Contact pharmacy to confirm current pricing." />
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                Updated {formatTimeAgo(availability.last_updated)}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Update Info
            </button>
            
            {pharmacy.phone && (
              <button
                onClick={handleCallPharmacy}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Phone className="h-3 w-3 mr-1" />
                Call
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {availability && user && (
              <button 
                className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                aria-label="Report incorrect information"
              >
                <Flag className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={handleGetDirections}
              className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
              aria-label="Get directions"
            >
              <Navigation className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showUpdateModal && (
        <UpdateAvailabilityModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          pharmacy={pharmacy}
          medicationId={medicationId}
          currentAvailability={availability}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}