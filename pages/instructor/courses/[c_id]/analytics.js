/**
 * Instructor - Course Analytics
 * URL: /instructor/courses/[c_id]/analytics
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '@/lib/api';
import { withInstructorAuth } from '@/lib/auth/withServerSideAuth';
import { Card, Badge } from '@/components/ui';
import {
  HiArrowLeft,
  HiAcademicCap,
  HiChevronRight,
  HiChartBar,
  HiUsers,
  HiCheckCircle,
  HiClock,
  HiTrendingUp,
  HiTrendingDown,
  HiStar,
  HiEye,
  HiBookOpen,
  HiClipboardCheck,
  HiUserGroup,
} from 'react-icons/hi';

function CourseAnalytics({ serverUser }) {
  const router = useRouter();
  const { c_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalEnrollments: 0,
    activeStudents: 0,
    completionRate: 0,
    averageProgress: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    viewCount: 0,
    recentEnrollments: [],
    topPerformers: [],
    progressDistribution: {
      notStarted: 0,
      inProgress: 0,
      completed: 0,
    },
    engagementMetrics: {
      lecturesViewed: 0,
      examsCompleted: 0,
      averageTimeSpent: 0,
    },
  });

  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  useEffect(() => {
    if (c_id && u_id) {
      loadCourseAndAnalytics();
    }
  }, [c_id, u_id]);

  const loadCourseAndAnalytics = async () => {
    try {
      if (!u_id) {
        router.push('/auth/instructor/login');
        return;
      }

      // Get course info
      const response = await apiPost('/api/instructor_courses', { u_id });
      const data = await response.json();
      const courses = Array.isArray(data) ? data : (data.courses || []);
      const foundCourse = courses.find(c => (c.c_id || c.C_ID) === Number(c_id));
      
      if (foundCourse) {
        setCourse(foundCourse);
        
        // Generate mock analytics data (replace with real API call)
        // TODO: Create actual analytics API endpoint
        const mockAnalytics = generateMockAnalytics(foundCourse);
        setAnalytics(mockAnalytics);
      } else {
        router.push('/instructor');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      router.push('/instructor');
      setLoading(false);
    }
  };

  // Mock data generator - Replace with actual API call
  const generateMockAnalytics = (course) => {
    const enrollments = course.student_count || 0;
    const completionRate = Math.floor(Math.random() * 40) + 45; // 45-85%
    const averageProgress = Math.floor(Math.random() * 30) + 55; // 55-85%
    
    return {
      totalEnrollments: enrollments,
      activeStudents: Math.floor(enrollments * 0.7),
      completionRate,
      averageProgress,
      totalRevenue: enrollments * (course.price || 0),
      averageRating: course.rating || 4.5,
      totalReviews: Math.floor(enrollments * 0.3),
      viewCount: enrollments * 5,
      recentEnrollments: generateRecentEnrollments(5),
      topPerformers: generateTopPerformers(5),
      progressDistribution: {
        notStarted: Math.floor(enrollments * 0.15),
        inProgress: Math.floor(enrollments * 0.60),
        completed: Math.floor(enrollments * 0.25),
      },
      engagementMetrics: {
        lecturesViewed: Math.floor(enrollments * 12),
        examsCompleted: Math.floor(enrollments * 3),
        averageTimeSpent: Math.floor(Math.random() * 120) + 60, // 60-180 minutes
      },
    };
  };

  const generateRecentEnrollments = (count) => {
    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Tom Brown', 'Emily Davis', 'Chris Wilson', 'Lisa Anderson'];
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: names[Math.floor(Math.random() * names.length)],
      email: `student${i + 1}@example.com`,
      enrolledDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      progress: Math.floor(Math.random() * 100),
    }));
  };

  const generateTopPerformers = (count) => {
    const names = ['Alex Thompson', 'Maria Garcia', 'David Lee', 'Sophie Chen', 'James Miller'];
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: names[i % names.length],
      progress: 100 - (i * 5),
      score: 95 - (i * 3),
      completedExams: 5 - i,
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <HiChartBar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mx-auto mb-4">
            <HiAcademicCap className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 text-center mb-2">Course Not Found</h2>
          <p className="text-red-800 dark:text-red-300 text-center">Unable to load analytics data.</p>
        </Card>
      </div>
    );
  }

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend }) => (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-6 text-white shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm font-medium">
              {trend > 0 ? (
                <>
                  <HiTrendingUp className="w-4 h-4" />
                  <span>+{trend}%</span>
                </>
              ) : (
                <>
                  <HiTrendingDown className="w-4 h-4" />
                  <span>{trend}%</span>
                </>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-white/80 font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Analytics - {course.title} | EduX</title>
        <meta name="description" content="Course analytics and performance metrics" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="py-3 flex items-center gap-2 text-sm">
              <Link href="/instructor" className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                Dashboard
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <Link href={`/instructor/courses/${c_id}`} className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                Course
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Analytics</span>
            </div>

            {/* Title Row */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                  <HiChartBar className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    Course Analytics
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {course.title}
                  </p>
                </div>
              </div>

              <Link href={`/instructor/courses/${c_id}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium text-sm shadow-sm hover:shadow-md whitespace-nowrap">
                  <HiArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Key Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <HiChartBar className="w-6 h-6 text-white" />
              </div>
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Enrollments"
                value={analytics.totalEnrollments}
                subtitle={`${analytics.activeStudents} active`}
                icon={HiUsers}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                trend={12}
              />
              <StatCard
                title="Completion Rate"
                value={`${analytics.completionRate}%`}
                subtitle={`${analytics.progressDistribution.completed} completed`}
                icon={HiCheckCircle}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                trend={8}
              />
              <StatCard
                title="Average Progress"
                value={`${analytics.averageProgress}%`}
                subtitle="Student progress"
                icon={HiTrendingUp}
                gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                trend={5}
              />
              <StatCard
                title="Course Rating"
                value={analytics.averageRating.toFixed(1)}
                subtitle={`${analytics.totalReviews} reviews`}
                icon={HiStar}
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              />
            </div>
          </div>

          {/* Engagement Metrics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <HiUserGroup className="w-6 h-6 text-white" />
              </div>
              Engagement Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Lectures Viewed"
                value={analytics.engagementMetrics.lecturesViewed}
                subtitle="Total views"
                icon={HiEye}
                gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
              />
              <StatCard
                title="Exams Completed"
                value={analytics.engagementMetrics.examsCompleted}
                subtitle="Total completions"
                icon={HiClipboardCheck}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard
                title="Avg. Time Spent"
                value={`${analytics.engagementMetrics.averageTimeSpent}m`}
                subtitle="Per student"
                icon={HiClock}
                gradient="bg-gradient-to-br from-orange-500 to-red-600"
              />
            </div>
          </div>

          {/* Progress Distribution */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <HiBookOpen className="w-6 h-6 text-white" />
                </div>
                Student Progress Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Not Started</span>
                    <Badge variant="secondary">{analytics.progressDistribution.notStarted}</Badge>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"
                      style={{ width: `${(analytics.progressDistribution.notStarted / analytics.totalEnrollments) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {((analytics.progressDistribution.notStarted / analytics.totalEnrollments) * 100).toFixed(1)}% of students
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">In Progress</span>
                    <Badge variant="info">{analytics.progressDistribution.inProgress}</Badge>
                  </div>
                  <div className="w-full h-3 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: `${(analytics.progressDistribution.inProgress / analytics.totalEnrollments) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    {((analytics.progressDistribution.inProgress / analytics.totalEnrollments) * 100).toFixed(1)}% of students
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Completed</span>
                    <Badge variant="success">{analytics.progressDistribution.completed}</Badge>
                  </div>
                  <div className="w-full h-3 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      style={{ width: `${(analytics.progressDistribution.completed / analytics.totalEnrollments) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    {((analytics.progressDistribution.completed / analytics.totalEnrollments) * 100).toFixed(1)}% of students
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Enrollments & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Enrollments */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <HiUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Recent Enrollments
                </h3>
                <div className="space-y-3">
                  {analytics.recentEnrollments.map((student) => (
                    <div key={student.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{student.enrolledDate}</p>
                        </div>
                        <Badge variant="info">{student.progress}%</Badge>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Top Performers */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <HiStar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Top Performers
                </h3>
                <div className="space-y-3">
                  {analytics.topPerformers.map((student, index) => (
                    <div key={student.id} className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{student.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.completedExams} exams • Score: {student.score}%
                          </p>
                        </div>
                        <Badge variant="warning">{student.progress}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseAnalytics;

// Server-side authentication
export const getServerSideProps = withInstructorAuth();
