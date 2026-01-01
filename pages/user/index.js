import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import ProfilePic from '../../public/profile_pic.jpg';
import secureLocalStorage from 'react-secure-storage';
import CourseWall_1 from '../../public/course_wall-1.jpg';
import CourseWall_2 from '../../public/course_wall-2.jpg';
import { HiArrowNarrowRight } from 'react-icons/hi';
import RateCourse from '@/components/RateCourse';
import { apiPost } from '../../lib/api';
import { AIChat, AIRecommendations, LearningAnalytics } from '../../components/ai';

// Simple progress bar component to avoid material-tailwind recursion issues
const ProgressBar = ({ value = 0 }) => {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
};

const User = () => {
  const inProgessRef = useRef();
  const completedRef = useRef();
  const analyticsRef = useRef();

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

  const inProgressTab = () => {
    setActiveTab('inProgress');
    if (inProgessRef.current.classList.contains('hidden')) {
      inProgessRef.current.classList.remove('hidden');
      inProgessRef.current.classList.add('flex');
      completedRef.current.classList.add('hidden');
      analyticsRef.current.classList.add('hidden');
    }
  };

  const completedTab = () => {
    setActiveTab('completed');
    if (completedRef.current.classList.contains('hidden')) {
      completedRef.current.classList.remove('hidden');
      completedRef.current.classList.add('flex');
      inProgessRef.current.classList.add('hidden');
      analyticsRef.current.classList.add('hidden');
    }
  };

  const analyticsTab = () => {
    setActiveTab('analytics');
    if (analyticsRef.current.classList.contains('hidden')) {
      analyticsRef.current.classList.remove('hidden');
      inProgessRef.current.classList.add('hidden');
      completedRef.current.classList.add('hidden');
    }
  };

  useEffect(() => {
    setUserId(secureLocalStorage.getItem('u_id'));
  }, []);

  useEffect(() => {
    if (!u_id) return;
    
    apiPost('/api/user_info', { u_id })
      .then((res) => res.json())
      .then((json_res) => {
        if (json_res && json_res[0]) {
          const userInfo = json_res[0];
          setNameValue(userInfo.name || '');
          setEmailValue(userInfo.email || '');
          setDate_of_birthValue(userInfo.date_of_birth || '');
          setGenderValue(userInfo.gender === "M" ? "Male" : "Female");
          setCourse_countValue(userInfo.course_count || 0);
          setReg_dateValue(userInfo.reg_date || '');
        }
      })
      .catch(err => console.error('Error fetching user info:', err));
      
    apiPost('/api/user_courses', { u_id })
      .then((res) => res.json())
      .then((json_res) => {
        if (Array.isArray(json_res)) {
          setInProgressCourses(json_res[0] || []);
          setCompletedCourses(json_res[1] || []);
        }
      })
      .catch(err => console.error('Error fetching courses:', err));
  }, [u_id]);

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
                  <span className="ml-auto text-gray-900">
                    <p id="name">{nameValue}</p>
                  </span>
                </div>
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Email</span>
                  <span className="ml-auto text-gray-900">
                    <p id="email">{emailValue}</p>
                  </span>
                </div>
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Date of Birth</span>
                  <span className="ml-auto text-gray-900">
                    <p id="dob">{date_of_birthValue}</p>
                  </span>
                </div>
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Gender</span>
                  <span className="ml-auto text-gray-900">
                    <p id="gender">{genderValue}</p>
                  </span>
                </div>
                <div className="flex border-t border-gray-200 py-2">
                  <span className="text-gray-500">Course Taken</span>
                  <span className="ml-auto text-gray-900">
                    <p id="course_count">{course_countValue}</p>
                  </span>
                </div>
                <div className="flex border-t border-b mb-6 border-gray-200 py-2">
                  <span className="text-gray-500">Registration date</span>
                  <span className="ml-auto text-gray-900">
                    <p id="reg_date">{reg_dateValue}</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <nav className="bg-gradient-to-r from-slate-200 to-slate-400 shadow-2xl z-20">
        <div className="max-w-screen-xl px-4 py-3 mx-auto">
          <div className="flex items-center space-x-5">
            <button onClick={inProgressTab} className={activeTab === 'inProgress' ? 'text-blue-600 underline' : ''}><h1 className='text-2xl hover:underline hover:text-blue-500'>In progress</h1></button>
            <button onClick={completedTab} className={activeTab === 'completed' ? 'text-blue-600 underline' : ''}><h1 className='text-2xl hover:underline hover:text-blue-500'>Completed</h1></button>
            <button onClick={analyticsTab} className={activeTab === 'analytics' ? 'text-blue-600 underline' : ''}><h1 className='text-2xl hover:underline hover:text-blue-500'>📊 Analytics</h1></button>
          </div>
        </div>
      </nav>
      <div ref={inProgessRef} className="flex flex-wrap mx-28 my-4">
        {inProgressCourses.map((course) => {
          return <div key={course.c_id} className='flex border border-gray-400 rounded-lg hover:shadow-md hover:shadow-slate-800 hover:bg-white h-40 w-full p-6 m-5'>
            <div className='w-2/3 border-e-2 px-5 flex'>
              <div className='round rounded-md overflow-hidden'>
                <Image src={CourseWall_1} alt='profile picture' priority='true' className='h-28 w-auto'></Image>
              </div>
              <div className='mx-5 space-y-4'>
                <h2 className="text-3xl text-gray-900 font-bold title-font">{course.title}</h2>
                <div className='flex space-x-5'>
                  <div><h1>Progress</h1></div>
                  <div className='w-full h-full pt-2'>
                    <ProgressBar value={course.progress} />
                  </div>
                </div>
              </div>
            </div>
            <div className='w-1/3 px-5 space-y-3'>
              <div className='h-1/2 items-center justify-center flex'>
                <Link href={`/user/courses/${course.c_id}`}>
                  <div className='bg-blue-600 h-10 w-40 rounded-md flex items-center justify-center space-x-2 hover:bg-blue-700'>
                    <p className='text-white text-lg'>Go to course</p>
                    <HiArrowNarrowRight className='text-3xl text-white' />
                  </div>
                </Link>
              </div>
              <div className='items-center justify-center flex'>
                <RateCourse c_id={course.c_id} />
              </div>
            </div>
          </div>;
        })}
      </div>
      <div ref={completedRef} className="flex-wrap mx-28 my-4 hidden">
        {completedCourses.map((course) => {
          return <div key={course.c_id} className='flex border border-gray-400 rounded-lg hover:shadow-md hover:shadow-slate-800 hover:bg-white h-40 w-full p-6 m-5'>
            <div className='w-2/3 border-e-2 px-5 flex'>
              <div className='round rounded-md overflow-hidden'>
                <Image src={CourseWall_2} alt='profile picture' priority='true' className='h-28 w-auto'></Image>
              </div>
              <div className='mx-5 space-y-4'>
                <h2 className="text-3xl text-gray-900 font-bold title-font">{course.title}</h2>
                <div className='flex space-x-5'>
                  <div><h1 className='text-xl text-blue-500'>Completion Date: {course.completion_date}</h1></div>
                  <div><h1 className='text-xl text-blue-500'>Grade: {course.grade}</h1></div>
                </div>
              </div>
            </div>
            <div className='w-1/3 px-5'>
              <div className='h-1/2 items-center justify-center flex'>
                <a href={`/user/courses/${course.c_id}`}>
                  <div className='bg-blue-600 h-10 w-40 rounded-md flex items-center justify-center space-x-2 hover:bg-blue-700'>
                    <p className='text-white text-lg'>Go to course</p>
                    <HiArrowNarrowRight className='text-3xl text-white' />
                  </div>
                </a>
              </div>
              <div className='h-1/2 items-center justify-center flex'>
                <button>
                  <div className='border-2 border-blue-500 bg-transparent h-10 w-40 rounded-md flex items-center justify-center space-x-2 hover:bg-blue-500 text-blue-500 text-lg hover:text-white'>
                    Rate the Course
                  </div>
                </button>
              </div>
            </div>
          </div>;
        })}
      </div>

      {/* Analytics Tab */}
      {u_id && (
        <div ref={analyticsRef} className="mx-28 my-4 hidden">
          <LearningAnalytics />
        </div>
      )}

      {/* AI Recommendations Section */}
      {u_id && (
        <div className="mx-28 my-8">
          <AIRecommendations limit={4} />
        </div>
      )}

      {/* AI Chat Widget */}
      {showChat && <AIChat onClose={() => setShowChat(false)} />}
      
      {/* Chat Toggle Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default User;