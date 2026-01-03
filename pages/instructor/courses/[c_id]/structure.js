/**
 * Instructor - View Course Structure
 * URL: /instructor/courses/[c_id]/structure
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import secureLocalStorage from 'react-secure-storage';
import { apiGet } from '@/lib/api';
import { FaBook, FaPlay, FaClipboardList, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function CourseStructure() {
  const router = useRouter();
  const { c_id } = router.query;
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    if (c_id) {
      verifyAndLoadCourse();
    }
  }, [c_id]);

  const verifyAndLoadCourse = async () => {
    try {
      const i_id = secureLocalStorage.getItem('i_id');
      if (!i_id) {
        router.push('/login');
        return;
      }

      setIsInstructor(true);

      const response = await apiGet(`/api/course/structure?c_id=${c_id}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.course);
        setStats(data.statistics);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      setLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">Course not found.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Course Structure</h1>
              <p className="text-gray-600 mt-1">{course.title}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/instructor/courses/${c_id}/manage-content`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Edit Content
              </button>
              <button
                onClick={() => router.push(`/instructor/courses/${c_id}`)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Topics</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.total_topics || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Lectures</p>
            <p className="text-3xl font-bold text-green-600">{stats?.total_lectures || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Exams</p>
            <p className="text-3xl font-bold text-orange-600">{stats?.total_exams || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Questions</p>
            <p className="text-3xl font-bold text-purple-600">{stats?.total_questions || 0}</p>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {course.topics && course.topics.map((topic, topicIndex) => (
            <div key={topic.t_id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Topic Header */}
              <button
                onClick={() => toggleTopic(topic.t_id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <FaBook className="text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {topicIndex + 1}. {topic.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {topic.lectures?.length || 0} Lectures • {topic.exams?.length || 0} Exams
                    </p>
                  </div>
                </div>
                {expandedTopics[topic.t_id] ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {/* Topic Details */}
              {expandedTopics[topic.t_id] && (
                <div className="border-t p-6 space-y-6 bg-gray-50">
                  {/* Lectures */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaPlay className="text-green-600" /> Lectures
                    </h4>
                    <div className="space-y-2">
                      {topic.lectures && topic.lectures.length > 0 ? (
                        topic.lectures.map((lecture, lectureIndex) => (
                          <div key={lecture.l_id} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {lectureIndex + 1}. {lecture.description}
                                </p>
                                {lecture.video && (
                                  <p className="text-xs text-gray-500 truncate mt-1">{lecture.video}</p>
                                )}
                              </div>
                              <button className="p-2 text-indigo-600 hover:bg-gray-100 rounded">
                                <FaEdit size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No lectures added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Exams */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaClipboardList className="text-orange-600" /> Exams
                    </h4>
                    <div className="space-y-2">
                      {topic.exams && topic.exams.length > 0 ? (
                        topic.exams.map((exam, examIndex) => (
                          <div key={exam.e_id} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  Exam {examIndex + 1}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {exam.question_count} Questions • {exam.marks} Marks • {exam.duration} Minutes
                                </p>
                              </div>
                              <button className="p-2 text-indigo-600 hover:bg-gray-100 rounded">
                                <FaEdit size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No exams added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
