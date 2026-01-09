/**
 * EduX Home Page
 * Modern, attractive landing page with consistent project UI
 */

import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import WallPic from '../public/edux_wall.png';
import CourseWall_1 from '../public/course_wall-1.jpg';
import CourseWall_2 from '../public/course_wall-2.jpg';
import CourseWall_3 from '../public/course_wall-3.jpg';
import secureLocalStorage from 'react-secure-storage';
import { apiGet, apiPost } from '../lib/api';
import { AISearch, AIRecommendations } from '../components/ai';
import { Button, Card, Badge, Skeleton } from '../components/ui';
import AnimatedGrid from '../components/ui/AnimatedGrid';
import GamificationDashboard from '../components/GamificationDashboard';
import {
  HiAcademicCap,
  HiLightningBolt,
  HiGlobe,
  HiUserGroup,
  HiStar,
  HiTrendingUp,
  HiSparkles,
  HiPlay,
  HiArrowRight,
  HiCheckCircle,
  HiBadgeCheck,
  HiChartBar,
  HiBookOpen,
  HiUsers,
} from 'react-icons/hi';

// Floating Animation Particles
const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Only generate particles on client side to avoid hydration mismatch
    setParticles(
      [...Array(20)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// Stats Counter Component
const StatCard = ({ icon: Icon, value, label, gradient }) => (
  <div className="text-center group">
    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white mb-1">
      {value}
    </div>
    <div className="text-neutral-600 dark:text-neutral-400 font-medium">{label}</div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
  <Card hover className="group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity`} />
    <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-3">{title}</h3>
    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
  </Card>
);

// Course Card Component
const CourseCard = ({ course, imageIndex = 1 }) => {
  const images = [CourseWall_1, CourseWall_2, CourseWall_3];
  const image = images[(imageIndex - 1) % 3];

  return (
    <Card hover padding="none" className="group overflow-hidden h-full">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={course.title || 'Course'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {course.rating && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning" className="flex items-center gap-1 shadow-lg">
              <HiStar className="w-4 h-4" />
              {course.rating}
            </Badge>
          </div>
        )}
        {course.student_count && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm">
            <HiUsers className="w-4 h-4" />
            <span>{course.student_count} students</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        {course.name && (
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm">
            <HiUserGroup className="w-4 h-4" />
            <span>{course.name}</span>
          </div>
        )}
        {course.field && (
          <div className="mt-3">
            <Badge variant="secondary" size="sm">{course.field}</Badge>
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:gap-3 transition-all">
          <span>View Course</span>
          <HiArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle, gradient }) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${gradient || 'bg-gradient-to-br from-primary-500 to-primary-600'} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-white">{title}</h2>
    </div>
    {subtitle && (
      <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">{subtitle}</p>
    )}
  </div>
);

export default function Home() {
  const s_id = secureLocalStorage.getItem('u_id');
  const [courseSuggestion, setCourseSuggestion] = useState([]);
  const [PopularCourses, setPopularCourses] = useState([]);
  const [TopRatedCourses, setTopRatedCourses] = useState([]);
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
  const [hasMorePopular, setHasMorePopular] = useState(true);
  const [hasMoreTopRated, setHasMoreTopRated] = useState(true);
  const [pageSuggestions, setPageSuggestions] = useState(1);
  const [pagePopular, setPagePopular] = useState(1);
  const [pageTopRated, setPageTopRated] = useState(1);

  useEffect(() => {
    if (secureLocalStorage.getItem('u_id')) {
      setisLoggedIn(true);
      apiPost('/api/course_suggestion', { s_id })
        .then((res) => res.json())
        .then((json_res) => {
          setCourseSuggestion(json_res);
          setLoadingSuggestions(false);
        });
    } else {
      setLoadingSuggestions(false);
    }
    apiGet('/api/top_rated_courses')
      .then((a) => a.json())
      .then((parsed) => {
        setTopRatedCourses(parsed);
        setLoadingTopRated(false);
      });
    apiGet('/api/popular_courses')
      .then((a) => a.json())
      .then((parsed) => {
        setPopularCourses(parsed);
        setLoadingPopular(false);
      });
  }, []);

  const loadMoreCourses = async (type) => {
    if (loadingMore) return;

    setLoadingMore(true);
    let newPage;
    let apiEndpoint;
    let setter;
    let hasMoreSetter;

    switch (type) {
      case 'suggestions':
        newPage = pageSuggestions + 1;
        apiEndpoint = `/api/course_suggestion?page=${newPage}`;
        setter = setCourseSuggestion;
        hasMoreSetter = setHasMoreSuggestions;
        break;
      case 'popular':
        newPage = pagePopular + 1;
        apiEndpoint = `/api/popular_courses?page=${newPage}`;
        setter = setPopularCourses;
        hasMoreSetter = setHasMorePopular;
        break;
      case 'topRated':
        newPage = pageTopRated + 1;
        apiEndpoint = `/api/top_rated_courses?page=${newPage}`;
        setter = setTopRatedCourses;
        hasMoreSetter = setHasMoreTopRated;
        break;
      default:
        setLoadingMore(false);
        return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'suggestions' ? { s_id } : {}),
        credentials: 'include',
      });

      if (response.ok) {
        const newCourses = await response.json();
        if (newCourses.length > 0) {
          setter((prev) => [...prev, ...newCourses]);
          switch (type) {
            case 'suggestions':
              setPageSuggestions(newPage);
              break;
            case 'popular':
              setPagePopular(newPage);
              break;
            case 'topRated':
              setPageTopRated(newPage);
              break;
          }
        } else {
          hasMoreSetter(false);
        }
      }
    } catch (error) {
      console.error('Error loading more courses:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <Head>
        <title>EduX - Unlock Your Potential | Online Learning Platform</title>
        <meta name="description" content="Discover limitless learning with EduX - your gateway to knowledge, anytime, anywhere. Explore courses, earn certificates, and advance your career." />
      </Head>

      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden" data-testid="hero-section">
          {/* Background */}
          <div className="absolute inset-0">
            <Image
              src={WallPic}
              alt="EduX platform"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/95 via-primary-800/90 to-indigo-900/95" />
            <FloatingParticles />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
                <HiSparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="text-white/90 font-medium">Trusted by 50,000+ learners worldwide</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Unlock Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400">
                  Potential
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                Discover limitless learning with EduX - your gateway to knowledge, anytime, anywhere.
                Master new skills, earn certificates, and transform your career.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={isLoggedIn ? "/student" : "/signup"}>
                  <Button size="lg" className="min-w-[200px] bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-neutral-900 font-bold shadow-xl shadow-amber-500/25">
                    <HiPlay className="w-5 h-5 mr-2" />
                    {isLoggedIn ? 'My Dashboard' : 'Start Learning Free'}
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" className="min-w-[200px] bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-xl shadow-pink-500/30">
                    <HiBookOpen className="w-5 h-5 mr-2" />
                    Explore Courses
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/70">
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Free Courses Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Verified Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Expert Instructors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                className="fill-neutral-50 dark:fill-neutral-900" />
            </svg>
          </div>
        </section>

        {/* AI Search Section */}
        <section className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <Card className="shadow-2xl border-0">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
                What do you want to learn today?
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Use our AI-powered search to find the perfect course for you
              </p>
            </div>
            <AISearch onResults={(results) => setSearchResults(results)} />
          </Card>
        </section>

        {/* Search Results */}
        {searchResults && searchResults.results && searchResults.results.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <SectionHeader
                icon={HiSparkles}
                title={`Search Results (${searchResults.results.length})`}
                gradient="bg-gradient-to-br from-primary-500 to-indigo-600"
              />
              <Button
                variant="ghost"
                onClick={() => setSearchResults(null)}
                className="text-neutral-600 hover:text-primary-600"
              >
                Clear Results
              </Button>
            </div>
            <AnimatedGrid>
              {searchResults.results.map((course, id) => (
                <Link key={id} href={`/courses/${course.id}`}>
                  <Card hover className="cursor-pointer h-full">
                    <div className="h-40 bg-gradient-to-br from-primary-400 to-indigo-500 rounded-t-xl flex items-center justify-center">
                      <HiAcademicCap className="w-16 h-16 text-white/50" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-3">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {course.category && (
                          <Badge variant="secondary" size="sm">{course.category}</Badge>
                        )}
                        {course.rating && (
                          <Badge variant="warning" size="sm" className="flex items-center gap-1">
                            <HiStar className="w-3 h-3" />
                            {course.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </AnimatedGrid>
          </section>
        )}

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon={HiAcademicCap} value="500+" label="Courses" gradient="bg-gradient-to-br from-primary-500 to-primary-600" />
            <StatCard icon={HiUserGroup} value="50K+" label="Students" gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
            <StatCard icon={HiBadgeCheck} value="10K+" label="Certificates" gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
            <StatCard icon={HiStar} value="4.9" label="Avg Rating" gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-4">Why Choose EduX</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white mb-4">
              Transform Your Learning Experience
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              EduX provides everything you need to succeed in your learning journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={HiLightningBolt}
              title="Learn at Your Pace"
              description="Access courses anytime, anywhere. Learn on your schedule with lifetime access to all content."
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={HiAcademicCap}
              title="Expert Instructors"
              description="Learn from industry professionals and thought leaders with real-world experience."
              gradient="bg-gradient-to-br from-primary-500 to-indigo-600"
            />
            <FeatureCard
              icon={HiBadgeCheck}
              title="Verified Certificates"
              description="Earn recognized certificates to showcase your achievements to employers."
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <FeatureCard
              icon={HiChartBar}
              title="Track Progress"
              description="Monitor your learning journey with detailed analytics and progress tracking."
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <FeatureCard
              icon={HiGlobe}
              title="Global Community"
              description="Join a worldwide community of learners and expand your professional network."
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            />
            <FeatureCard
              icon={HiSparkles}
              title="AI-Powered Learning"
              description="Get personalized course recommendations based on your interests and goals."
              gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
            />
          </div>
        </section>

        {/* AI Recommendations for logged-in users */}
        {isLoggedIn && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <AIRecommendations limit={4} />
          </section>
        )}

        {/* Gamification Dashboard for logged-in users */}
        {isLoggedIn && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <GamificationDashboard />
          </section>
        )}

        {/* Instructor Suggestions */}
        {isLoggedIn && courseSuggestion.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <SectionHeader
              icon={HiSparkles}
              title="Suggestions From Your Instructors"
              subtitle="Courses handpicked by your instructors based on your learning path"
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
            <AnimatedGrid staggerType="wave" data-testid="suggestions-grid">
              {loadingSuggestions
                ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)
                : courseSuggestion.map((course, id) => (
                  <Link key={id} href={`/courses/${course.c_id}`}>
                    <CourseCard course={course} imageIndex={1} />
                  </Link>
                ))}
            </AnimatedGrid>
            {hasMoreSuggestions && !loadingSuggestions && (
              <div className="text-center mt-10">
                <Button
                  variant="outline"
                  onClick={() => loadMoreCourses('suggestions')}
                  disabled={loadingMore}
                  loading={loadingMore}
                >
                  Load More Suggestions
                  <HiArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Top Rated Courses */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeader
            icon={HiStar}
            title="Top Rated Courses"
            subtitle="Highest-rated courses by our community of learners"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <AnimatedGrid staggerType="wave" data-testid="popular-courses-grid">
            {loadingTopRated
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)
              : TopRatedCourses.map((course, id) => (
                <Link key={id} href={`/courses/${course.c_id}`}>
                  <CourseCard course={course} imageIndex={2} />
                </Link>
              ))}
          </AnimatedGrid>
          {hasMoreTopRated && !loadingTopRated && (
            <div className="text-center mt-10">
              <Button
                variant="outline"
                onClick={() => loadMoreCourses('topRated')}
                disabled={loadingMore}
                loading={loadingMore}
              >
                Load More Top Rated
                <HiArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </section>

        {/* Most Popular Courses */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeader
            icon={HiTrendingUp}
            title="Most Popular Courses"
            subtitle="Join thousands of learners in our most enrolled courses"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <AnimatedGrid staggerType="wave">
            {loadingPopular
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)
              : PopularCourses.map((course, id) => (
                <Link key={id} href={`/courses/${course.c_id}`}>
                  <CourseCard course={course} imageIndex={3} />
                </Link>
              ))}
          </AnimatedGrid>
          {hasMorePopular && !loadingPopular && (
            <div className="text-center mt-10">
              <Button
                variant="outline"
                onClick={() => loadMoreCourses('popular')}
                disabled={loadingMore}
                loading={loadingMore}
              >
                Load More Popular
                <HiArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 border-0" padding="none">
            {/* Background Decoration */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10 p-8 md:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <HiSparkles className="w-5 h-5 text-amber-400" />
                <span className="text-white/90 font-medium">Start Your Journey Today</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
                Join thousands of learners who have already started their journey with EduX.
                Get access to world-class courses and expert instructors.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={isLoggedIn ? "/explore" : "/signup"}>
                  <Button size="lg" className="min-w-[200px] bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-neutral-900 font-bold shadow-xl shadow-amber-500/25">
                    <HiArrowRight className="w-5 h-5 mr-2" />
                    {isLoggedIn ? 'Browse All Courses' : 'Get Started Free'}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
