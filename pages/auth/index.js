/**
 * Landing page with role selection
 * Users choose their role before logging in
 */

import React from 'react';
import Link from 'next/link';

export default function AuthIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">EduX</h1>
          <p className="text-gray-400 text-lg">Choose your role to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Card */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-indigo-600 transition-colors">
            <div className="text-indigo-600 text-4xl mb-4">👨‍🎓</div>
            <h2 className="text-2xl font-bold text-white mb-2">Student</h2>
            <p className="text-gray-400 mb-6">
              Learn from expert instructors and expand your knowledge
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/student/login"
                className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/student/signup"
                className="block text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-amber-600 transition-colors">
            <div className="text-amber-600 text-4xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold text-white mb-2">Instructor</h2>
            <p className="text-gray-400 mb-6">
              Share your expertise and create amazing courses
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/instructor/login"
                className="block text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/instructor/signup"
                className="block text-center border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-red-600 transition-colors">
            <div className="text-red-600 text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Administrator</h2>
            <p className="text-gray-400 mb-6">
              Manage the platform and ensure quality
            </p>
            <Link
              href="/auth/admin/login"
              className="block text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Already have an account? Choose your role above to log in</p>
        </div>
      </div>
    </div>
  );
}
