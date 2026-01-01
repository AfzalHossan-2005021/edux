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


export default function Home() {
  const s_id = secureLocalStorage.getItem('u_id');
  const [courseSuggestion, setCourseSuggestion] = useState([]);
  const [PopularCourses, setPopularCourses] = useState([]);
  const [TopRatedCourses, setTopRatedCourses] = useState([]);
  const [isLoggedIn, setisLoggedIn] = useState(false);

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
        console.log(parsed);
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
          <div className="flex-col container px-5 py-10 mx-auto">
            <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">Explore and unlock your potential with EduX</h1>
              <p className="lg:w-1/2 w-full leading-relaxed text-gray-500">
                Welcome to EduX, your gateway to a world of limitless learning and growth. EduX offers a diverse range of online courses and resources to suit individual learning journey. Join us in embracing the future of education, where knowledge is accessible anytime, anywhere.
              </p>
            </div>
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
