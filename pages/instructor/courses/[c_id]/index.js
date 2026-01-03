/**
 * Instructor - Course Dashboard with Content Management Links
 * URL: /instructor/courses/[c_id]
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '@/lib/api';
import { FaEdit, FaBook, FaClipboardList, FaUsers, FaChartBar } from 'react-icons/fa';

export default function InstructorCourseDashboard() {
  const router = useRouter();
  const { c_id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (c_id) {
      loadCourse();
    }
  }, [c_id]);

  const loadCourse = async () => {
    try {
      const u_id = secureLocalStorage.getItem('u_id');
      const i_id = secureLocalStorage.getItem('i_id');

      if (!i_id) {
        router.push('/login');
        return;
      }

      // Get instructor's courses
      const response = await apiPost('/api/instructor_courses', { u_id });
      const data = await response.json();

      const foundCourse = data.courses?.find(c => c.c_id === Number(c_id));
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        router.push('/instructor/courses');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">{course.description}</p>
            </div>
            <button
              onClick={() => router.push('/instructor/courses')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              ← All Courses
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Manage Content Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
              <FaBook className="text-3xl mb-2" />
              <h2 className="text-2xl font-bold">Manage Content</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Add and organize course topics, lectures, exams, and questions.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li>✓ Create topics and modules</li>
                <li>✓ Add video lectures</li>
                <li>✓ Create exams and questions</li>
                <li>✓ Organize course structure</li>
              </ul>
              <button
                onClick={() => router.push(`/instructor/courses/${c_id}/manage-content`)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Manage Content
              </button>
            </div>
          </div>

          {/* View Structure Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <FaClipboardList className="text-3xl mb-2" />
              <h2 className="text-2xl font-bold">View Structure</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                View complete course structure, topics, lectures, and exams.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li>✓ View all topics</li>
                <li>✓ See lectures and videos</li>
                <li>✓ Review exams and questions</li>
                <li>✓ Course statistics</li>
              </ul>
              <button
                onClick={() => router.push(`/instructor/courses/${c_id}/structure`)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                View Structure
              </button>
            </div>
          </div>

          {/* Course Settings Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <FaEdit className="text-3xl mb-2" />
              <h2 className="text-2xl font-bold">Course Settings</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Update course information and settings.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li>✓ Edit course title</li>
                <li>✓ Update description</li>
                <li>✓ Manage availability</li>
                <li>✓ Set course capacity</li>
              </ul>
              <button
                onClick={() => router.push(`/instructor/courses/${c_id}/edit`)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Edit Course
              </button>
            </div>
          </div>

          {/* Analytics Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <FaChartBar className="text-3xl mb-2" />
              <h2 className="text-2xl font-bold">Analytics</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                View student progress and course analytics.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li>✓ Student enrollment</li>
                <li>✓ Progress tracking</li>
                <li>✓ Completion rates</li>
                <li>✓ Performance metrics</li>
              </ul>
              <button
                onClick={() => router.push(`/instructor/courses/${c_id}/analytics`)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Course Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Field</p>
              <p className="text-lg font-semibold text-gray-900">{course.field || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Students Enrolled</p>
              <p className="text-lg font-semibold text-gray-900">{course.student_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Seats</p>
              <p className="text-lg font-semibold text-gray-900">{course.seat || 'Unlimited'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold">
                <span className={course.approve_status === 'y' ? 'text-green-600' : 'text-yellow-600'}>
                  {course.approve_status === 'y' ? 'Approved' : 'Pending'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
