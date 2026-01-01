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


export default function Home() {
  const s_id = secureLocalStorage.getItem('u_id');
  const [courseSuggestion, setCourseSuggestion] = useState([]);
  const [PopularCourses, setPopularCourses] = useState([]);
  const [TopRatedCourses, setTopRatedCourses] = useState([]);
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    if (secureLocalStorage.getItem('u_id')) {
      setisLoggedIn(true);
      apiPost('/api/course_suggestion', { s_id })
        .then((res) => res.json())
        .then((json_res) => {
          setCourseSuggestion(json_res);
        });
    };
    apiGet('/api/top_rated_courses')
      .then((a) => a.json())
      .then((parsed) => {
        setTopRatedCourses(parsed);
      });
    apiGet('/api/popular_courses')
      .then((a) => a.json())
      .then((parsed) => {
        setPopularCourses(parsed);
      });
  }, []);

  return (
    <main>
      <div className='bg-slate-100'>
        <section className="text-gray-600 body-font">
          <div>
            <Image src={WallPic} alt='wall' priority='true'></Image>
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
              <div className="flex flex-wrap -m-4">
                {searchResults.results.map((course, id) => (
                  <div key={id} className="xl:w-1/3 md:w-1/2 p-4">
                    <Link href={`/courses/${course.id}`}>
                      <div className="border border-gray-400 rounded-lg hover:shadow-md hover:shadow-slate-800 hover:bg-white overflow-hidden">
                        <div className="h-40 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                        <div className='p-6'>
                          <h2 className="text-lg text-gray-900 font-medium title-font mb-2">{course.title}</h2>
                          <p className="leading-relaxed text-base text-gray-600 line-clamp-2">{course.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">{course.category}</span>
                            {course.rating && <span className="text-yellow-500">★ {course.rating.toFixed(1)}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setSearchResults(null)} 
                className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Clear search results
              </button>
            </div>
          )}

          <div className="flex-col container px-5 py-10 mx-auto">
            <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">Explore and unlock your potential with EduX</h1>
              <p className="lg:w-1/2 w-full leading-relaxed text-gray-500">
                Welcome to EduX, your gateway to a world of limitless learning and growth. EduX offers a diverse range of online courses and resources to suit individual learning journey. Join us in embracing the future of education, where knowledge is accessible anytime, anywhere.
              </p>
            </div>

            {/* AI Recommendations for logged-in users */}
            {isLoggedIn && (
              <div className="mb-12">
                <AIRecommendations limit={4} />
              </div>
            )}

            <div>
              {isLoggedIn &&
                <div className='ps-1 pb-3'>
                  <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">Suggestions From Your Instructors</h1>
                </div>
              }
              <div className="flex flex-wrap -m-4">
                {isLoggedIn && courseSuggestion.map((course, id) => {
                  return <div key={id} className="xl:w-1/3 md:w-1/2 p-4 ">
                    <Link href={`/courses/${course.c_id}`}>
                      <div className="border border-gray-400 rounded-lg hover:shadow-md hover:shadow-slate-800 hover:bg-white overflow-hidden">
                        <Image src={CourseWall_1} alt='wall' priority='true'></Image>
                        <div className='p-6'>
                          <h2 className="text-lg text-gray-900 font-medium title-font mb-2">{course.title}</h2>
                          <p className="leading-relaxed text-base">Instructor : {course.name}</p>
                        </div>
                      </div>
                    </Link>
                  </div>;
                })}
              </div>
              <div className='pt-12 ps-1 pb-3'>
                <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">Most Popular courses</h1>
              </div>
              <div className="flex flex-wrap -m-4">
                {TopRatedCourses.map((course, id) => {
                  return <div key={id} className="xl:w-1/3 md:w-1/2 p-4 ">
                    <Link href={`/courses/${course.c_id}`}>
                      <div className="border border-gray-400 rounded-lg hover:shadow-md hover:shadow-slate-800 hover:bg-white overflow-hidden">
                        <Image src={CourseWall_2} alt='wall' priority='true'></Image>
                        <div className='p-6'>
                          <h2 className="text-lg text-gray-900 font-medium title-font mb-2">{course.title}</h2>
                          <p className="leading-relaxed text-base">Rating : {course.rating} / 5</p>
                        </div>
                      </div>
                    </Link>
                  </div>;
                })}
              </div>
              <div className='pt-12 ps-1 pb-3'>
                <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">Top Rated Courses</h1>
              </div>
              <div className="flex flex-wrap -m-4">
                {PopularCourses.map((course, id) => {
                  return <div key={id} className="xl:w-1/3 md:w-1/2 p-4 ">
                    <Link href={`/courses/${course.c_id}`}>
                      <div className="border border-gray-400 rounded-lg hover:shadow-md hover:shadow-slate-800 hover:bg-white overflow-hidden">
                        <Image src={CourseWall_3} alt='wall' priority='true'></Image>
                        <div className='p-6'>
                          <h2 className="text-lg text-gray-900 font-medium title-font mb-2">{course.title}</h2>
                          <p className="leading-relaxed text-base">Total {course.student_count} students enrolled</p>
                        </div>
                      </div>
                    </Link>
                  </div>;
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
