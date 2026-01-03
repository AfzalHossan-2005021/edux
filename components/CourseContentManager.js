/**
 * Course Content Manager Component
 * Comprehensive UI for managing course structure, materials, and assessments
 */

import React, { useState, useEffect } from 'react';
import { apiPost, apiGet } from '@/lib/api';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaBook,
  FaClipboardList,
} from 'react-icons/fa';

export default function CourseContentManager({ courseId, isInstructor = false }) {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddLecture, setShowAddLecture] = useState(null);
  const [showAddExam, setShowAddExam] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCourseStructure();
  }, [courseId]);

  const loadCourseStructure = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/course/structure?c_id=${courseId}`);
      const data = await response.json();
      if (data.success) {
        setCourseData(data);
      }
    } catch (error) {
      console.error('Error loading course structure:', error);
      setErrors({ general: 'Failed to load course structure' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!formData.topicName?.trim()) {
      setErrors({ topic: 'Topic name is required' });
      return;
    }

    try {
      const response = await apiPost('/api/course/topics', {
        c_id: courseId,
        action: 'create_topic',
        data: {
          name: formData.topicName,
          serial: formData.topicSerial || null,
          weight: formData.topicWeight || 1
        }
      });

      const result = await response.json();
      if (result.success) {
        setFormData({});
        setShowAddTopic(false);
        await loadCourseStructure();
      } else {
        setErrors({ topic: result.error });
      }
    } catch (error) {
      setErrors({ topic: 'Failed to add topic' });
    }
  };

  const handleAddLecture = async (topicId) => {
    if (!formData.lectureDesc?.trim()) {
      setErrors({ lecture: 'Lecture description is required' });
      return;
    }

    try {
      const response = await apiPost('/api/course/materials', {
        c_id: courseId,
        t_id: topicId,
        action: 'add_lecture',
        data: {
          description: formData.lectureDesc,
          video: formData.lectureVideo,
          weight: formData.lectureWeight || 1,
          serial: formData.lectureSerial || 1
        }
      });

      const result = await response.json();
      if (result.success) {
        setFormData({});
        setShowAddLecture(null);
        await loadCourseStructure();
      } else {
        setErrors({ lecture: result.error });
      }
    } catch (error) {
      setErrors({ lecture: 'Failed to add lecture' });
    }
  };

  const handleAddExam = async (topicId) => {
    if (!formData.examQuestions || !formData.examMarks) {
      setErrors({ exam: 'Questions and marks are required' });
      return;
    }

    try {
      const response = await apiPost('/api/course/content', {
        action: 'create_exam',
        t_id: topicId,
        data: {
          question_count: parseInt(formData.examQuestions),
          marks: parseInt(formData.examMarks),
          duration: formData.examDuration || 60,
          weight: formData.examWeight || 1
        }
      });

      const result = await response.json();
      if (result.success) {
        setFormData({});
        setShowAddExam(null);
        await loadCourseStructure();
      } else {
        setErrors({ exam: result.error });
      }
    } catch (error) {
      setErrors({ exam: 'Failed to add exam' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{errors.general || 'Course not found'}</p>
      </div>
    );
  }

  const { course, statistics } = courseData;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Topics</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.total_topics}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Lectures</p>
            <p className="text-2xl font-bold text-green-600">{statistics.total_lectures}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Exams</p>
            <p className="text-2xl font-bold text-orange-600">{statistics.total_exams}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Questions</p>
            <p className="text-2xl font-bold text-purple-600">{statistics.total_questions}</p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {Object.values(errors).some(e => e) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          {Object.entries(errors).map(([key, error]) => (
            error && <p key={key} className="text-red-800">{error}</p>
          ))}
        </div>
      )}

      {/* Course Structure */}
      <div className="space-y-4">
        {/* Add Topic Button */}
        {isInstructor && (
          <div className="mb-6">
            {!showAddTopic ? (
              <button
                onClick={() => setShowAddTopic(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <FaPlus /> Add Topic
              </button>
            ) : (
              <form onSubmit={handleAddTopic} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Topic Name"
                    value={formData.topicName || ''}
                    onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Serial (optional)"
                    value={formData.topicSerial || ''}
                    onChange={(e) => setFormData({ ...formData, topicSerial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTopic(false);
                        setFormData({});
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Topics List */}
        {course.topics && course.topics.map(topic => (
          <div key={topic.t_id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Topic Header */}
            <button
              onClick={() => toggleTopic(topic.t_id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                <FaBook className="text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
                  <p className="text-sm text-gray-600">
                    {topic.lectures?.length || 0} Lectures • {topic.exams?.length || 0} Exams
                  </p>
                </div>
              </div>
              {expandedTopics[topic.t_id] ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {/* Topic Content */}
            {expandedTopics[topic.t_id] && (
              <div className="border-t p-6 space-y-6">
                {/* Lectures Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Lectures</h4>
                  <div className="space-y-2">
                    {topic.lectures && topic.lectures.map(lecture => (
                      <div key={lecture.l_id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{lecture.description}</p>
                          {lecture.video && (
                            <p className="text-sm text-gray-600 truncate">{lecture.video}</p>
                          )}
                        </div>
                        {isInstructor && (
                          <div className="flex gap-2 ml-4">
                            <button className="p-2 text-indigo-600 hover:bg-gray-200 rounded">
                              <FaEdit size={14} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-gray-200 rounded">
                              <FaTrash size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {isInstructor && (
                    <button
                      onClick={() => setShowAddLecture(topic.t_id)}
                      className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <FaPlus size={14} /> Add Lecture
                    </button>
                  )}

                  {showAddLecture === topic.t_id && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAddLecture(topic.t_id);
                    }} className="mt-4 bg-blue-50 p-4 rounded-lg space-y-3">
                      <textarea
                        placeholder="Lecture Description"
                        value={formData.lectureDesc || ''}
                        onChange={(e) => setFormData({ ...formData, lectureDesc: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="url"
                        placeholder="Video URL (optional)"
                        value={formData.lectureVideo || ''}
                        onChange={(e) => setFormData({ ...formData, lectureVideo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                          Add Lecture
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddLecture(null);
                            setFormData({});
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Exams Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaClipboardList /> Exams
                  </h4>
                  <div className="space-y-2">
                    {topic.exams && topic.exams.map(exam => (
                      <div key={exam.e_id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Exam #{exam.e_id}</p>
                          <p className="text-sm text-gray-600">
                            {exam.question_count} Questions • {exam.marks} Marks • {exam.duration} Min
                          </p>
                        </div>
                        {isInstructor && (
                          <div className="flex gap-2 ml-4">
                            <button className="p-2 text-indigo-600 hover:bg-gray-200 rounded">
                              <FaEdit size={14} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-gray-200 rounded">
                              <FaTrash size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {isInstructor && (
                    <button
                      onClick={() => setShowAddExam(topic.t_id)}
                      className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <FaPlus size={14} /> Add Exam
                    </button>
                  )}

                  {showAddExam === topic.t_id && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleAddExam(topic.t_id);
                    }} className="mt-4 bg-orange-50 p-4 rounded-lg space-y-3">
                      <input
                        type="number"
                        placeholder="Number of Questions"
                        value={formData.examQuestions || ''}
                        onChange={(e) => setFormData({ ...formData, examQuestions: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Total Marks"
                        value={formData.examMarks || ''}
                        onChange={(e) => setFormData({ ...formData, examMarks: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={formData.examDuration || '60'}
                        onChange={(e) => setFormData({ ...formData, examDuration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                          Add Exam
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddExam(null);
                            setFormData({});
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
