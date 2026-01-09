/**
 * Course Content Manager Component
 * Comprehensive UI for managing course structure, materials, and assessments
 * Modern design with gradients, animations, and intuitive interactions
 */

import React, { useState, useEffect } from 'react';
import { apiPost, apiGet } from '@/lib/api';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronDown,
  HiChevronUp,
  HiBookOpen,
  HiClipboardList,
  HiPlay,
  HiDocument,
  HiCheckCircle,
  HiXCircle,
  HiCollection,
  HiAcademicCap,
  HiLightningBolt,
} from 'react-icons/hi';

export default function CourseContentManager({ courseId, isInstructor = false }) {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddLecture, setShowAddLecture] = useState(null);
  const [showAddExam, setShowAddExam] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
        // Auto-expand first topic
        if (data.course?.topics?.length > 0) {
          setExpandedTopics({ [data.course.topics[0].t_id]: true });
        }
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
      setSubmitting(true);
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
        setErrors({});
        await loadCourseStructure();
      } else {
        setErrors({ topic: result.error });
      }
    } catch (error) {
      setErrors({ topic: 'Failed to add topic' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLecture = async (topicId) => {
    if (!formData.lectureDesc?.trim()) {
      setErrors({ lecture: 'Lecture description is required' });
      return;
    }

    try {
      setSubmitting(true);
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
        setErrors({});
        await loadCourseStructure();
      } else {
        setErrors({ lecture: result.error });
      }
    } catch (error) {
      setErrors({ lecture: 'Failed to add lecture' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExam = async (topicId) => {
    if (!formData.examQuestions || !formData.examMarks) {
      setErrors({ exam: 'Questions and marks are required' });
      return;
    }

    try {
      setSubmitting(true);
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
        setErrors({});
        await loadCourseStructure();
      } else {
        setErrors({ exam: result.error });
      }
    } catch (error) {
      setErrors({ exam: 'Failed to add exam' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <HiAcademicCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading course structure...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <HiXCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-300 font-medium">{errors.general || 'Course not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { course, statistics } = courseData;

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Course Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg shadow-indigo-500/10 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-8 backdrop-blur-xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />

        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
              <HiAcademicCap className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">{course.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Topics Stat */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Topics</p>
                  <HiCollection className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{statistics.total_topics || 0}</p>
              </div>
            </div>

            {/* Lectures Stat */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-green-200 dark:border-green-800 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lectures</p>
                  <HiPlay className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{statistics.total_lectures || 0}</p>
              </div>
            </div>

            {/* Exams Stat */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-orange-200 dark:border-orange-800 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Exams</p>
                  <HiClipboardList className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{statistics.total_exams || 0}</p>
              </div>
            </div>

            {/* Questions Stat */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions</p>
                  <HiLightningBolt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{statistics.total_questions || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {Object.values(errors).some(e => e) && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <HiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {Object.entries(errors).map(([key, error]) => (
                error && <p key={key} className="text-red-800 dark:text-red-300 text-sm">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Course Structure */}
      <div className="space-y-6">
        {/* Add Topic Section */}
        {isInstructor && (
          <div>
            {!showAddTopic ? (
              <button
                onClick={() => setShowAddTopic(true)}
                className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <HiPlus className="w-5 h-5" />
                </div>
                <span>Add New Topic</span>
                <HiLightningBolt className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <form onSubmit={handleAddTopic} className="bg-white dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <HiCollection className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Topic</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Topic Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Introduction to React Hooks"
                      value={formData.topicName || ''}
                      onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Serial Order
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        value={formData.topicSerial || ''}
                        onChange={(e) => setFormData({ ...formData, topicSerial: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Weight
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        value={formData.topicWeight || ''}
                        onChange={(e) => setFormData({ ...formData, topicWeight: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <HiCheckCircle className="w-5 h-5" />
                          <span>Add Topic</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTopic(false);
                        setFormData({});
                        setErrors({});
                      }}
                      disabled={submitting}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Topics List - Due to length, I'll continue in next message */}
        {course.topics && course.topics.length > 0 ? (
          <div className="space-y-4">
            {course.topics.map((topic, index) => (
              <TopicCard
                key={topic.t_id}
                topic={topic}
                index={index}
                isExpanded={expandedTopics[topic.t_id]}
                toggleTopic={toggleTopic}
                isInstructor={isInstructor}
                showAddLecture={showAddLecture}
                setShowAddLecture={setShowAddLecture}
                showAddExam={showAddExam}
                setShowAddExam={setShowAddExam}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                submitting={submitting}
                handleAddLecture={handleAddLecture}
                handleAddExam={handleAddExam}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <HiCollection className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Topics Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start building your course by adding topics. Each topic can contain multiple lectures and exams.
            </p>
            {isInstructor && !showAddTopic && (
              <button
                onClick={() => setShowAddTopic(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
              >
                <HiPlus className="w-5 h-5" />
                <span>Add Your First Topic</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// TopicCard Component for better organization
function TopicCard({
  topic,
  index,
  isExpanded,
  toggleTopic,
  isInstructor,
  showAddLecture,
  setShowAddLecture,
  showAddExam,
  setShowAddExam,
  formData,
  setFormData,
  errors,
  setErrors,
  submitting,
  handleAddLecture,
  handleAddExam,
}) {
  return (
    <div className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-500/10 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20">
      {/* Topic Header */}
      <button
        onClick={() => toggleTopic(topic.t_id)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <HiBookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{topic.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <HiPlay className="w-4 h-4" />
                {topic.lectures?.length || 0} Lectures
              </span>
              <span className="flex items-center gap-1">
                <HiClipboardList className="w-4 h-4" />
                {topic.exams?.length || 0} Exams
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            topic.weight > 1
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            Weight: {topic.weight || 1}
          </div>
          {isExpanded ? (
            <HiChevronUp className="w-6 h-6 text-gray-400" />
          ) : (
            <HiChevronDown className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </button>

      {/* Topic Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-8 bg-gray-50/50 dark:bg-gray-900/20">
          {/* Lectures Section */}
          <LecturesSection
            topic={topic}
            isInstructor={isInstructor}
            showAddLecture={showAddLecture}
            setShowAddLecture={setShowAddLecture}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            submitting={submitting}
            handleAddLecture={handleAddLecture}
          />

          {/* Exams Section */}
          <ExamsSection
            topic={topic}
            isInstructor={isInstructor}
            showAddExam={showAddExam}
            setShowAddExam={setShowAddExam}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            submitting={submitting}
            handleAddExam={handleAddExam}
          />
        </div>
      )}
    </div>
  );
}

// Component for Lectures Section
function LecturesSection({
  topic,
  isInstructor,
  showAddLecture,
  setShowAddLecture,
  formData,
  setFormData,
  errors,
  setErrors,
  submitting,
  handleAddLecture,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <HiPlay className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          Lectures
        </h4>
      </div>

      {topic.lectures && topic.lectures.length > 0 ? (
        <div className="space-y-3">
          {topic.lectures.map((lecture, lectureIndex) => (
            <div key={lecture.l_id} className="group/item relative bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 text-green-700 dark:text-green-400 font-bold text-sm">
                    {lectureIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1 break-words">{lecture.description}</p>
                    {lecture.video && (
                      <a href={lecture.video} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-400 hover:underline truncate block">
                        🎬 {lecture.video}
                      </a>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Serial: {lecture.serial}</span>
                      <span>•</span>
                      <span>Weight: {lecture.weight}</span>
                    </div>
                  </div>
                </div>
                {isInstructor && (
                  <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit">
                      <HiPencil size={16} />
                    </button>
                    <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                      <HiTrash size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
          <HiDocument className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No lectures added yet</p>
        </div>
      )}

      {isInstructor && (
        showAddLecture !== topic.t_id ? (
          <button
            onClick={() => {
              setShowAddLecture(topic.t_id);
              setFormData({});
              setErrors({});
            }}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all font-medium"
          >
            <HiPlus size={18} />
            <span>Add Lecture</span>
          </button>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddLecture(topic.t_id);
          }} className="mt-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-5 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Lecture Description *
              </label>
              <textarea
                placeholder="e.g., Understanding useState and useEffect hooks"
                value={formData.lectureDesc || ''}
                onChange={(e) => setFormData({ ...formData, lectureDesc: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Video URL
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.lectureVideo || ''}
                onChange={(e) => setFormData({ ...formData, lectureVideo: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                disabled={submitting}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="w-5 h-5" />
                    <span>Add Lecture</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddLecture(null);
                  setFormData({});
                  setErrors({});
                }}
                disabled={submitting}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
}

// Component for Exams Section
function ExamsSection({
  topic,
  isInstructor,
  showAddExam,
  setShowAddExam,
  formData,
  setFormData,
  errors,
  setErrors,
  submitting,
  handleAddExam,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <HiClipboardList className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          Exams
        </h4>
      </div>

      {topic.exams && topic.exams.length > 0 ? (
        <div className="space-y-3">
          {topic.exams.map((exam, examIndex) => (
            <div key={exam.e_id} className="group/item relative bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 text-orange-700 dark:text-orange-400 font-bold text-sm">
                    {examIndex + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Exam #{exam.e_id}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg font-medium">
                        📝 {exam.question_count} Questions
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-medium">
                        🎯 {exam.marks} Marks
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium">
                        ⏱️ {exam.duration} Min
                      </span>
                    </div>
                  </div>
                </div>
                {isInstructor && (
                  <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit">
                      <HiPencil size={16} />
                    </button>
                    <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Delete">
                      <HiTrash size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
          <HiClipboardList className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No exams added yet</p>
        </div>
      )}

      {isInstructor && (
        showAddExam !== topic.t_id ? (
          <button
            onClick={() => {
              setShowAddExam(topic.t_id);
              setFormData({});
              setErrors({});
            }}
            className="mt-4 flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-all font-medium"
          >
            <HiPlus size={18} />
            <span>Add Exam</span>
          </button>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddExam(topic.t_id);
          }} className="mt-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 p-5 rounded-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Questions *
                </label>
                <input
                  type="number"
                  placeholder="10"
                  min="1"
                  value={formData.examQuestions || ''}
                  onChange={(e) => setFormData({ ...formData, examQuestions: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Total Marks *
                </label>
                <input
                  type="number"
                  placeholder="100"
                  min="1"
                  value={formData.examMarks || ''}
                  onChange={(e) => setFormData({ ...formData, examMarks: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Duration (min)
                </label>
                <input
                  type="number"
                  placeholder="60"
                  min="1"
                  value={formData.examDuration || '60'}
                  onChange={(e) => setFormData({ ...formData, examDuration: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="w-5 h-5" />
                    <span>Add Exam</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddExam(null);
                  setFormData({});
                  setErrors({});
                }}
                disabled={submitting}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
}
