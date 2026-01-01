/**
 * Instructor Analytics Dashboard Page
 * Comprehensive course performance insights
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Stat Card Component
function StatCard({ title, value, subtitle, icon, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}% from last period
        </div>
      )}
    </div>
  );
}

// Chart Component (Simple Bar)
function SimpleBarChart({ data, label, valueKey }) {
  if (!data || data.length === 0) return <p className="text-gray-500">No data available</p>;
  
  const maxValue = Math.max(...data.map((d) => d[valueKey]));

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-32 text-sm text-gray-600 truncate">{item[label]}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-16 text-sm text-right font-medium">{item[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

// Rating Distribution Component
function RatingDistribution({ distribution }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="flex items-center gap-2">
          <span className="w-3 text-sm">{rating}</span>
          <span className="text-yellow-400">★</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: total > 0 ? `${(distribution[rating] / total) * 100}%` : '0%' }}
            />
          </div>
          <span className="w-8 text-sm text-right text-gray-600">{distribution[rating] || 0}</span>
        </div>
      ))}
    </div>
  );
}

// Student Progress Table
function StudentTable({ students }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b">
            <th className="pb-3">Student</th>
            <th className="pb-3">Course</th>
            <th className="pb-3">Enrolled</th>
            <th className="pb-3">Progress</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={`${student.userId}-${student.courseId}`} className="border-b last:border-0">
              <td className="py-3">
                <div>
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </td>
              <td className="py-3 text-gray-600">{student.courseName}</td>
              <td className="py-3 text-gray-600">
                {new Date(student.enrollDate).toLocaleDateString()}
              </td>
              <td className="py-3">
                <div className="w-24 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{student.progress}%</span>
              </td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.completed
                      ? 'bg-green-100 text-green-700'
                      : student.progress > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {student.completed ? 'Completed' : student.progress > 0 ? 'In Progress' : 'Not Started'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InstructorAnalytics() {
  const router = useRouter();
  const [instructor, setInstructor] = useState(null);
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const instructorData = localStorage.getItem('instructor');
    if (instructorData) {
      setInstructor(JSON.parse(instructorData));
    } else {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (instructor?.I_ID) {
      fetchOverview();
      fetchCourses();
      fetchStudents();
    }
  }, [instructor, period]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseAnalytics(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchOverview = async () => {
    try {
      const response = await fetch(`/api/instructor-analytics?instructorId=${instructor.I_ID}&action=overview`);
      if (response.ok) {
        const data = await response.json();
        setOverview(data.overview);
      }
    } catch (error) {
      console.error('Failed to fetch overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/instructor_courses?i_id=${instructor.I_ID}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        if (data.length > 0 && !selectedCourse) {
          setSelectedCourse(data[0].C_ID);
        }
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchCourseAnalytics = async (courseId) => {
    try {
      const response = await fetch(
        `/api/instructor-analytics?instructorId=${instructor.I_ID}&action=course&courseId=${courseId}`
      );
      if (response.ok) {
        const data = await response.json();
        setCourseAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `/api/instructor-analytics?instructorId=${instructor.I_ID}&action=students`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📊 Analytics Dashboard</h1>
              <p className="text-gray-600">Track your course performance</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Courses"
              value={overview.totalCourses}
              icon="📚"
            />
            <StatCard
              title="Total Students"
              value={overview.totalStudents}
              subtitle={`${overview.recentEnrollments} new this month`}
              icon="👥"
            />
            <StatCard
              title="Average Rating"
              value={overview.avgRating.toFixed(1)}
              subtitle={`${overview.totalReviews} reviews`}
              icon="⭐"
            />
            <StatCard
              title="Total Revenue"
              value={`$${overview.totalRevenue.toFixed(2)}`}
              icon="💰"
            />
          </div>
        )}

        {/* Course Selector */}
        {courses.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Course Analytics</h2>
            <div className="flex gap-2 flex-wrap">
              {courses.map((course) => (
                <button
                  key={course.C_ID}
                  onClick={() => setSelectedCourse(course.C_ID)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedCourse === course.C_ID
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {course.NAME}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Course Details */}
        {courseAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Enrollment Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Enrollment Overview</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-blue-700">{courseAnalytics.enrollments.total}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-700">{courseAnalytics.enrollments.completionRate}%</p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Rating Distribution</h3>
              <RatingDistribution distribution={courseAnalytics.ratings.distribution} />
            </div>

            {/* Exam Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Exam Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{courseAnalytics.exams.avgScore}%</p>
                  <p className="text-sm text-gray-500">Average Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{courseAnalytics.exams.maxScore}%</p>
                  <p className="text-sm text-gray-500">Highest Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{courseAnalytics.exams.totalAttempts}</p>
                  <p className="text-sm text-gray-500">Total Attempts</p>
                </div>
              </div>
            </div>

            {/* Top Course */}
            {overview?.topCourse && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">🏆 Top Performing Course</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-800">{overview.topCourse.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {overview.topCourse.enrollments} enrollments
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Students Table */}
        {students.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Students</h3>
            <StudentTable students={students.slice(0, 10)} />
            {students.length > 10 && (
              <p className="text-center text-gray-500 mt-4">
                Showing 10 of {students.length} students
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
