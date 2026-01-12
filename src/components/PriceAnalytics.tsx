import React, { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import supabase from '../lib/supabase';
import { PriceHistory } from '../types';

interface PriceAnalyticsProps {
  medicationId: string;
  medicationName: string;
}

interface PriceStats {
  current: number;
  average: number;
  lowest: number;
  highest: number;
  trend: 'up' | 'down' | 'stable';
  pricePoints: PriceHistory[];
}

export default function PriceAnalytics({ medicationId, medicationName }: PriceAnalyticsProps) {
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchPriceData();
  }, [medicationId, timeRange]);

  const fetchPriceData = async () => {
    try {
      setLoading(true);

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const { data, error } = await supabase
        .from('price_history')
        .select('*, availability(medication_id)')
        .eq('availability.medication_id', medicationId)
        .gte('recorded_at', dateLimit.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const prices = data.map(h => parseFloat(String(h.price)));
        const currentPrice = prices[prices.length - 1];
        const average = prices.reduce((a, b) => a + b, 0) / prices.length;
        const lowest = Math.min(...prices);
        const highest = Math.max(...prices);

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (prices.length >= 2) {
          const oldPrice = prices[Math.floor(prices.length / 2)];
          if (currentPrice > oldPrice * 1.05) trend = 'up';
          else if (currentPrice < oldPrice * 0.95) trend = 'down';
        }

        setStats({
          current: currentPrice,
          average: Math.round(average * 100) / 100,
          lowest,
          highest,
          trend,
          pricePoints: data as PriceHistory[],
        });
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (!stats) return null;
    if (stats.trend === 'up') {
      return <TrendingUp className="w-5 h-5 text-red-500" />;
    } else if (stats.trend === 'down') {
      return <TrendingDown className="w-5 h-5 text-green-500" />;
    }
    return <div className="w-5 h-5 text-gray-400">—</div>;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-gray-400">Loading price data...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-center text-gray-500">No price history available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Trends</h3>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Current</p>
            <p className="text-2xl font-bold text-blue-900">${stats.current.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Average</p>
            <p className="text-2xl font-bold text-purple-900">${stats.average.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Lowest</p>
            <p className="text-2xl font-bold text-green-900">${stats.lowest.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Highest</p>
            <p className="text-2xl font-bold text-red-900">${stats.highest.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-sm font-medium text-gray-700">
              {stats.trend === 'up' && 'Prices increasing'}
              {stats.trend === 'down' && 'Prices decreasing'}
              {stats.trend === 'stable' && 'Prices stable'}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {stats.pricePoints.length} reports
          </span>
        </div>
      </div>

      {stats.pricePoints.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Recent Price Updates</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.pricePoints.slice().reverse().slice(0, 10).map(point => (
              <div key={point.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-600">
                  {new Date(point.recorded_at).toLocaleDateString()}
                </span>
                <span className="font-medium text-gray-900">${parseFloat(String(point.price)).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
