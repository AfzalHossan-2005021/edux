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

// Navigation Tabs Component
function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'courses', label: '📚 My Courses', icon: '📚' },
    { id: 'students', label: '👥 Students', icon: '👥' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'discussions', label: '💬 Discussions', icon: '💬' },
    { id: 'exams', label: '✏️ Exams', icon: '✏️' },
    { id: 'revenue', label: '💰 Revenue', icon: '💰' },
    { id: 'profile', label: '👤 Profile', icon: '👤' },
  ];

  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <div className="flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-4 whitespace-nowrap font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Course Details Modal Component
function CourseDetailsModal({ course, isOpen, onClose }) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{course.title || course.NAME}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {course.description || 'No description available'}
            </p>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <p className="text-gray-900">{course.field || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats</label>
              <p className="text-gray-900">{course.seat || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <p className="text-gray-900">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  course.approve_status === 'y' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.approve_status === 'y' ? 'Approved' : 'Pending Approval'}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Students Enrolled</label>
              <p className="text-gray-900">{course.student_count || 0}</p>
            </div>
            {course.rating && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <p className="text-gray-900">⭐ {course.rating.toFixed(1)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <Link
              href={`/user/courses/${course.c_id || course.C_ID}`}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Edit Course
            </Link>
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

// Course Card Component
function CourseCard({ course, onViewDetails, onEditCourse }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{course.title || course.NAME}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {course.description || 'No description'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onViewDetails(course.c_id || course.C_ID, course)}
            className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            View
          </button>
          <button
            onClick={() => onEditCourse(course.c_id || course.C_ID)}
            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded text-sm font-medium hover:bg-gray-200"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ instructor, overview, myCourses, onViewCourse, onEditCourse }) {
  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome, {instructor?.name || 'Instructor'}! 👋</h2>
        <p className="text-blue-100">Here's your teaching dashboard overview</p>
      </div>

      {/* Quick Stats */}
      {overview && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Courses"
              value={overview.totalCourses || 0}
              icon="📚"
              color="blue"
            />
            <StatCard
              title="Total Students"
              value={overview.totalStudents || 0}
              subtitle={`${overview.recentEnrollments || 0} this month`}
              icon="👥"
              color="green"
            />
            <StatCard
              title="Average Rating"
              value={overview.avgRating?.toFixed(1) || '0'}
              subtitle={`${overview.totalReviews || 0} reviews`}
              icon="⭐"
              color="yellow"
            />
            <StatCard
              title="Total Revenue"
              value={`$${overview.totalRevenue?.toFixed(2) || '0'}`}
              icon="💰"
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Recent Courses */}
      {myCourses && myCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Courses</h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/instructor/analytics"
            className="bg-blue-50 hover:bg-blue-100 rounded-lg p-6 border border-blue-200 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-semibold text-gray-900">View Analytics</h4>
            <p className="text-sm text-gray-600 mt-1">Course & student performance</p>
          </Link>
          <Link
            href="/user/create-course"
            className="bg-green-50 hover:bg-green-100 rounded-lg p-6 border border-green-200 transition-colors text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <h4 className="font-semibold text-gray-900">Create Course</h4>
            <p className="text-sm text-gray-600 mt-1">Start a new course</p>
          </Link>
          <Link
            href="#discussions"
            className="bg-purple-50 hover:bg-purple-100 rounded-lg p-6 border border-purple-200 transition-colors text-center"
          >
            <div className="text-3xl mb-2">💬</div>
            <h4 className="font-semibold text-gray-900">Discussions</h4>
            <p className="text-sm text-gray-600 mt-1">Manage forum activity</p>
          </Link>
          <Link
            href="#exams"
            className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-6 border border-yellow-200 transition-colors text-center"
          >
            <div className="text-3xl mb-2">✏️</div>
            <h4 className="font-semibold text-gray-900">Exams</h4>
            <p className="text-sm text-gray-600 mt-1">Create & manage exams</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Courses Tab Component
function CoursesTab({ myCourses, onViewCourse, onEditCourse }) {
  if (!myCourses || myCourses.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
        <p className="text-gray-600 mb-6">Create your first course to get started teaching!</p>
        <Link
          href="/user/create-course"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Create Your First Course
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Courses ({myCourses.length})</h2>
        <Link
          href="/user/create-course"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Create Course
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
    <div className="pb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Students Overview</h2>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Students"
            value={overview.totalStudents || 0}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Active This Month"
            value={overview.recentEnrollments || 0}
            icon="📍"
            color="green"
          />
          <StatCard
            title="Total Enrollments"
            value={overview.totalEnrollments || 0}
            icon="✅"
            color="purple"
          />
          <StatCard
            title="Average Progress"
            value="0%"
            icon="⏳"
            color="yellow"
          />
        </div>
      )}

      {students && students.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Enrollment Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.slice(0, 20).map((student) => (
                <tr key={student.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.courseName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(student.enrollDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {student.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length > 20 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Showing 20 of {students.length} students
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No students enrolled yet</p>
        </div>
      )}
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  return (
    <div className="pb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Analytics Available</h3>
        <p className="text-gray-600 mb-6">View comprehensive course performance, revenue, and engagement metrics.</p>
        <Link
          href="/instructor/analytics"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Go to Analytics Dashboard
        </Link>
      </div>
    </div>
  );
}

// Discussions Tab Component
function DiscussionsTab() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch discussions for instructor's courses
    setLoading(false);
  }, []);

  return (
    <div className="pb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Discussions</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-5xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Discussion Management</h3>
        <p className="text-gray-600 mb-6">
          Monitor and manage student discussions in your courses.
        </p>
        <p className="text-sm text-gray-500">
          Discussion threads will appear here as students interact in your course forums.
        </p>
      </div>
    </div>
  );
}

// Exams Tab Component
function ExamsTab() {
  return (
    <div className="pb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Exams</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-5xl mb-4">✏️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Exam Management</h3>
        <p className="text-gray-600 mb-6">
          Create and manage exams for your courses. Track student performance and results.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Access exam creation tools through individual course settings.
        </p>
        <Link
          href="/user/create-course"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Create Exam
        </Link>
      </div>
    </div>
  );
}

// Revenue Tab Component
function RevenueTab({ overview }) {
  return (
    <div className="pb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Dashboard</h2>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${overview.totalRevenue?.toFixed(2) || '0'}`}
            icon="💰"
            color="purple"
          />
          <StatCard
            title="This Month"
            value="$0"
            subtitle="Coming soon"
            icon="📅"
            color="blue"
          />
          <StatCard
            title="Average per Course"
            value={`$${overview.totalCourses > 0 ? (overview.totalRevenue / overview.totalCourses).toFixed(2) : '0'}`}
            icon="📊"
            color="green"
          />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600 mb-4">
          Detailed revenue analytics including payment history and trends are coming soon.
        </p>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ instructor }) {
  return (
    <div className="pb-8 max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Instructor Profile</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {instructor?.name?.charAt(0) || 'I'}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{instructor?.name}</h3>
            <p className="text-gray-600">{instructor?.subject}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Account Information</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900 font-medium">{instructor?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Specialty:</span>
              <span className="text-gray-900 font-medium">{instructor?.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since:</span>
              <span className="text-gray-900 font-medium">{instructor?.reg_date}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Account Actions</h4>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Profile
            </button>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Change Password
            </button>
            <button className="w-full px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Details Modal */}
      <CourseDetailsModal 
        course={selectedCourse} 
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your courses and student progress</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back</p>
              <p className="font-semibold text-gray-900">{instructor?.name || 'Instructor'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
  );
}
