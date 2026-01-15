/**
 * Student Dashboard Page
 * Route: /student
 * 
 * Modern, attractive student dashboard with courses, progress, and AI features.
 * Only accessible by users with 'student' role.
 */

import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import ProfilePic from '../../public/profile_pic.jpg';
import secureLocalStorage from 'react-secure-storage';
import CourseWall_1 from '../../public/course_wall-1.jpg';
import CourseWall_2 from '../../public/course_wall-2.jpg';
import CourseWall_3 from '../../public/course_wall-3.jpg';
import RateCourse from '@/components/RateCourse';
import { apiGet, apiPost } from '../../lib/api';
import { AIChat, AIRecommendations, LearningAnalytics } from '../../components/ai';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { withStudentAuth } from '../../lib/auth/withServerSideAuth';
import { Card, Button, Badge, Skeleton } from '../../components/ui';
import {
  HiAcademicCap,
  HiArrowRight,
  HiBookOpen,
  HiCalendar,
  HiChartBar,
  HiCheckCircle,
  HiClock,
  HiMail,
  HiPlay,
  HiSparkles,
  HiStar,
  HiTrendingUp,
  HiUser,
  HiUserCircle,
  HiUsers,
  HiChat,
  HiBadgeCheck,
  HiCollection,
} from 'react-icons/hi';

// Modern Progress Bar Component
const ProgressBar = ({ value = 0, showLabel = true, size = 'md' }) => {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className="w-full">
      <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ease-out ${safeValue === 100
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
            : 'bg-gradient-to-r from-primary-500 to-indigo-500'
            }`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Progress</span>
          <span className={`text-xs font-semibold ${safeValue === 100 ? 'text-emerald-600' : 'text-primary-600'}`}>
            {safeValue}%
          </span>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, gradient, trend }) => (
  <Card className="relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-full blur-2xl transform translate-x-6 -translate-y-6 group-hover:opacity-20 transition-opacity`} />
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-800 dark:text-white">{value}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      </div>
    </div>
    {trend && (
      <div className="absolute top-4 right-4">
        <Badge variant="success" size="sm" className="gap-1">
          <HiTrendingUp className="w-3 h-3" />
          {trend}
        </Badge>
      </div>
    )}
  </Card>
);

// Profile Info Row
const ProfileRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <span className="text-neutral-500 dark:text-neutral-400 text-sm">{label}</span>
    </div>
    <span className="font-medium text-neutral-800 dark:text-white">{value || '—'}</span>
  </div>
);

