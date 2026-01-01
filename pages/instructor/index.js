import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import ProfilePic from '../../public/profile_pic.jpg';
import secureLocalStorage from 'react-secure-storage';
import CourseWall_1 from '../../public/course_wall-1.jpg';
import CourseWall_2 from '../../public/course_wall-2.jpg';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Progress } from '@material-tailwind/react';
import { apiPost } from '../../lib/api';

const Instructor = () => {
  let userInfo;
  const u_id = secureLocalStorage.getItem('u_id');
  const [myCourses, setMyCourses] = useState([]);
  useEffect(() => {
    apiPost('/api/instructor_info', { u_id })
      .then((res) => res.json())
      .then((json_res) => {
        userInfo = json_res[0];
        document.getElementById('name').innerHTML = userInfo.name;
        document.getElementById('email').innerHTML = userInfo.email;
        document.getElementById('subject').innerHTML = userInfo.subject;
        document.getElementById('course_count').innerHTML = userInfo.course_count;
        document.getElementById('reg_date').innerHTML = userInfo.reg_date;
      });
    apiPost('/api/instructor_courses', { u_id })
      .then((res) => res.json())
      .then((parsed) => {
        setMyCourses(parsed);
      });
  }, []);

  return (
    <div className='h-full w-full'>
      <section className="text-gray-600">
        <div className="container mx-auto flex flex-col">
          <div>
            <div className="flex flex-col px-28 sm:flex-row mt-10">
              <div className="sm:w-2/5 text-center sm:pr-16 sm:py-8 sm:pb-16">
                <Image src={ProfilePic} alt='profile picture' priority='true'></Image>
              </div>
              <div className="sm:w-2/3 sm:px-24 sm:py-8 sm:pt-16 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Name</span>
                  <span className="ml-auto text-gray-900"><p id='name'></p></span>
                </div>
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Email</span>
                  <span className="ml-auto text-gray-900"><p id='email'></p></span>
                </div>
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Subject</span>
                  <span className="ml-auto text-gray-900"><p id='subject'></p></span>
                </div>
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Current Course</span>
                  <span className="ml-auto text-gray-900"><p id='course_count'></p></span>
                </div>
                <div className="flex border-t border-b mb-6 border-gray-200 py-2">
                  <span className="text-gray-500">Registration date</span>
                  <span className="ml-auto text-gray-900"><p id='reg_date'></p></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="flex flex-wrap mx-28 my-4">
        {myCourses.map((course) => {
          return <div className='flex border border-gray-400 rounded-lg hover:shadow-md hover:shadow-slate-800 hover:bg-white overflow-hidden h-50 w-full p-6 m-5'>
            <div className='w-2/3 border-e-2 px-5 flex'>
              <div className='round rounded-md overflow-hidden'>
                <Image src={CourseWall_1} alt='profile picture' priority='true' className='h-28 w-auto'></Image>
              </div>
              <div className='mx-5 space-y-4'>
                <h2 className="text-3xl text-gray-900 font-bold title-font">{course.title}</h2>
                <p className="text-l text-gray-900 font-bold title-font">{course.description}</p>
              </div>
            </div>
            <div className='w-1/3 px-5 items-center justify-center flex'>
              
                <a href={`/user/courses/${course.c_id}`}>
                  <div className='bg-blue-600 h-10 w-40 rounded-md flex items-center justify-center space-x-2 hover:bg-blue-700'>
                    <p className='text-white text-lg'>Update course</p>
                    <HiArrowNarrowRight className='text-3xl text-white' />
                  </div>
                </a>
              
            </div>
          </div>;
        })}
      </div>
    </div>
  );
};

export default Instructor;