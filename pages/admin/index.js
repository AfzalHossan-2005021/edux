/**
 * Admin Dashboard for EduX
 * Analytics and management interface
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Stats Card Component
function StatCard({ title, value, change, changeType, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'up' ? '↑' : '↓'} {change}% from last month
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Chart placeholder
function ChartPlaceholder({ title, height = 'h-64' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className={`${height} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-400">Chart visualization</p>
      </div>
    </div>
  );
}

// Recent Activity Item
function ActivityItem({ action, user, time, type }) {
  const typeColors = {
    enrollment: 'bg-green-100 text-green-700',
    course: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
    user: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className={`w-8 h-8 rounded-full ${typeColors[type]} flex items-center justify-center text-xs font-bold`}>
        {type.charAt(0).toUpperCase()}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm text-gray-800">{action}</p>
        <p className="text-xs text-gray-500">{user}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch admin stats
    async function fetchStats() {
      try {
        // Simulated data - replace with actual API calls
        setStats({
          totalUsers: 1247,
          totalCourses: 86,
          totalEnrollments: 4523,
          totalRevenue: 52840,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const recentActivity = [
    { action: 'New enrollment in React Course', user: 'John Doe', time: '2 min ago', type: 'enrollment' },
    { action: 'Course published: Advanced Python', user: 'Jane Smith', time: '15 min ago', type: 'course' },
    { action: 'New 5-star review', user: 'Mike Johnson', time: '1 hour ago', type: 'review' },
    { action: 'New user registered', user: 'Sarah Wilson', time: '2 hours ago', type: 'user' },
    { action: 'Course updated: Node.js Basics', user: 'Admin', time: '3 hours ago', type: 'course' },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard | EduX</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 text-white p-4 z-50">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-400">EduX</span>
              <span className="ml-2 text-xs bg-blue-500 px-2 py-0.5 rounded">Admin</span>
            </Link>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Link
              href="/"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="mr-3">🏠</span>
              Back to Site
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              change={12}
              changeType="up"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              change={8}
              changeType="up"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <StatCard
              title="Enrollments"
              value={stats.totalEnrollments.toLocaleString()}
              change={23}
              changeType="up"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
            <StatCard
              title="Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              change={5}
              changeType="down"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartPlaceholder title="Enrollment Trends" />
            <ChartPlaceholder title="Revenue Overview" />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div>
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>

            {/* Top Courses */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Courses</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Complete React Course', students: 456, rating: 4.8 },
                  { name: 'Python for Data Science', students: 389, rating: 4.7 },
                  { name: 'Node.js Masterclass', students: 312, rating: 4.9 },
                  { name: 'Machine Learning Basics', students: 287, rating: 4.6 },
                ].map((course, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{course.name}</p>
                        <p className="text-xs text-gray-500">{course.students} students</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