// Course Card Component
const CourseCard = ({ course, type = 'inProgress', onRate }) => {
  const images = [CourseWall_1, CourseWall_2, CourseWall_3];
  const image = images[Math.floor(Math.random() * 3)];

  return (
    <Card hover padding="none" className="group overflow-hidden h-full flex flex-col">
      <div className="relative h-40 overflow-hidden">
        <Image
          src={type === 'completed' ? CourseWall_2 : CourseWall_1}
          alt={course.title || 'Course'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {type === 'completed' ? (
            <Badge variant="success" className="gap-1 shadow-lg">
              <HiCheckCircle className="w-4 h-4" />
              Completed
            </Badge>
          ) : (
            <Badge variant="primary" className="gap-1 shadow-lg">
              <HiPlay className="w-4 h-4" />
              In Progress
            </Badge>
          )}
        </div>

        {/* Course Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
            {course.title}
          </h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {type === 'inProgress' ? (
          <>
            <ProgressBar value={course.progress} size="md" />
            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <HiClock className="w-4 h-4" />
              <span>Continue where you left off</span>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <HiCalendar className="w-4 h-4 text-emerald-500" />
              <span className="text-neutral-600 dark:text-neutral-400">
                Completed: <span className="font-medium text-neutral-800 dark:text-white">{course.completion_date || 'N/A'}</span>
              </span>
            </div>
            {course.grade && (
              <div className="flex items-center gap-2 text-sm">
                <HiStar className="w-4 h-4 text-amber-500" />
                <span className="text-neutral-600 dark:text-neutral-400">
                  Grade: <span className="font-medium text-neutral-800 dark:text-white">{course.grade}</span>
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto py-5 flex gap-3">
          <Link href={`/student/courses/${course.c_id}`} className="flex-1">
            <Button variant="primary" className="w-full group/btn">
              <span>{type === 'completed' ? 'Review' : 'Continue'}</span>
              <HiArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        <RateCourse c_id={course.c_id} />
      </div>
    </Card>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${active
      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
        }`}>
        {count}
      </span>
    )}
  </button>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
      <Icon className="w-10 h-10 text-neutral-400" />
    </div>
    <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">{title}</h3>
    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">{description}</p>
    <Link href="/explore" className="inline-block mt-6">
      <Button variant="primary">
        <HiSparkles className="w-5 h-5 mr-2" />
        Explore Courses
      </Button>
    </Link>
  </div>
);

// Loading Skeleton
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse flex gap-8">
          <div className="w-32 h-32 bg-white/20 rounded-2xl" />
          <div className="flex-1 space-y-4 py-4">
            <div className="h-8 bg-white/20 rounded-lg w-64" />
            <div className="h-4 bg-white/20 rounded w-48" />
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  const [u_id, setUserId] = useState(null);
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [date_of_birthValue, setDate_of_birthValue] = useState("");
  const [genderValue, setGenderValue] = useState("");
  const [course_countValue, setCourse_countValue] = useState("");
  const [reg_dateValue, setReg_dateValue] = useState("");
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('inProgress');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Check authentication and role
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/student/login');
      return;
    }

    if (!loading && user && user.role !== 'student' && !user.isStudent) {
      if (user.role === 'instructor' || user.isInstructor) {
        router.push('/instructor');
      } else if (user.role === 'admin' || user.isAdmin) {
        router.push('/admin');
      }
      return;
    }

    const storedId = user?.u_id || secureLocalStorage.getItem('u_id');
    if (storedId) {
      setUserId(storedId);
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!u_id) return;

    apiGet(`/api/student/get_personal_info?u_id=${user.u_id}`)
      .then((res) => res.json())
      .then((json_res) => {
        if (json_res && json_res[0]) {
          const userInfo = json_res[0];
          setNameValue(userInfo.name || '');
          setEmailValue(userInfo.email || '');
          setDate_of_birthValue(userInfo.date_of_birth || '');
          setGenderValue(userInfo.gender === "M" ? "Male" : userInfo.gender === "F" ? "Female" : "Other");
          setCourse_countValue(userInfo.course_count || 0);
          setReg_dateValue(userInfo.reg_date || '');
        }
      })
      .catch(err => console.error('Error fetching user info:', err));

    apiPost('/api/user_courses', { u_id })
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        throw new Error('Response is not JSON');
      })
      .then((json_res) => {
        if (Array.isArray(json_res)) {
          setInProgressCourses(json_res[0] || []);
          setCompletedCourses(json_res[1] || []);
        }
      })
      .catch(err => console.error('Error fetching courses:', err))
      .finally(() => setIsLoadingCourses(false));
  }, [u_id]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Calculate stats
  const totalProgress = inProgressCourses.length > 0
    ? Math.round(inProgressCourses.reduce((acc, c) => acc + (Number(c.progress) || 0), 0) / inProgressCourses.length)
    : 0;

  return (
    <>
      <Head>
        <title>Student Dashboard | EduX</title>
        <meta name="description" content="Your personalized learning dashboard on EduX" />
      </Head>

      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 pt-12 pb-32 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  <Image
                    src={ProfilePic}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                  <HiCheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Welcome Message */}
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                  <HiSparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-white/80 text-sm font-medium">Welcome back!</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {nameValue || 'Student'}
                </h1>
                <p className="text-white/70 text-lg flex items-center justify-center md:justify-start gap-2">
                  <HiMail className="w-5 h-5" />
                  {emailValue || 'Loading...'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Link href="/explore">
                  <Button size="lg" className="min-w-[200px] bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-neutral-900 font-bold shadow-xl shadow-amber-500/25">
                    <HiBookOpen className="w-5 h-5 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              icon={HiBookOpen}
              value={inProgressCourses.length}
              label="In Progress"
              gradient="bg-gradient-to-br from-primary-500 to-indigo-600"
            />
            <StatCard
              icon={HiCheckCircle}
              value={completedCourses.length}
              label="Completed"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={HiTrendingUp}
              value={`${totalProgress}%`}
              label="Avg Progress"
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            />
            <StatCard
              icon={HiCollection}
              value={course_countValue || 0}
              label="Total Courses"
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                    <HiUserCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Profile Details</h2>
                </div>

                <div className="space-y-1">
                  <ProfileRow icon={HiUser} label="Name" value={nameValue} />
                  <ProfileRow icon={HiMail} label="Email" value={emailValue} />
                  <ProfileRow icon={HiCalendar} label="Date of Birth" value={date_of_birthValue} />
                  <ProfileRow icon={HiUsers} label="Gender" value={genderValue} />
                  <ProfileRow icon={HiAcademicCap} label="Courses Taken" value={course_countValue} />
                  <ProfileRow icon={HiClock} label="Member Since" value={reg_dateValue} />
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Link href="/student/profile">
                    <Button variant="outline" className="w-full">
                      <HiUser className="w-5 h-5 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Courses Section */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex flex-wrap gap-3 mb-8">
                <TabButton
                  active={activeTab === 'inProgress'}
                  onClick={() => setActiveTab('inProgress')}
                  icon={HiPlay}
                  label="In Progress"
                  count={inProgressCourses.length}
                />
                <TabButton
                  active={activeTab === 'completed'}
                  onClick={() => setActiveTab('completed')}
                  icon={HiCheckCircle}
                  label="Completed"
                  count={completedCourses.length}
                />
                <TabButton
                  active={activeTab === 'analytics'}
                  onClick={() => setActiveTab('analytics')}
                  icon={HiChartBar}
                  label="Analytics"
                />
              </div>

              {/* Tab Content */}
              {activeTab === 'inProgress' && (
                <div>
                  {isLoadingCourses ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
                    </div>
                  ) : inProgressCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {inProgressCourses.map((course) => (
                        <CourseCard key={course.c_id} course={course} type="inProgress" />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={HiBookOpen}
                      title="No courses in progress"
                      description="Start your learning journey by exploring our course catalog and enrolling in courses that interest you."
                    />
                  )}
                </div>
              )}

              {activeTab === 'completed' && (
                <div>
                  {isLoadingCourses ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2].map((i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
                    </div>
                  ) : completedCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {completedCourses.map((course) => (
                        <CourseCard key={course.c_id} course={course} type="completed" />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={HiBadgeCheck}
                      title="No completed courses yet"
                      description="Keep learning! Complete your in-progress courses to see them here and earn certificates."
                    />
                  )}
                </div>
              )}

              {activeTab === 'analytics' && u_id && (
                <Card>
                  <LearningAnalytics />
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* AI Recommendations Section */}
        {u_id && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <AIRecommendations limit={4} />
          </section>
        )}

        {/* AI Chat Widget */}
        {showChat && <AIChat onClose={() => setShowChat(false)} />}

        {/* Chat Toggle Button */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transition-all z-40 flex items-center justify-center group"
            aria-label="Open AI Chat"
          >
            <HiChat className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </button>
        )}
      </main>
    </>
  );
};

export default StudentDashboard;

// Server-side authentication for students
export const getServerSideProps = withStudentAuth();
