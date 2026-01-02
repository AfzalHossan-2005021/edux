import Link from 'next/link';
import Image from 'next/image'
import WallPic from '../public/edux_wall.png'
import React, { useEffect, useState } from 'react';
//import WallPic from '../public/edux_wall.png'
import CourseWall_1 from '../public/course_wall-1.jpg'
import CourseWall_2 from '../public/course_wall-2.jpg'
import CourseWall_3 from '../public/course_wall-3.jpg'
import secureLocalStorage from 'react-secure-storage';
import { apiGet, apiPost } from '../lib/api';
import { AISearch, AIRecommendations } from '../components/ai';
import { Button, Card } from '../components/ui';
import AnimatedGrid from '../components/ui/AnimatedGrid';
import { Skeleton } from '../components/ui';
import GamificationDashboard from '../components/GamificationDashboard';


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
    };
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
          setter(prev => [...prev, ...newCourses]);
          switch (type) {
            case 'suggestions': setPageSuggestions(newPage); break;
            case 'popular': setPagePopular(newPage); break;
            case 'topRated': setPageTopRated(newPage); break;
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
    <main>
      <div className='bg-neutral-50 min-h-screen'>
        <section className="text-neutral-600 relative" data-testid="hero-section">
          <div className="relative">
            <Image src={WallPic} alt='EduX platform' priority={true} style={{ width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '20rem' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-secondary-900/60"></div>
            <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white max-w-4xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg leading-tight">
                  Unlock Your Potential
                </h1>
                <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md leading-relaxed">
                  Discover limitless learning with EduX - your gateway to knowledge, anytime, anywhere.
                </p>
              </div>
            </div>
          </div>
          
          {/* AI-Powered Search */}
          <div className="container px-5 py-8 mx-auto">
            <AISearch onResults={(results) => setSearchResults(results)} />
          </div>

          {/* Search Results */}
          {searchResults && searchResults.results && searchResults.results.length > 0 && (
            <div className="container px-5 py-4 mx-auto">
              <h2 className="text-2xl font-medium title-font mb-4 text-gray-900">
                Search Results ({searchResults.results.length})
              </h2>
              <AnimatedGrid>
                {searchResults.results.map((course, id) => (
                  <Link key={id} href={`/courses/${course.id}`}>
                    <Card hover className="cursor-pointer">
                      <div className="h-40 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-t-xl"></div>
                      <div className='p-6'>
                        <h2 className="text-lg text-neutral-900 font-medium mb-2">{course.title}</h2>
                        <p className="text-neutral-600 line-clamp-2 mb-3">{course.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">{course.category}</span>
                          {course.rating && <span className="text-yellow-500">★ {course.rating.toFixed(1)}</span>}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </AnimatedGrid>
              <button 
                onClick={() => setSearchResults(null)} 
                className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800"
                aria-label="Clear search results"
              >
                Clear search results
              </button>
            </div>
          )}

          <div className="flex-col container px-5 py-10 mx-auto">
            <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
              <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-neutral-900">Explore and unlock your potential with EduX</h1>
              <p className="lg:w-1/2 w-full text-neutral-600 text-lg">
                Welcome to EduX, your gateway to a world of limitless learning and growth. EduX offers a diverse range of online courses and resources to suit individual learning journey. Join us in embracing the future of education, where knowledge is accessible anytime, anywhere.
              </p>
            </div>

            {/* AI Recommendations for logged-in users */}
            {isLoggedIn && (
              <div className="mb-12">
                <AIRecommendations limit={4} />
              </div>
            )}

            {/* Gamification Dashboard for logged-in users */}
            {isLoggedIn && (
              <div className="mb-12">
                <GamificationDashboard />
              </div>
            )}

            <div>
              {isLoggedIn && courseSuggestion.length > 0 &&
                <div className='mb-8'>
                  <h1 className="text-3xl font-semibold mb-2 text-neutral-900">Suggestions From Your Instructors</h1>
                </div>
              }
              <AnimatedGrid staggerType="wave" data-testid="suggestions-grid">
                {isLoggedIn && loadingSuggestions ? (
                  Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))
                ) : (
                  courseSuggestion.map((course, id) => (
                    <Link key={id} href={`/courses/${course.c_id}`}>
                      <Card hover className="cursor-pointer">
                        <Image src={CourseWall_1} alt='course' loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '10rem' }} className="rounded-t-xl" />
                        <div className='p-6'>
                          <h2 className="text-lg text-neutral-900 font-medium mb-2">{course.title}</h2>
                          <p className="text-neutral-600">Instructor: {course.name}</p>
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </AnimatedGrid>
              {isLoggedIn && hasMoreSuggestions && !loadingSuggestions && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => loadMoreCourses('suggestions')}
                    disabled={loadingMore}
                    loading={loadingMore}
                  >
                    Load More Suggestions
                  </Button>
                </div>
              )}
              <div className='pt-16 mb-8'>
                <h1 className="text-3xl font-semibold mb-2 text-neutral-900">Top Rated Courses</h1>
              </div>
              <AnimatedGrid staggerType="wave" data-testid="popular-courses-grid">
                {loadingTopRated ? (
                  Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))
                ) : (
                  TopRatedCourses.map((course, id) => (
                    <Link key={id} href={`/courses/${course.c_id}`}>
                      <Card hover className="cursor-pointer">
                        <Image src={CourseWall_2} alt='course' className="w-full h-40 object-cover rounded-t-xl" loading="lazy" />
                        <div className='p-6'>
                          <h2 className="text-lg text-neutral-900 font-medium mb-2">{course.title}</h2>
                          <p className="text-neutral-600">Rating: {course.rating} / 5</p>
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </AnimatedGrid>
              {hasMoreTopRated && !loadingTopRated && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => loadMoreCourses('topRated')}
                    disabled={loadingMore}
                    loading={loadingMore}
                  >
                    Load More Top Rated Courses
                  </Button>
                </div>
              )}
              <div className='pt-16 mb-8'>
                <h1 className="text-3xl font-semibold mb-2 text-neutral-900">Most Popular Courses</h1>
              </div>
              <AnimatedGrid staggerType="wave">
                {loadingPopular ? (
                  Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))
                ) : (
                  PopularCourses.map((course, id) => (
                    <Link key={id} href={`/courses/${course.c_id}`}>
                      <Card hover className="cursor-pointer">
                        <Image src={CourseWall_3} alt='course' className="w-full h-40 object-cover rounded-t-xl" loading="lazy" />
                        <div className='p-6'>
                          <h2 className="text-lg text-neutral-900 font-medium mb-2">{course.title}</h2>
                          <p className="text-neutral-600">Total {course.student_count} students enrolled</p>
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </AnimatedGrid>
              {hasMorePopular && !loadingPopular && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => loadMoreCourses('popular')}
                    disabled={loadingMore}
                    loading={loadingMore}
                    className="px-6 py-2"
                  >
                    Load More Popular Courses
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
