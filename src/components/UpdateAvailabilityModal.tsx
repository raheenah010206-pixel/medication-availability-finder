import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Pharmacy, Availability } from '../types';
import { AuthModal } from './AuthModal';

interface UpdateAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy;
  medicationId: string;
  currentAvailability: Availability | null;
  onUpdate: () => void;
}

export function UpdateAvailabilityModal({
  isOpen,
  onClose,
  pharmacy,
  medicationId,
  currentAvailability,
  onUpdate
}: UpdateAvailabilityModalProps) {
  const { user } = useAuth();
  const [inStock, setInStock] = useState(currentAvailability?.in_stock ?? false);
  const [price, setPrice] = useState(currentAvailability?.price?.toString() ?? '');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    try {
      const availabilityData = {
        pharmacy_id: pharmacy.id,
        medication_id: medicationId,
        in_stock: inStock,
        price: price ? parseFloat(price) : null,
        last_updated: new Date().toISOString(),
        updated_by: user.id,
      };

      const { error } = await supabase
        .from('availability')
        .upsert(availabilityData, {
          onConflict: 'pharmacy_id,medication_id'
        });

      if (error) {
        console.error('Error updating availability:', error);
        alert('Failed to update availability. Please try again.');
      } else {
        onUpdate();
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Update Availability</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{pharmacy.name}</h3>
            <p className="text-sm text-gray-600">{pharmacy.address}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="stock"
                    checked={inStock}
                    onChange={() => setInStock(true)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">In Stock</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="stock"
                    checked={!inStock}
                    onChange={() => setInStock(false)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm">Out of Stock</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}