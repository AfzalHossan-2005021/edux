/**
 * Instructor - Course Dashboard with Content Management Links
 * URL: /instructor/courses/[c_id]
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '@/lib/api';
import { withInstructorAuth } from '@/lib/auth/withServerSideAuth';
import { Card } from '@/components/ui';
import {
  HiPencilAlt,
  HiBookOpen,
  HiClipboardList,
  HiChartBar,
  HiArrowLeft,
  HiUsers,
  HiAcademicCap,
  HiCog,
  HiCollection,
  HiCheckCircle,
  HiXCircle,
  HiChevronRight,
} from 'react-icons/hi';

const InstructorCourseDashboard = ({ serverUser }) => {
  const router = useRouter();
  const { c_id } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  useEffect(() => {
    if (c_id && u_id) {
      loadCourse();
    }
  }, [c_id, u_id]);

  const loadCourse = async () => {
    try {
      if (!u_id) {
        router.push('/auth/instructor/login');
        return;
      }

      // Get instructor's courses
      const response = await apiPost('/api/instructor_courses', { u_id });
      const data = await response.json();

      // Handle both response formats: data.courses or data array directly
      const courses = Array.isArray(data) ? data : (data.courses || []);
      const foundCourse = courses.find(c => c.c_id === Number(c_id));
      
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        router.push('/instructor');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      router.push('/instructor');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <HiAcademicCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md backdrop-blur-xl shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mx-auto mb-4">
            <HiXCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 text-center mb-2">Course Not Found</h2>
          <p className="text-red-800 dark:text-red-300 text-center mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/instructor">
            <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{course.title} - Manage Course | EduX</title>
        <meta name="description" content="Manage your course content, settings, and analytics" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="py-3 flex items-center gap-2 text-sm">
              <Link href="/instructor" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Manage Course</span>
            </div>

            {/* Title Row */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                  <HiAcademicCap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {course.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {course.description}
                  </p>
                </div>
              </div>

              <Link href="/instructor">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium text-sm shadow-sm hover:shadow-md whitespace-nowrap">
                  <HiArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Course Info */}
          <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <HiClipboardList className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Information</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Field</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{course.field || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Students</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HiUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
                    {course.student_count || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Seats</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{course.seat || 'Unlimited'}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    {course.approve_status === 'y' ? (
                      <>
                        <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Approved</span>
                      </>
                    ) : (
                      <>
                        <HiXCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Course Settings Card */}
            <Card className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                    <HiPencilAlt className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Course Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Update course information and settings.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      Edit course title
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      Update description
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      Manage availability
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      Set course capacity
                    </li>
                  </ul>
                  <button
                    onClick={() => router.push(`/instructor/courses/${c_id}/edit`)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2"
                  >
                    <HiPencilAlt className="w-5 h-5" />
                    Edit Course
                  </button>
                </div>
              </div>
            </Card>

            {/* Manage Content Card */}
            <Card className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                    <HiBookOpen className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Manage Content</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add and organize course topics, lectures, exams, and questions.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      Create topics and modules
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      Add video lectures
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      Create exams and questions
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      Organize course structure
                    </li>
                  </ul>
                  <button
                    onClick={() => router.push(`/instructor/courses/${c_id}/manage-content`)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
                  >
                    <HiCog className="w-5 h-5" />
                    Manage Content
                  </button>
                </div>
              </div>
            </Card>

            {/* View Structure Card */}
            <Card className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                    <HiCollection className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">View Structure</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    View complete course structure, topics, lectures, and exams.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      View all topics
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      See lectures and videos
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      Review exams and questions
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      Course statistics
                    </li>
                  </ul>
                  <button
                    onClick={() => router.push(`/instructor/courses/${c_id}/structure`)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center gap-2"
                  >
                    <HiCollection className="w-5 h-5" />
                    View Structure
                  </button>
                </div>
              </div>
            </Card>

            {/* Analytics Card */}
            <Card className="group relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                    <HiChartBar className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analytics</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    View student progress and course analytics.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      Student enrollment
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      Progress tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      Completion rates
                    </li>
                    <li className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      Performance metrics
                    </li>
                  </ul>
                  <button
                    onClick={() => router.push(`/instructor/courses/${c_id}/analytics`)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                  >
                    <HiChartBar className="w-5 h-5" />
                    View Analytics
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorCourseDashboard;

// Server-side authentication
export const getServerSideProps = withInstructorAuth();
