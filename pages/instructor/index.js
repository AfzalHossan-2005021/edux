/**
 * Instructor Dashboard - Modern Comprehensive Management System
 * Unified interface for all instructor features
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import secureLocalStorage from 'react-secure-storage';
import { apiPost } from '../../lib/api';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { withInstructorAuth } from '../../lib/auth/withServerSideAuth';
import { Card, Button, Badge } from '../../components/ui';
import {
  HiAcademicCap,
  HiChartBar,
  HiUsers,
  HiCurrencyDollar,
  HiStar,
  HiBookOpen,
  HiPlus,
  HiArrowRight,
  HiSparkles,
  HiTrendingUp,
  HiUserGroup,
  HiCog,
  HiChat,
  HiPencilAlt,
  HiEye,
  HiCollection,
  HiClock,
  HiCheckCircle,
  HiBadgeCheck,
  HiLightningBolt,
  HiChevronRight,
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiUser,
  HiMail,
  HiCalendar,
  HiGlobe,
  HiClipboardList
} from 'react-icons/hi';

import CourseWall_1 from '../../public/course_wall-1.jpg';
import CourseWall_2 from '../../public/course_wall-2.jpg';
import CourseWall_3 from '../../public/course_wall-3.jpg';

const Instructor = ({ serverUser }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [instructor, setInstructor] = useState(null);
  const [overview, setOverview] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  // Get initials for avatar
  const initials = instructor?.name 
    ? instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : 'I';

  useEffect(() => {
    if (!u_id) {
      router.push('/auth/instructor/login');
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

  // Navigation Tabs Component
  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiChartBar },
    { id: 'courses', label: 'My Courses', icon: HiBookOpen },
    { id: 'students', label: 'Students', icon: HiUsers },
    { id: 'analytics', label: 'Analytics', icon: HiTrendingUp },
    { id: 'revenue', label: 'Revenue', icon: HiCurrencyDollar },
    { id: 'profile', label: 'Profile', icon: HiUser },
  ];

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, icon: Icon, gradient }) => (
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

  // Course Card Component
  const CourseCard = ({ course }) => {
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
            <Link href={`/courses/${course.c_id || course.C_ID}`} className="flex-1">
              <Button variant="primary" size="sm" className="w-full">
                <HiEye className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
            <Link href={`/user/courses/${course.c_id || course.C_ID}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <HiPencilAlt className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  };

  // Quick Action Card Component
  const QuickActionCard = ({ href, icon: Icon, title, description, gradient }) => (
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

  // Tab Content Components
  const OverviewTab = () => (
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

      {/* Your Courses */}
      {myCourses && myCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <HiBookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white">Your Courses</h3>
            </div>
            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveTab('courses'); }}>
              <Button variant="ghost" size="sm">
                View All <HiArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.slice(0, 6).map((course) => (
              <CourseCard key={course.c_id || course.C_ID} course={course} />
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
            title="Analytics"
            description="View course performance"
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
            href="#"
            icon={HiChat}
            title="Discussions"
            description="Forum activity"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <QuickActionCard
            href="#"
            icon={HiClipboardList}
            title="Exams"
            description="Create & manage"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </div>
      </div>
    </div>
  );

  const CoursesTab = () => (
    <div className="space-y-6 pb-8">
      {/* Header */}
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

      {myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <CourseCard key={course.c_id || course.C_ID} course={course} />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );

  const StudentsTab = () => (
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

  const AnalyticsTab = () => (
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

  const RevenueTab = () => (
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
        <p className="text-neutral-500 dark:text-neutral-400">Coming soon with advanced financial insights</p>
      </Card>
    </div>
  );

  const ProfileTab = () => (
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

  return (
    <>
      <Head>
        <title>Instructor Dashboard | EduX</title>
        <meta name="description" content="Manage your courses, track student progress, and view analytics" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'students' && <StudentsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
      </div>
    </>
  );
};

export default Instructor;

// Server-side authentication
export const getServerSideProps = withInstructorAuth();