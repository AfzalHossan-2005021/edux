/**
 * Instructor Analytics Dashboard Page
 * Comprehensive course performance insights
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  HiChartBar,
  HiUsers,
  HiStar,
  HiCurrencyDollar,
  HiBookOpen,
  HiTrendingUp,
  HiTrendingDown,
  HiAcademicCap,
  HiArrowLeft,
  HiSparkles,
  HiClipboardList,
} from 'react-icons/hi';

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, trendUp }) {
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
        {trend !== undefined && (
          <div className={`mt-3 flex items-center gap-1 text-sm ${trendUp ? 'text-emerald-200' : 'text-red-200'}`}>
            {trendUp ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />}
            {trend}% from last period
          </div>
        )}
      </div>
    </div>
  );
}

// Chart Component (Simple Bar)
function SimpleBarChart({ data, label, valueKey }) {
  if (!data || data.length === 0) {
    return <p className="text-neutral-500 dark:text-neutral-400">No data available</p>;
  }
  
  const maxValue = Math.max(...data.map((d) => d[valueKey]));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-32 text-sm text-neutral-600 dark:text-neutral-400 truncate">{item[label]}</div>
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-16 text-sm text-right font-medium text-neutral-800 dark:text-white">{item[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

// Rating Distribution Component
function RatingDistribution({ distribution }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="flex items-center gap-3">
          <span className="w-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">{rating}</span>
          <HiStar className="w-4 h-4 text-amber-400" />
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: total > 0 ? `${(distribution[rating] / total) * 100}%` : '0%' }}
            />
          </div>
          <span className="w-10 text-sm text-right text-neutral-600 dark:text-neutral-400">{distribution[rating] || 0}</span>
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
          <tr className="text-left text-sm text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
            <th className="pb-4 font-semibold">Student</th>
            <th className="pb-4 font-semibold">Course</th>
            <th className="pb-4 font-semibold">Enrolled</th>
            <th className="pb-4 font-semibold">Progress</th>
            <th className="pb-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={`${student.userId}-${student.courseId}`} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <td className="py-4">
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
              <td className="py-4 text-neutral-600 dark:text-neutral-300">{student.courseName}</td>
              <td className="py-4 text-neutral-600 dark:text-neutral-300">
                {new Date(student.enrollDate).toLocaleDateString()}
              </td>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-indigo-600 h-full rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{student.progress}%</span>
                </div>
              </td>
              <td className="py-4">
                <Badge
                  variant={student.completed ? 'success' : student.progress > 0 ? 'primary' : 'secondary'}
                >
                  {student.completed ? 'Completed' : student.progress > 0 ? 'In Progress' : 'Not Started'}
                </Badge>
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 animate-ping opacity-20" />
          </div>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics Dashboard | EduX</title>
        <meta name="description" content="Comprehensive course performance insights and analytics" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
        {/* Header */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/instructor">
                  <Button variant="ghost" size="sm" className="mr-2">
                    <HiArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white">
                  <HiChartBar className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-white">Analytics Dashboard</h1>
                  <p className="text-neutral-500 dark:text-neutral-400">Track your course performance and engagement</p>
                </div>
              </div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="365d">Last year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Overview Stats */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Courses"
                value={overview.totalCourses}
                icon={HiBookOpen}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              />
              <StatCard
                title="Total Students"
                value={overview.totalStudents}
                subtitle={`+${overview.recentEnrollments} new this month`}
                icon={HiUsers}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              />
              <StatCard
                title="Average Rating"
                value={overview.avgRating.toFixed(1)}
                subtitle={`${overview.totalReviews} reviews`}
                icon={HiStar}
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              />
              <StatCard
                title="Total Revenue"
                value={`$${overview.totalRevenue.toFixed(0)}`}
                icon={HiCurrencyDollar}
                gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              />
            </div>
          )}

          {/* Course Selector */}
          {courses.length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <HiBookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Course Analytics</h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                {courses.map((course) => (
                  <button
                    key={course.C_ID}
                    onClick={() => setSelectedCourse(course.C_ID)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCourse === course.C_ID
                        ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {course.NAME}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Course Details */}
          {courseAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enrollment Stats */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                    <HiUsers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Enrollment Overview</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Enrollments</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{courseAnalytics.enrollments.total}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Completion Rate</p>
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{courseAnalytics.enrollments.completionRate}%</p>
                  </div>
                </div>
              </Card>

              {/* Rating Distribution */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                    <HiStar className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Rating Distribution</h3>
                </div>
                <RatingDistribution distribution={courseAnalytics.ratings.distribution} />
              </Card>

              {/* Exam Performance */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                    <HiClipboardList className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Exam Performance</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-2">
                      <HiChartBar className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 dark:text-white">{courseAnalytics.exams.avgScore}%</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Average Score</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-2">
                      <HiTrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 dark:text-white">{courseAnalytics.exams.maxScore}%</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Highest Score</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-2">
                      <HiUsers className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 dark:text-white">{courseAnalytics.exams.totalAttempts}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Attempts</p>
                  </div>
                </div>
              </Card>

              {/* Top Course */}
              {overview?.topCourse && (
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white">
                      <HiSparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Top Performing Course</h3>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white">
                        <HiAcademicCap className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-neutral-800 dark:text-white text-lg">{overview.topCourse.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">
                        <HiUsers className="w-3 h-3 mr-1" />
                        {overview.topCourse.enrollments} enrollments
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Students Table */}
          {students.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                    <HiUsers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Recent Students</h3>
                </div>
                <Badge variant="secondary">{students.length} total</Badge>
              </div>
              <StudentTable students={students.slice(0, 10)} />
              {students.length > 10 && (
                <p className="text-center text-neutral-500 dark:text-neutral-400 mt-4 text-sm">
                  Showing 10 of {students.length} students
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
