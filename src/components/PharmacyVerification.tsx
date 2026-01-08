import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PharmacyVerificationProps {
  lastUpdated: string;
  updateCount?: number;
}

export function PharmacyVerification({ lastUpdated, updateCount = 0 }: PharmacyVerificationProps) {
  const lastUpdateDate = new Date(lastUpdated);
  const hoursAgo = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  const getVerificationStatus = () => {
    if (hoursAgo < 1) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Updated now',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        reliability: 'Highly reliable'
      };
    } else if (hoursAgo < 24) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        label: `Updated ${Math.floor(hoursAgo)}h ago`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        reliability: 'Very reliable'
      };
    } else if (daysAgo < 7) {
      return {
        icon: <Clock className="h-4 w-4" />,
        label: `Updated ${daysAgo}d ago`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        reliability: 'Fairly recent'
      };
    } else {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        label: `Updated ${daysAgo}d ago`,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        reliability: 'Outdated - call to confirm'
      };
    }
  };

  const status = getVerificationStatus();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
      <span className={status.color}>{status.icon}</span>
      <div>
        <p className={`text-xs font-medium ${status.color}`}>{status.reliability}</p>
        <p className="text-xs text-gray-600">{status.label}</p>
      </div>
    </div>
  );
}

export function getPharmacyTrustScore(
  lastUpdated: string,
  availabilityCount: number,
  recentUpdatesCount: number
): number {
  const lastUpdateDate = new Date(lastUpdated);
  const hoursAgo = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60);

  let score = 50;

  if (hoursAgo < 1) score += 40;
  else if (hoursAgo < 24) score += 30;
  else if (hoursAgo < 72) score += 15;
  else if (hoursAgo < 168) score += 5;

  score += Math.min(availabilityCount * 5, 30);
  score += Math.min(recentUpdatesCount * 2, 15);

  return Math.min(score, 100);
}
