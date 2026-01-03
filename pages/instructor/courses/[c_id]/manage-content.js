/**
 * Instructor - Manage Course Content
 * URL: /instructor/courses/[c_id]/manage-content
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import secureLocalStorage from 'react-secure-storage';
import CourseContentManager from '@/components/CourseContentManager';
import { apiPost } from '@/lib/api';

export default function ManageCourseContent() {
  const router = useRouter();
  const { c_id } = router.query;
  const [courseData, setCourseData] = useState(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyInstructor();
  }, []);

  const verifyInstructor = async () => {
    try {
      const u_id = secureLocalStorage.getItem('u_id');
      const i_id = secureLocalStorage.getItem('i_id');

      // Check if user is instructor
      if (!i_id) {
        router.push('/login');
        return;
      }

      // Verify course belongs to instructor
      if (c_id) {
        const response = await apiPost('/api/instructor_courses', { u_id });
        const data = await response.json();

        const course = data.courses?.find(c => c.c_id === Number(c_id));
        if (course) {
          setCourseData(course);
          setIsInstructor(true);
        } else {
          router.push('/instructor/courses');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Verification error:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isInstructor) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Course Content</h1>
              <p className="text-gray-600 mt-1">{courseData?.title}</p>
            </div>
            <button
              onClick={() => router.push(`/instructor/courses/${c_id}`)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              ← Back to Course
            </button>
          </div>
        </div>
      </div>

      {/* Content Manager */}
      <div className="py-6">
        {c_id && <CourseContentManager courseId={Number(c_id)} isInstructor={true} />}
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  const { c_id } = context.params;
  return { props: { c_id } };
};
