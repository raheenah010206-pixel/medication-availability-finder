import React, { useEffect, useState } from 'react';
import { Award, Zap, ThumbsUp, BarChart3 } from 'lucide-react';
import supabase from '../lib/supabase';
import { UserReputation as UserReputationType } from '../types';
import { useAuth } from '../hooks/useAuth';

interface UserReputationProps {
  userId?: string;
  showMyProfile?: boolean;
}

const BADGE_INFO = {
  bronze: {
    icon: '🥉',
    name: 'Bronze',
    color: 'bg-amber-100 text-amber-900',
    requirement: 'Starter contributor',
  },
  silver: {
    icon: '🥈',
    name: 'Silver',
    color: 'bg-gray-100 text-gray-900',
    requirement: '50+ contributions',
  },
  gold: {
    icon: '🥇',
    name: 'Gold',
    color: 'bg-yellow-100 text-yellow-900',
    requirement: '200+ contributions',
  },
  platinum: {
    icon: '💎',
    name: 'Platinum',
    color: 'bg-blue-100 text-blue-900',
    requirement: '500+ contributions',
  },
};

export default function UserReputation({ userId, showMyProfile = false }: UserReputationProps) {
  const { user } = useAuth();
  const [reputation, setReputation] = useState<UserReputationType | null>(null);
  const [loading, setLoading] = useState(true);
  const targetUserId = userId || (showMyProfile ? user?.id : undefined);

  useEffect(() => {
    if (targetUserId) {
      fetchReputation();
    }
  }, [targetUserId]);

  const fetchReputation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setReputation(data);
      } else if (showMyProfile && user) {
        const { data: newRep, error: insertError } = await supabase
          .from('user_reputation')
          .insert({
            user_id: user.id,
            contributions: 0,
            helpful_votes: 0,
            accuracy_score: 100,
            badge_level: 'bronze',
          })
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        setReputation(newRep);
      }
    } catch (error) {
      console.error('Error fetching reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextBadgeProgress = () => {
    if (!reputation) return { current: 0, next: 'silver', progress: 0 };

    const levels = [
      { badge: 'bronze', requirement: 0 },
      { badge: 'silver', requirement: 50 },
      { badge: 'gold', requirement: 200 },
      { badge: 'platinum', requirement: 500 },
    ];

    const current = levels.find(l => l.badge === reputation.badge_level);
    const next = levels.find(l => l.badge !== reputation.badge_level && l.requirement > (current?.requirement || 0));

    if (!next) return { current: 100, next: 'platinum', progress: 100 };

    const progress = Math.min(
      100,
      ((reputation.contributions - (current?.requirement || 0)) /
       (next.requirement - (current?.requirement || 0))) * 100
    );

    return {
      current: reputation.contributions,
      next: next.badge as keyof typeof BADGE_INFO,
      progress: Math.max(0, progress),
    };
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-gray-400">Loading reputation...</div>
        </div>
      </div>
    );
  }

  if (!reputation) {
    return null;
  }

  const badgeProgress = getNextBadgeProgress();
  const currentBadge = BADGE_INFO[reputation.badge_level];
  const nextBadge = BADGE_INFO[badgeProgress.next];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">User Reputation</h3>
            <p className="text-sm text-gray-600">Your community impact score</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">
              <span className="text-blue-600">{reputation.accuracy_score.toFixed(0)}</span>
              <span className="text-xl text-gray-500">/100</span>
            </div>
            <p className="text-xs text-gray-600">Accuracy Score</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-blue-100">
          <div className={`text-4xl ${currentBadge.color} p-3 rounded-lg`}>
            {currentBadge.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{currentBadge.name} Member</p>
            <p className="text-sm text-gray-600">{currentBadge.requirement}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">
              Progress to {nextBadge.name}
            </span>
            <span className="text-gray-600">
              {reputation.contributions} / {badgeProgress.next === 'silver' ? 50 :
                                          badgeProgress.next === 'gold' ? 200 : 500}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${badgeProgress.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Contributions</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{reputation.contributions}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Helpful Votes</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{reputation.helpful_votes}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-500" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Badge Level</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentBadge.name}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-green-500" />
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Accuracy</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{reputation.accuracy_score.toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Badge Levels</h4>
        <div className="space-y-3">
          {Object.entries(BADGE_INFO).map(([key, badge]) => (
            <div
              key={key}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                reputation.badge_level === key
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="text-2xl">{badge.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{badge.name}</p>
                <p className="text-xs text-gray-600">{badge.requirement}</p>
              </div>
              {reputation.badge_level === key && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
