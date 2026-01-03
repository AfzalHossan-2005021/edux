/**
 * Explore Courses Page
 * Route: /explore
 * 
 * Modern course catalog with filters, search, and categories
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';
import CourseWall_1 from '../../public/course_wall-1.jpg';
import CourseWall_2 from '../../public/course_wall-2.jpg';
import CourseWall_3 from '../../public/course_wall-3.jpg';
import { apiGet } from '../../lib/api';
import { Card, Button, Badge, Skeleton } from '../../components/ui';
import AnimatedGrid from '../../components/ui/AnimatedGrid';
import {
  HiAcademicCap,
  HiArrowRight,
  HiBookOpen,
  HiFilter,
  HiSearch,
  HiStar,
  HiUsers,
  HiX,
  HiSparkles,
  HiTrendingUp,
  HiCollection,
  HiTag,
  HiSortDescending,
  HiViewGrid,
  HiViewList,
  HiChevronDown,
  HiLightningBolt,
  HiUserGroup,
} from 'react-icons/hi';

// Course Card Component
const CourseCard = ({ course, viewMode = 'grid' }) => {
  const images = [CourseWall_1, CourseWall_2, CourseWall_3];
  const image = images[course.c_id % 3];
  
  if (viewMode === 'list') {
    return (
      <Card hover padding="none" className="group overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
            <Image 
              src={image}
              alt={course.title || 'Course'}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:bg-gradient-to-t md:from-black/50 md:via-transparent md:to-transparent" />
          </div>
          <div className="flex-1 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                {course.field && (
                  <Badge variant="secondary" size="sm" className="mb-2">{course.field}</Badge>
                )}
                <h3 className="text-xl font-bold text-neutral-800 dark:text-white group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
              </div>
              {course.rating && (
                <Badge variant="warning" className="flex items-center gap-1 shadow-sm">
                  <HiStar className="w-4 h-4" />
                  {course.rating}
                </Badge>
              )}
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-4">
              {course.description || 'Explore this course to learn new skills and advance your career.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              {course.name && (
                <div className="flex items-center gap-1">
                  <HiUserGroup className="w-4 h-4" />
                  <span>{course.name}</span>
                </div>
              )}
              {course.student_count && (
                <div className="flex items-center gap-1">
                  <HiUsers className="w-4 h-4" />
                  <span>{course.student_count} students</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Link href={`/courses/${course.c_id}`}>
                <Button variant="primary" size="sm">
                  View Course
                  <HiArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card hover padding="none" className="group overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={image}
          alt={course.title || 'Course'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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
      <div className="p-5 flex-1 flex flex-col">
        {course.field && (
          <Badge variant="secondary" size="sm" className="self-start mb-3">{course.field}</Badge>
        )}
        <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        {course.name && (
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm mt-auto">
            <HiUserGroup className="w-4 h-4" />
            <span>{course.name}</span>
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        <Link href={`/courses/${course.c_id}`} className="block">
          <Button variant="outline" className="w-full group/btn">
            <span>View Course</span>
            <HiArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

// Category Card Component
const CategoryCard = ({ icon: Icon, name, count, gradient, onClick, active }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
      active
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 bg-white dark:bg-neutral-800'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-3`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-neutral-800 dark:text-white">{name}</h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400">{count} courses</p>
  </button>
);

// Empty State Component
const EmptyState = ({ searchQuery, onClear }) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
      <HiSearch className="w-10 h-10 text-neutral-400" />
    </div>
    <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">No courses found</h3>
    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
      {searchQuery
        ? `We couldn't find any courses matching "${searchQuery}". Try a different search term.`
        : 'No courses available in this category. Check back later!'}
    </p>
    {searchQuery && (
      <Button variant="primary" onClick={onClear}>
        <HiX className="w-5 h-5 mr-2" />
        Clear Search
      </Button>
    )}
  </div>
);

export default function ExplorePage() {
  const router = useRouter();
  const { category: urlCategory, search: urlSearch } = router.query;
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || '');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch courses
  useEffect(() => {
    apiGet('/api/all_courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        setLoading(false);
      });
  }, []);

  // Update state from URL params
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlSearch) setSearchQuery(urlSearch);
  }, [urlCategory, urlSearch]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = {};
    courses.forEach((course) => {
      if (course.field) {
        cats[course.field] = (cats[course.field] || 0) + 1;
      }
    });
    return Object.entries(cats).map(([name, count]) => ({ name, count }));
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title?.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.field?.toLowerCase().includes(query) ||
          course.name?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((course) => course.field === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.student_count || 0) - (a.student_count || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.c_id - a.c_id);
        break;
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
    }

    return result;
  }, [courses, searchQuery, selectedCategory, sortBy]);

  // Category gradients
  const getCategoryGradient = (index) => {
    const gradients = [
      'bg-gradient-to-br from-primary-500 to-indigo-600',
      'bg-gradient-to-br from-emerald-500 to-teal-600',
      'bg-gradient-to-br from-amber-500 to-orange-600',
      'bg-gradient-to-br from-violet-500 to-purple-600',
      'bg-gradient-to-br from-rose-500 to-pink-600',
      'bg-gradient-to-br from-cyan-500 to-blue-600',
    ];
    return gradients[index % gradients.length];
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('popular');
  };

  return (
    <>
      <Head>
        <title>Explore Courses | EduX</title>
        <meta name="description" content="Browse our extensive catalog of courses and find the perfect one for your learning journey." />
      </Head>

      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 pt-12 pb-24 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <HiSparkles className="w-5 h-5 text-amber-400" />
                <span className="text-white/90 font-medium">Discover Your Next Skill</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Explore Our Courses
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Browse through {courses.length}+ courses and find the perfect one for your learning journey
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for courses, topics, or instructors..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white placeholder-neutral-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-shadow"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                !selectedCategory
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 bg-white dark:bg-neutral-800'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center mb-3">
                <HiCollection className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-neutral-800 dark:text-white">All</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{courses.length} courses</p>
            </button>
            {categories.slice(0, 5).map((cat, index) => (
              <CategoryCard
                key={cat.name}
                icon={HiBookOpen}
                name={cat.name}
                count={cat.count}
                gradient={getCategoryGradient(index)}
                onClick={() => setSelectedCategory(cat.name === selectedCategory ? '' : cat.name)}
                active={cat.name === selectedCategory}
              />
            ))}
          </div>
        </section>

        {/* Filters & Results */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
                {selectedCategory || 'All Courses'}
              </h2>
              <Badge variant="secondary">{filteredCourses.length} courses</Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="title">A-Z</option>
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <HiViewGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <HiViewList className="w-5 h-5" />
                </button>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <HiX className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchQuery && (
                <Badge variant="primary" className="gap-2">
                  <HiSearch className="w-3 h-3" />
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <HiX className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-2">
                  <HiTag className="w-3 h-3" />
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('')}>
                    <HiX className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Course Grid */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className={viewMode === 'grid' ? 'h-80 rounded-xl' : 'h-40 rounded-xl'} />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            viewMode === 'grid' ? (
              <AnimatedGrid staggerType="wave">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.c_id} course={course} viewMode="grid" />
                ))}
              </AnimatedGrid>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.c_id} course={course} viewMode="list" />
                ))}
              </div>
            )
          ) : (
            <EmptyState searchQuery={searchQuery} onClear={clearFilters} />
          )}
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 border-0" padding="none">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative z-10 p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <HiLightningBolt className="w-5 h-5 text-amber-400" />
                <span className="text-white/90 font-medium">Start Learning Today</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Our course catalog is constantly growing. Request a course topic and we'll consider adding it!
              </p>
              
              <Link href="/">
                <Button size="lg" className="min-w-[200px] bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-neutral-900 font-bold shadow-xl shadow-amber-500/25">
                  <HiArrowRight className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
    </>
  );
}
