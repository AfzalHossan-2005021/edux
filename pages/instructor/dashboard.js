/**
 * Comprehensive Instructor Dashboard
 * All available instructor features in one central location
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '../../lib/api';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HiChartBar,
  HiUsers,
  HiStar,
  HiCurrencyDollar,
  HiBookOpen,
  HiTrendingUp,
  HiCheckCircle,
  HiClock,
  HiAcademicCap,
  HiPlus,
  HiPencilAlt,
  HiEye,
  HiChat,
  HiClipboardList,
  HiCog,
  HiUser,
  HiX,
  HiMail,
  HiCalendar,
  HiSparkles,
  HiLightningBolt,
  HiArrowRight,
} from 'react-icons/hi';

import CourseWall_1 from '@/public/CourseWall_1.png';
import CourseWall_2 from '@/public/CourseWall_2.png';
import CourseWall_3 from '@/public/CourseWall_3.png';

// Modern Navigation Tabs Component
function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiChartBar },
    { id: 'courses', label: 'My Courses', icon: HiBookOpen },
    { id: 'students', label: 'Students', icon: HiUsers },
    { id: 'analytics', label: 'Analytics', icon: HiTrendingUp },
    { id: 'discussions', label: 'Discussions', icon: HiChat },
    { id: 'exams', label: 'Exams', icon: HiClipboardList },
    { id: 'revenue', label: 'Revenue', icon: HiCurrencyDollar },
    { id: 'profile', label: 'Profile', icon: HiUser },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap font-medium text-sm rounded-t-xl transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/25'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Modern Course Details Modal Component
function CourseDetailsModal({ course, isOpen, onClose }) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 text-white p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold">{course.title || course.NAME}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Description */}
          <div>
            <h3 className="font-bold text-neutral-800 dark:text-white mb-2 flex items-center gap-2">
              <HiBookOpen className="w-5 h-5 text-primary-500" />
              Description
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {course.description || 'No description available'}
            </p>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
              <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">Category</label>
              <p className="font-medium text-neutral-800 dark:text-white">{course.field || 'Not specified'}</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
              <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">Available Seats</label>
              <p className="font-medium text-neutral-800 dark:text-white">{course.seat || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
              <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">Status</label>
              <Badge variant={course.approve_status === 'y' ? 'success' : 'warning'}>
                {course.approve_status === 'y' ? 'Approved' : 'Pending Approval'}
              </Badge>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
              <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">Students Enrolled</label>
              <p className="font-medium text-neutral-800 dark:text-white flex items-center gap-2">
                <HiUsers className="w-4 h-4 text-primary-500" />
                {course.student_count || 0}
              </p>
            </div>
            {course.rating && (
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 col-span-2">
                <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">Rating</label>
                <p className="font-medium text-neutral-800 dark:text-white flex items-center gap-2">
                  <HiStar className="w-5 h-5 text-amber-500" />
                  {course.rating.toFixed(1)} / 5.0
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Link href={`/user/courses/${course.c_id || course.C_ID}`} className="flex-1">
              <Button variant="primary" className="w-full">
                <HiPencilAlt className="w-4 h-4 mr-2" />
                Edit Course
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-6 text-white shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}


// Stat Card Component
function StatCard({ title, value, subtitle, icon, color = 'blue' }) {
  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    yellow: 'bg-yellow-50',
  }[color];

  const textColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
  }[color];

  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

// Modern Course Card Component
function CourseCard({ course, onViewDetails, onEditCourse }) {
  const images = [CourseWall_1, CourseWall_2, CourseWall_3];
  const image = images[(course.c_id || course.C_ID) % 3];
  
  return (
    <Card hover padding="none" className="group overflow-hidden">
      <div className="relative h-40 overflow-hidden">
        <Image 
          src={image}
          alt={course.title || course.NAME}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {course.rating && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning" className="flex items-center gap-1 shadow-lg">
              <HiStar className="w-3 h-3" />
              {course.rating?.toFixed(1) || '0.0'}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm">
          <HiUsers className="w-4 h-4" />
          <span>{course.student_count || 0} students</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-neutral-800 dark:text-white truncate group-hover:text-primary-600 transition-colors">
          {course.title || course.NAME}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
          {course.description || 'No description available'}
        </p>
        <div className="mt-4 flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(course.c_id || course.C_ID, course)}
          >
            <HiEye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEditCourse(course.c_id || course.C_ID)}
          >
            <HiPencilAlt className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Quick Action Card Component
function QuickActionCard({ href, icon: Icon, title, description, gradient }) {
  return (
    <Link href={href}>
      <div className={`group relative overflow-hidden rounded-2xl ${gradient} p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-lg">{title}</h4>
          <p className="text-sm text-white/80 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}

// Overview Tab Component
function OverviewTab({ instructor, overview, myCourses, onViewCourse, onEditCourse }) {
  const initials = instructor?.name 
    ? instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : 'I';

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl transform -translate-x-16 translate-y-16" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Welcome back, {instructor?.name?.split(' ')[0] || 'Instructor'}!</h2>
                <p className="text-white/80 mt-1 flex items-center gap-2">
                  <HiSparkles className="w-5 h-5" />
                  Here&apos;s your teaching dashboard overview
                </p>
              </div>
            </div>
          </div>
          <Link href="/user/create-course">
            <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-white/90 shadow-xl">
              <HiPlus className="w-5 h-5 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      {overview && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white">
              <HiChartBar className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">Quick Stats</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Courses"
              value={overview.totalCourses || 0}
              icon={HiBookOpen}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
            />
            <StatCard
              title="Total Students"
              value={overview.totalStudents || 0}
              subtitle={`+${overview.recentEnrollments || 0} this month`}
              icon={HiUsers}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Average Rating"
              value={overview.avgRating?.toFixed(1) || '0.0'}
              subtitle={`${overview.totalReviews || 0} reviews`}
              icon={HiStar}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            />
            <StatCard
              title="Total Revenue"
              value={`$${overview.totalRevenue?.toFixed(0) || '0'}`}
              icon={HiCurrencyDollar}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            />
          </div>
        </div>
      )}

      {/* Recent Courses */}
      {myCourses && myCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <HiBookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white">Your Courses</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.slice(0, 6).map((course) => (
              <CourseCard 
                key={course.c_id || course.C_ID} 
                course={course} 
                onViewDetails={onViewCourse}
                onEditCourse={onEditCourse}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
            <HiLightningBolt className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            href="/instructor/analytics"
            icon={HiChartBar}
            title="View Analytics"
            description="Course & student performance"
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <QuickActionCard
            href="/user/create-course"
            icon={HiPlus}
            title="Create Course"
            description="Start a new course"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <QuickActionCard
            href="#discussions"
            icon={HiChat}
            title="Discussions"
            description="Manage forum activity"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <QuickActionCard
            href="#exams"
            icon={HiClipboardList}
            title="Exams"
            description="Create & manage exams"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </div>
      </div>
    </div>
  );
}

// Courses Tab Component
function CoursesTab({ myCourses, onViewCourse, onEditCourse }) {
  if (!myCourses || myCourses.length === 0) {
    return (
      <Card className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 flex items-center justify-center">
          <HiBookOpen className="w-10 h-10 text-primary-500" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">No Courses Yet</h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
          Create your first course to start sharing your knowledge with students worldwide!
        </p>
        <Link href="/user/create-course">
          <Button variant="primary" size="lg">
            <HiPlus className="w-5 h-5 mr-2" />
            Create Your First Course
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white">
            <HiBookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">My Courses</h2>
            <p className="text-neutral-500 dark:text-neutral-400">{myCourses.length} courses published</p>
          </div>
        </div>
        <Link href="/user/create-course">
          <Button variant="primary" size="lg">
            <HiPlus className="w-5 h-5 mr-2" />
            Create New Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.map((course) => (
          <CourseCard
            key={course.c_id || course.C_ID}
            course={course}
            onViewDetails={onViewCourse}
            onEditCourse={onEditCourse}
          />
        ))}
      </div>
    </div>
  );
}

// Students Tab Component
function StudentsTab({ students, overview }) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
          <HiUsers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Students Overview</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Track your student progress and engagement</p>
        </div>
      </div>

      {/* Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={overview.totalStudents || 0} icon={HiUsers} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
          <StatCard title="Active This Month" value={overview.recentEnrollments || 0} icon={HiClock} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <StatCard title="Total Enrollments" value={overview.totalEnrollments || 0} icon={HiCheckCircle} gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
          <StatCard title="Avg Progress" value="0%" icon={HiTrendingUp} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        </div>
      )}

      {/* Students Table */}
      {students && students.length > 0 ? (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Enrolled</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {students.slice(0, 20).map((student) => (
                  <tr key={student.userId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          {student.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 dark:text-white">{student.name}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-neutral-600 dark:text-neutral-300">{student.courseName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-neutral-600 dark:text-neutral-300">
                        {new Date(student.enrollDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full" 
                            style={{ width: `${student.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={student.completed ? 'success' : 'warning'}>
                        {student.completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 20 && (
              <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400">
                Showing 20 of {students.length} students
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
            <HiUsers className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">No Students Yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400">Students who enroll in your courses will appear here</p>
        </Card>
      )}
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  return (
    <div className="space-y-6 pb-8">
      <Card className="text-center py-16">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            <HiChartBar className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <HiSparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">Detailed Analytics</h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">
          View comprehensive course performance, revenue trends, and student engagement metrics.
        </p>
        <Link href="/instructor/analytics">
          <Button variant="primary" size="lg">
            <HiChartBar className="w-5 h-5 mr-2" />
            Go to Analytics Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}

// Discussions Tab Component
function DiscussionsTab() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
          <HiChat className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Course Discussions</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Manage student conversations</p>
        </div>
      </div>

      <Card className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
          <HiChat className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Discussion Management</h3>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          Monitor and manage student discussions in your courses. Discussion threads will appear here as students interact in your course forums.
        </p>
      </Card>
    </div>
  );
}

// Exams Tab Component
function ExamsTab() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
          <HiClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Course Exams</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Create and manage assessments</p>
        </div>
      </div>

      <Card className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
          <HiClipboardList className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Exam Management</h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
          Create and manage exams for your courses. Track student performance and results through individual course settings.
        </p>
        <Link href="/user/create-course">
          <Button variant="primary">
            <HiPlus className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
        </Link>
      </Card>
    </div>
  );
}

// Revenue Tab Component
function RevenueTab({ overview }) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
          <HiCurrencyDollar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Revenue Dashboard</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Track your earnings and financial performance</p>
        </div>
      </div>

      {/* Revenue Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={`$${overview.totalRevenue?.toFixed(0) || '0'}`} 
            icon={HiCurrencyDollar} 
            gradient="bg-gradient-to-br from-purple-500 to-pink-600" 
          />
          <StatCard 
            title="This Month" 
            value="$0" 
            subtitle="Coming soon" 
            icon={HiCalendar} 
            gradient="bg-gradient-to-br from-blue-500 to-cyan-600" 
          />
          <StatCard 
            title="Avg per Course" 
            value={`$${overview.totalCourses > 0 ? (overview.totalRevenue / overview.totalCourses).toFixed(0) : '0'}`} 
            icon={HiChartBar} 
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600" 
          />
        </div>
      )}

      <Card className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
          <HiCurrencyDollar className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Detailed Revenue Analytics</h3>
        <p className="text-neutral-500 dark:text-neutral-400">Coming soon with payment history and advanced financial insights</p>
      </Card>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ instructor }) {
  const initials = instructor?.name 
    ? instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : 'I';

  return (
    <div className="pb-8 max-w-2xl">
      <Card padding="none" className="overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-32 bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
        </div>
        
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="-mt-16 mb-6">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 border-4 border-white dark:border-neutral-900 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {initials}
            </div>
          </div>

          {/* Profile Info */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">{instructor?.name}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-1">
              <HiAcademicCap className="w-5 h-5" />
              {instructor?.subject || 'Instructor'}
            </p>
          </div>

          {/* Account Info */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h4 className="font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
              <HiCog className="w-5 h-5 text-primary-500" />
              Account Information
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <HiMail className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-neutral-600 dark:text-neutral-400">Email</span>
                </div>
                <span className="font-medium text-neutral-800 dark:text-white">{instructor?.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <HiAcademicCap className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-neutral-600 dark:text-neutral-400">Specialty</span>
                </div>
                <span className="font-medium text-neutral-800 dark:text-white">{instructor?.subject}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <HiCalendar className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-neutral-600 dark:text-neutral-400">Member Since</span>
                </div>
                <span className="font-medium text-neutral-800 dark:text-white">{instructor?.reg_date}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Main Dashboard Component
export default function InstructorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [instructor, setInstructor] = useState(null);
  const [overview, setOverview] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const u_id = useMemo(() => secureLocalStorage.getItem('u_id'), []);

  // Handle View Course
  const handleViewCourse = (courseId, course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  // Handle Edit Course
  const handleEditCourse = (courseId) => {
    router.push(`/user/courses/${courseId}`);
  };

  useEffect(() => {
    if (!u_id) {
      router.push('/login');
      return;
    }

    // Fetch instructor info
    apiPost('/api/instructor_info', { u_id })
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0]) {
          setInstructor(data[0]);
          localStorage.setItem('instructor', JSON.stringify({ ...data[0], I_ID: u_id }));
        }
      })
      .catch((error) => console.error('Error fetching instructor info:', error));

    // Fetch instructor courses
    apiPost('/api/instructor_courses', { u_id })
      .then((res) => res.json())
      .then((data) => {
        setMyCourses(data || []);
      })
      .catch((error) => console.error('Error fetching courses:', error));

    // Fetch analytics overview
    fetch(`/api/instructor-analytics?instructorId=${u_id}&action=overview`)
      .then((res) => res.json())
      .then((data) => {
        setOverview(data.overview);
      })
      .catch((error) => console.error('Error fetching analytics:', error));

    // Fetch students
    fetch(`/api/instructor-analytics?instructorId=${u_id}&action=students`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || []);
      })
      .catch((error) => console.error('Error fetching students:', error))
      .finally(() => setLoading(false));
  }, [u_id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 animate-ping opacity-20" />
          </div>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const initials = instructor?.name 
    ? instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : 'I';

  return (
    <>
      <Head>
        <title>Instructor Dashboard | EduX</title>
        <meta name="description" content="Comprehensive instructor dashboard for managing courses and students" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
        {/* Course Details Modal */}
        <CourseDetailsModal 
          course={selectedCourse} 
          isOpen={showCourseModal}
          onClose={() => setShowCourseModal(false)}
        />

        {/* Header */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/25">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-white">Instructor Dashboard</h1>
                  <p className="text-neutral-500 dark:text-neutral-400">Manage your courses and track student progress</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/instructor/analytics">
                  <Button variant="outline" size="sm">
                    <HiChartBar className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/user/create-course">
                  <Button variant="primary" size="sm">
                    <HiPlus className="w-4 h-4 mr-2" />
                    New Course
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <OverviewTab
              instructor={instructor}
              overview={overview}
              myCourses={myCourses}
              onViewCourse={handleViewCourse}
              onEditCourse={handleEditCourse}
            />
          )}
          {activeTab === 'courses' && (
            <CoursesTab 
              myCourses={myCourses}
              onViewCourse={handleViewCourse}
              onEditCourse={handleEditCourse}
            />
          )}
          {activeTab === 'students' && (
            <StudentsTab students={students} overview={overview} />
          )}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'discussions' && <DiscussionsTab />}
          {activeTab === 'exams' && <ExamsTab />}
          {activeTab === 'revenue' && <RevenueTab overview={overview} />}
          {activeTab === 'profile' && <ProfileTab instructor={instructor} />}
        </div>
      </div>
    </>
  );
}
