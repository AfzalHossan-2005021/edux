/**
 * Gamification Dashboard Component
 * Displays XP, badges, level, and leaderboard
 */

import { useState, useEffect } from 'react';
import { formatXP, getRankTitle, BadgeTypes } from '../lib/gamification';

// Badge Display Component
function BadgeCard({ badge, earned = false }) {
  return (
    <div
      className={`p-4 rounded-xl text-center transition-all ${
        earned
          ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-amber-300 shadow-md'
          : 'bg-gray-100 opacity-50 grayscale'
      }`}
    >
      <div className="text-4xl mb-2">{badge.icon}</div>
      <h4 className="font-semibold text-gray-800">{badge.name}</h4>
      <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
      <div className="mt-2 text-xs font-medium text-amber-600">
        +{badge.xp} XP
      </div>
      {earned && badge.earnedAt && (
        <div className="mt-1 text-xs text-gray-400">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// Level Progress Bar
function LevelProgress({ level }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Level {level.level}</h3>
          <p className="text-sm text-gray-600">{level.title}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{formatXP(level.currentXP)}</div>
          <div className="text-sm text-gray-500">Total XP</div>
        </div>
      </div>

      <div className="relative">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{ width: `${level.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Level {level.level}</span>
          {!level.isMaxLevel && (
            <span>{level.xpToNextLevel} XP to Level {level.level + 1}</span>
          )}
          {level.isMaxLevel && <span>Max Level!</span>}
        </div>
      </div>
    </div>
  );
}

// Streak Display
function StreakDisplay({ currentStreak, longestStreak }) {
  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-bold flex items-center gap-2">
            <span>🔥</span>
            <span>{currentStreak}</span>
          </div>
          <p className="text-orange-100">Day Streak</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{longestStreak}</div>
          <p className="text-orange-100 text-sm">Longest Streak</p>
        </div>
      </div>
      {currentStreak > 0 && (
        <p className="mt-4 text-sm text-orange-100">
          Keep learning to maintain your streak! 💪
        </p>
      )}
    </div>
  );
}

// Leaderboard Component
function Leaderboard({ data, currentUserId }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <h3 className="font-semibold">🏆 Leaderboard</h3>
      </div>
      <div className="divide-y">
        {data.map((user) => (
          <div
            key={user.uId}
            className={`flex items-center gap-4 p-4 ${
              user.uId === currentUserId ? 'bg-blue-50' : ''
            }`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                user.rank === 1
                  ? 'bg-yellow-400 text-yellow-800'
                  : user.rank === 2
                  ? 'bg-gray-300 text-gray-700'
                  : user.rank === 3
                  ? 'bg-amber-600 text-amber-100'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {user.rank}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">
                Level {user.level?.level || 1} • {user.level?.title || 'Beginner'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-purple-600">{formatXP(user.totalXp || 0)} XP</p>
              <p className="text-xs text-gray-500">{getRankTitle(user.rank)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Gamification Dashboard
export default function GamificationDashboard({ userId }) {
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState({ earned: [], all: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [profileRes, badgesRes, leaderboardRes] = await Promise.all([
        fetch(`/api/gamification?userId=${userId}&action=profile`),
        fetch(`/api/gamification?userId=${userId}&action=badges`),
        fetch(`/api/gamification?action=leaderboard&type=xp&limit=20`),
      ]);

      if (profileRes.ok) setProfile(await profileRes.json());
      if (badgesRes.ok) setBadges(await badgesRes.json());
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {['overview', 'badges', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LevelProgress level={profile.level} />
          <StreakDisplay
            currentStreak={profile.currentStreak}
            longestStreak={profile.longestStreak}
          />

          {/* Quick Stats */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-purple-600">{badges.totalEarned || 0}</div>
              <p className="text-sm text-gray-600">Badges Earned</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-green-600">{profile.level.level}</div>
              <p className="text-sm text-gray-600">Current Level</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600">{profile.currentStreak}</div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>

          {/* Recent XP */}
          {profile.recentXP?.length > 0 && (
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {profile.recentXP.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{item.action.replace(/_/g, ' ')}</span>
                    <span className="text-green-600 font-medium">+{item.amount} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {badges.totalEarned} of {badges.totalAvailable} Badges Earned
            </h3>
          </div>

          {/* Badge Categories */}
          {['milestone', 'achievement', 'streak', 'social'].map((category) => (
            <div key={category} className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">{category} Badges</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.all
                  .filter((b) => b.category === category)
                  .map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} earned={badge.earned} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Leaderboard data={leaderboard} currentUserId={parseInt(userId)} />
      )}
    </div>
  );
}
