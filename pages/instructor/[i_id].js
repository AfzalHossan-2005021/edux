import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { executeQuery } from '@/middleware/connectdb';
import get_instructor_info_query from '@/db/get_instructor_info_query';
import get_instructor_courses_query from '@/db/get_instructor_courses_query';
import { Card, Button, Badge } from '@/components/ui';
import { HiMail, HiUsers, HiAcademicCap, HiEye } from 'react-icons/hi';

export async function getServerSideProps(context) {
  const { i_id } = context.params;

  try {
    // Fetch instructor info
    const infoResult = await executeQuery(get_instructor_info_query(), { USER_ID: i_id });
    const instructor = infoResult?.rows?.[0] || null;

    // Fetch instructor courses
    const coursesResult = await executeQuery(get_instructor_courses_query(), { USER_ID: i_id });
    const courses = (coursesResult?.rows || []).map(c => ({
      ...c,
      PREREQUISITES_LIST: c.PREREQUISITES_LIST ? JSON.parse(c.PREREQUISITES_LIST) : [],
      OUTCOMES_LIST: c.OUTCOMES_LIST ? JSON.parse(c.OUTCOMES_LIST) : []
    }));

    if (!instructor) {
      return { notFound: true };
    }

    return {
      props: {
        instructor,
        courses
      }
    };
  } catch (error) {
    console.error('Error fetching instructor page data:', error);
    return { notFound: true };
  }
}

const CourseCard = ({ course }) => (
  <Card hover padding="none" className="group overflow-hidden">
    <div className="relative h-40 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      {course.wall ? (
        <Image src={course.wall} alt={course.title || 'Course'} fill sizes="50%" className="object-cover group-hover:scale-110 transition-transform duration-500" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">No Image</div>
      )}

      {course.rating && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="warning" className="flex items-center gap-1 shadow-lg">
            <svg className="w-3 h-3 text-amber-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.182c.969 0 1.371 1.24.588 1.81l-3.386 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.386-2.46a1 1 0 00-1.175 0l-3.386 2.46c-.785.57-1.84-.197-1.54-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.05 9.401c-.783-.57-.38-1.81.588-1.81h4.182a1 1 0 00.95-.69l1.286-3.974z"/></svg>
            <span className="text-sm">{course.rating?.toFixed(1) || '0.0'}</span>
          </Badge>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute bottom-3 left-3 text-white text-sm flex items-center gap-2">
        <HiUsers className="w-4 h-4" />
        <span>{course.student_count || 0} students</span>
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{course.title}</h4>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{course.description || 'No description available'}</p>
      <div className="mt-4 flex items-center gap-2">
        <Link href={`/courses/${course.c_id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <HiEye className="w-4 h-4 mr-1" /> View
          </Button>
        </Link>
      </div>
    </div>
  </Card>
);

export default function InstructorProfile({ instructor, courses }) {
  const initials = instructor?.name ? instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'I';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Head>
        <title>{instructor.name} • Instructor • EDUX</title>
        <meta name="description" content={`Learn more about ${instructor.name}, their expertise, and courses on EDUX.`} />
      </Head>

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-indigo-700 opacity-10" />
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">{instructor.name}</h1>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{instructor.expertise}</p>
                      {instructor.qualification && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{instructor.qualification}</p>}
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm">Instructor</Badge>
                    <a href={`mailto:${instructor.email || ''}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <HiMail className="w-4 h-4" /> Contact
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{instructor.bio || 'No biography provided.'}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <HiAcademicCap className="w-5 h-5 text-neutral-500" />
                    <span>Joined: {instructor.reg_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <HiUsers className="w-5 h-5 text-neutral-500" />
                    <span>{courses.length} courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">Courses by {instructor.name}</h3>
                <Link href="/instructor" className="text-sm text-primary-600">View all</Link>
              </div>

              {courses.length === 0 ? (
                <Card padding="md" className="text-center">
                  <div className="text-3xl mb-2">🎓</div>
                  <p className="text-neutral-600 dark:text-neutral-400">This instructor hasn't published any courses yet.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <CourseCard key={course.c_id} course={course} />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <Card padding="md">
                <h4 className="font-semibold text-neutral-800 dark:text-white mb-2">About</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{instructor.bio || 'No additional details.'}</p>
              </Card>

              <Card padding="md">
                <h4 className="font-semibold text-neutral-800 dark:text-white mb-2">Contact</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 break-words mb-3">{instructor.email || 'Not available'}</p>
                {instructor.email && (
                  <a href={`mailto:${instructor.email}`}>
                    <Button size="sm" variant="primary" className="w-full">Message Instructor</Button>
                  </a>
                )}
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
