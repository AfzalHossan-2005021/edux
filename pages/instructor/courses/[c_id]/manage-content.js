/**
 * Instructor - Manage Course Content
 * URL: /instructor/courses/[c_id]/manage-content
 * Add and organize course topics, lectures, exams, and questions
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost, apiGet } from '@/lib/api';
import { withInstructorAuth } from '@/lib/auth/withServerSideAuth';
import { Card, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';
import {
  HiArrowLeft,
  HiAcademicCap,
  HiChevronRight,
  HiPlus,
  HiPencil,
  HiTrash,
  HiCheck,
  HiX,
  HiBookOpen,
  HiVideoCamera,
  HiClipboardList,
  HiChevronDown,
  HiChevronUp,
  HiSave,
  HiCollection,
  HiLightningBolt,
} from 'react-icons/hi';

function ManageCourseContent({ serverUser }) {
  const router = useRouter();
  const { c_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState({});

  // Modal states
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  // Delete confirmation modals
  const [isDeleteTopicModalOpen, setIsDeleteTopicModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [deletingTopic, setDeletingTopic] = useState(false);

  const [isDeleteLectureModalOpen, setIsDeleteLectureModalOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState(null);
  const [deletingLecture, setDeletingLecture] = useState(false);

  const [isDeleteExamModalOpen, setIsDeleteExamModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deletingExam, setDeletingExam] = useState(false);

  // Form states
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentExam, setCurrentExam] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  useEffect(() => {
    if (c_id && u_id) {
      loadCourseContent();
    }
  }, [c_id, u_id]);

  const loadCourseContent = async () => {
    try {
      if (!u_id) {
        router.push('/auth/instructor/login');
        return;
      }

      // Get course info
      const response = await apiPost('/api/instructor_courses', { u_id });
      const data = await response.json();
      const courses = Array.isArray(data) ? data : (data.courses || []);
      const foundCourse = courses.find(c => (c.c_id || c.C_ID) === Number(c_id));

      if (!foundCourse) {
        router.push('/instructor');
        return;
      }

      setCourse(foundCourse);

      // Load topics with lectures and exams
      await loadTopics();

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      router.push('/instructor');
    };
  }

  const loadTopics = async () => {
    try {
      const response = await apiGet(`/api/course/topics?c_id=${c_id}`);
      const data = await response.json();

      if (data.success && data.topics) {
        // Load lectures and exams for each topic
        const topicsWithContent = await Promise.all(
          data.topics.map(async (topic) => {
            const [lecturesRes, examsRes] = await Promise.all([
              apiGet(`/api/topic/lectures?t_id=${topic.t_id || topic.T_ID}`),
              apiGet(`/api/topic/exams?t_id=${topic.t_id || topic.T_ID}`),
            ]);

            const lecturesData = await lecturesRes.json();
            const examsData = await examsRes.json();

            return {
              ...topic,
              lectures: lecturesData.lectures || [],
              exams: examsData.exams || [],
            };
          })
        );

        setTopics(topicsWithContent);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Topic CRUD operations
  const handleAddTopic = () => {
    setCurrentTopic({ name: '', description: '' });
    setShowTopicModal(true);
  };

  const handleEditTopic = (topic) => {
    setCurrentTopic(topic);
    setShowTopicModal(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint = currentTopic.t_id || currentTopic.T_ID ? '/api/topic/update' : '/api/topic/create';
      const response = await apiPost(endpoint, {
        ...currentTopic,
        c_id: Number(c_id),
        t_id: currentTopic.t_id || currentTopic.T_ID,
      });

      const result = await response.json();

      if (result.success) {
        await loadTopics();
        setShowTopicModal(false);
        setCurrentTopic(null);
        showMessage('success', currentTopic.t_id || currentTopic.T_ID ? 'Topic updated successfully!' : 'Topic added successfully!');
      } else {
        showMessage('error', result.message || 'Failed to save topic');
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      showMessage('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      const response = await apiPost('/api/topic/delete', { t_id: topicId });
      const result = await response.json();

      if (result.success) {
        await loadTopics();
        showMessage('success', 'Topic deleted successfully!');
      } else {
        showMessage('error', result.message || 'Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      showMessage('error', 'An error occurred');
    }
  };

  // Lecture CRUD operations
  const handleAddLecture = (topicId) => {
    setSelectedTopicId(topicId);
    setCurrentLecture({ description: '', video: '', duration: '', order_num: '' });
    setShowLectureModal(true);
  };

  const handleEditLecture = (lecture, topicId) => {
    setSelectedTopicId(topicId);
    setCurrentLecture(lecture);
    setShowLectureModal(true);
  };

  const handleSaveLecture = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint = currentLecture.l_id || currentLecture.L_ID ? '/api/lecture/update' : '/api/lecture/create';
      const response = await apiPost(endpoint, {
        ...currentLecture,
        t_id: selectedTopicId,
        l_id: currentLecture.l_id || currentLecture.L_ID,
      });

      const result = await response.json();

      if (result.success) {
        await loadTopics();
        setShowLectureModal(false);
        setCurrentLecture(null);
        setSelectedTopicId(null);
        showMessage('success', currentLecture.l_id || currentLecture.L_ID ? 'Lecture updated successfully!' : 'Lecture added successfully!');
      } else {
        showMessage('error', result.message || 'Failed to save lecture');
      }
    } catch (error) {
      console.error('Error saving lecture:', error);
      showMessage('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    try {
      const response = await apiPost('/api/lecture/delete', { l_id: lectureId });
      const result = await response.json();

      if (result.success) {
        await loadTopics();
        showMessage('success', 'Lecture deleted successfully!');
      } else {
        showMessage('error', result.message || 'Failed to delete lecture');
      }
    } catch (error) {
      console.error('Error deleting lecture:', error);
      showMessage('error', 'An error occurred');
    }
  };

  // Exam CRUD operations
  const handleAddExam = (topicId) => {
    setSelectedTopicId(topicId);
    setCurrentExam({ duration: '', pass_pct: '40' });
    setShowExamModal(true);
  };

  const handleEditExam = (exam, topicId) => {
    setSelectedTopicId(topicId);
    setCurrentExam(exam);
    setShowExamModal(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint = currentExam.e_id || currentExam.E_ID ? '/api/exam/update' : '/api/exam/create';
      const response = await apiPost(endpoint, {
        ...currentExam,
        t_id: selectedTopicId,
        e_id: currentExam.e_id || currentExam.E_ID,
      });

      const result = await response.json();

      if (result.success) {
        await loadTopics();
        setShowExamModal(false);
        setCurrentExam(null);
        setSelectedTopicId(null);
        showMessage('success', currentExam.e_id || currentExam.E_ID ? 'Exam updated successfully!' : 'Exam added successfully!');
      } else {
        showMessage('error', result.message || 'Failed to save exam');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      showMessage('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      const response = await apiPost('/api/exam/delete', { e_id: examId });
      const result = await response.json();

      if (result.success) {
        await loadTopics();
        showMessage('success', 'Exam deleted successfully!');
      } else {
        showMessage('error', result.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      showMessage('error', 'An error occurred');
    }
  };

  // Open delete confirmation modals
  const openTopicDeleteModal = (topic) => {
    setTopicToDelete(topic);
    setIsDeleteTopicModalOpen(true);
  };

  const handleConfirmDeleteTopic = async () => {
    if (!topicToDelete) return;
    setDeletingTopic(true);
    try {
      const t_id = topicToDelete.t_id || topicToDelete.T_ID;
      await handleDeleteTopic(t_id);
      setIsDeleteTopicModalOpen(false);
      setTopicToDelete(null);
    } finally {
      setDeletingTopic(false);
    }
  };

  const openLectureDeleteModal = (lecture) => {
    setLectureToDelete(lecture);
    setIsDeleteLectureModalOpen(true);
  };

  const handleConfirmDeleteLecture = async () => {
    if (!lectureToDelete) return;
    setDeletingLecture(true);
    try {
      const l_id = lectureToDelete.l_id || lectureToDelete.L_ID;
      await handleDeleteLecture(l_id);
      setIsDeleteLectureModalOpen(false);
      setLectureToDelete(null);
    } finally {
      setDeletingLecture(false);
    }
  };

  const openExamDeleteModal = (exam) => {
    setExamToDelete(exam);
    setIsDeleteExamModalOpen(true);
  };

  const handleConfirmDeleteExam = async () => {
    if (!examToDelete) return;
    setDeletingExam(true);
    try {
      const e_id = examToDelete.e_id || examToDelete.E_ID;
      await handleDeleteExam(e_id);
      setIsDeleteExamModalOpen(false);
      setExamToDelete(null);
    } finally {
      setDeletingExam(false);
    }
  }

  // Question CRUD operations (simplified)
  const handleManageQuestions = (examId) => {
    router.push(`/instructor/courses/${c_id}/exams/${examId}/questions`);
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <HiAcademicCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading course content...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manage Content - {course?.title} | EduX</title>
        <meta name="description" content="Manage course topics, lectures, and exams" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="py-3 flex items-center gap-2 text-sm">
              <Link href="/instructor" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <Link href={`/instructor/courses/${c_id}`} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                Course
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Manage Content</span>
            </div>

            {/* Title Row */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                  <HiCollection className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    Manage Content
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {course?.title}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/instructor/courses/${c_id}/structure`}>
                  <Button variant="outline" size="sm">
                    <HiBookOpen className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">View Structure</span>
                  </Button>
                </Link>
                <Link href={`/instructor/courses/${c_id}`}>
                  <Button variant="outline" size="sm">
                    <HiArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
              {message.type === 'success' ? (
                <HiCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <HiX className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <p className={`font-medium ${message.type === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
                }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Add Topic Button */}
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={handleAddTopic}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add New Topic
            </Button>
          </div>

          {/* Topics List */}
          {topics.length === 0 ? (
            <Card className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <HiBookOpen className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Topics Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Start by adding your first topic to organize your course content</p>
              <Button variant="primary" onClick={handleAddTopic}>
                <HiPlus className="w-5 h-5 mr-2" />
                Add First Topic
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {topics.map((topic, index) => {
                const topicId = topic.t_id || topic.T_ID;
                const isExpanded = expandedTopics[topicId];

                return (
                  <Card key={topicId} padding="none" className="overflow-hidden">
                    {/* Topic Header */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-200 dark:border-indigo-800">
                      <div className="p-6 flex items-center justify-between">
                        <button
                          onClick={() => toggleTopic(topicId)}
                          className="flex items-center gap-4 flex-1 text-left"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                              {topic.name || topic.NAME}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {topic.lectures?.length || 0} Lectures • {topic.exams?.length || 0} Exams
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTopic(topic)}
                          >
                            <HiPencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTopicDeleteModal(topic)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <HiTrash className="w-4 h-4" />
                          </Button>
                          <button
                            onClick={() => toggleTopic(topicId)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800/50">
                        {/* Lectures Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <HiVideoCamera className="w-5 h-5 text-white" />
                              </div>
                              Lectures
                            </h4>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddLecture(topicId)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <HiPlus className="w-4 h-4 mr-1" />
                              Add Lecture
                            </Button>
                          </div>

                          {topic.lectures?.length > 0 ? (
                            <div className="space-y-2">
                              {topic.lectures.map((lecture, lectureIndex) => (
                                <div
                                  key={lecture.l_id || lecture.L_ID}
                                  className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="info">{lectureIndex + 1}</Badge>
                                        <div className="min-w-0">
                                          <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {lecture.title || lecture.TITLE || lecture.description || lecture.DESCRIPTION}
                                          </p>
                                          {(lecture.description || lecture.DESCRIPTION) && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                              {lecture.description || lecture.DESCRIPTION}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        {lecture.video && (
                                          <a
                                            href={lecture.video}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 truncate hover:text-indigo-600 dark:hover:text-indigo-400"
                                            title={lecture.video}
                                          >
                                            <HiVideoCamera className="w-4 h-4" />
                                            <span className="truncate">View Video</span>
                                          </a>
                                        )}

                                        {lecture.duration && (
                                          <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
                                            ⏱️ {lecture.duration} min
                                          </span>
                                        )}

                                        {(lecture.order_num || lecture.order) && (
                                          <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
                                            #{lecture.order_num || lecture.order}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditLecture(lecture, topicId)}
                                      >
                                        <HiPencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openLectureDeleteModal(lecture)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <HiTrash className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                              <HiVideoCamera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 dark:text-gray-400">No lectures added yet</p>
                            </div>
                          )}
                        </div>

                        {/* Exams Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <HiClipboardList className="w-5 h-5 text-white" />
                              </div>
                              Exams
                            </h4>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddExam(topicId)}
                              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                            >
                              <HiPlus className="w-4 h-4 mr-1" />
                              Add Exam
                            </Button>
                          </div>

                          {topic.exams?.length > 0 ? (
                            <div className="space-y-2">
                              {topic.exams.map((exam, examIndex) => (
                                <div
                                  key={exam.e_id || exam.E_ID}
                                  className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="warning">{examIndex + 1}</Badge>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          Exam {examIndex + 1}
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span>📝 {exam.question_count || 0} Questions</span>
                                        <span>🎯 {exam.marks || 0} Marks</span>
                                        <span>⏱️ {exam.duration || 0} Minutes</span>
                                        <span>✅ Pass %: {exam.pass_pct || 0}</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleManageQuestions(exam.e_id || exam.E_ID)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                                      >
                                        <HiLightningBolt className="w-4 h-4 mr-1" />
                                        <span className="hidden sm:inline">Questions</span>
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditExam(exam, topicId)}
                                      >
                                        <HiPencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openExamDeleteModal(exam)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <HiTrash className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                              <HiClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 dark:text-gray-400">No exams added yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentTopic?.t_id || currentTopic?.T_ID ? 'Edit Topic' : 'Add New Topic'}
              </h3>
            </div>
            <form onSubmit={handleSaveTopic} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  value={currentTopic?.name || ''}
                  onChange={(e) => setCurrentTopic({ ...currentTopic, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="e.g., Introduction to React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={currentTopic?.description || ''}
                  onChange={(e) => setCurrentTopic({ ...currentTopic, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Brief description of this topic"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  {saving ? 'Saving...' : <><HiSave className="w-5 h-5 mr-2" /> Save Topic</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTopicModal(false);
                    setCurrentTopic(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lecture Modal */}
      <Modal isOpen={showLectureModal} onClose={() => { setShowLectureModal(false); setCurrentLecture(null); setSelectedTopicId(null); }} size="md">
        <ModalHeader onClose={() => { setShowLectureModal(false); setCurrentLecture(null); setSelectedTopicId(null); }}>
          {currentLecture?.l_id || currentLecture?.L_ID ? 'Edit Lecture' : 'Add New Lecture'}
        </ModalHeader>
        <form onSubmit={handleSaveLecture}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  required
                  value={currentLecture?.title || ''}
                  onChange={(e) => setCurrentLecture({ ...currentLecture, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="e.g., Introduction to Components"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lecture Description
                </label>
                <textarea
                  rows={4}
                  value={currentLecture?.description || ''}
                  onChange={(e) => setCurrentLecture({ ...currentLecture, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="Brief summary of what this lecture covers (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={currentLecture?.video || ''}
                  onChange={(e) => setCurrentLecture({ ...currentLecture, video: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paste a YouTube, Vimeo, or hosted video URL.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={currentLecture?.duration || ''}
                  onChange={(e) => setCurrentLecture({ ...currentLecture, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="30"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => { setShowLectureModal(false); setCurrentLecture(null); setSelectedTopicId(null); }} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving} className="bg-gradient-to-r from-green-600 to-emerald-600">
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <HiSave className="w-5 h-5 mr-2" />
                  Save Lecture
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentExam?.e_id || currentExam?.E_ID ? 'Edit Exam' : 'Add New Exam'}
              </h3>
            </div>
            <form onSubmit={handleSaveExam} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={currentExam?.duration || ''}
                    onChange={(e) => setCurrentExam({ ...currentExam, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pass Percentage *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={currentExam?.pass_pct || '40'}
                    onChange={(e) => setCurrentExam({ ...currentExam, pass_pct: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="40"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600"
                >
                  {saving ? 'Saving...' : <><HiSave className="w-5 h-5 mr-2" /> Save Exam</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowExamModal(false);
                    setCurrentExam(null);
                    setSelectedTopicId(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Topic Modal */}
      <Modal isOpen={isDeleteTopicModalOpen} onClose={() => setIsDeleteTopicModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setIsDeleteTopicModalOpen(false)}>
          Delete Topic
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5 12h14" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">This will delete all lectures and exams in this topic.</p>
            {topicToDelete && (
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg italic">
                "{(topicToDelete.name || topicToDelete.NAME || '').slice(0, 100)}{(topicToDelete.name || topicToDelete.NAME || '').length > 100 ? '...' : ''}"
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteTopicModalOpen(false)} disabled={deletingTopic}>Cancel</Button>
          <Button type="button" variant="primary" onClick={handleConfirmDeleteTopic} disabled={deletingTopic} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
            {deletingTopic ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <HiTrash className="w-5 h-5 mr-2" />
                Delete Topic
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Lecture Modal */}
      <Modal isOpen={isDeleteLectureModalOpen} onClose={() => setIsDeleteLectureModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setIsDeleteLectureModalOpen(false)}>
          Delete Lecture
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5 12h14" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">This action cannot be undone. The lecture will be permanently deleted.</p>
            {lectureToDelete && (
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg italic">
                "{(lectureToDelete.description || lectureToDelete.DESCRIPTION || '').slice(0, 100)}{(lectureToDelete.description || lectureToDelete.DESCRIPTION || '').length > 100 ? '...' : ''}"
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteLectureModalOpen(false)} disabled={deletingLecture}>Cancel</Button>
          <Button type="button" variant="primary" onClick={handleConfirmDeleteLecture} disabled={deletingLecture} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
            {deletingLecture ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <HiTrash className="w-5 h-5 mr-2" />
                Delete Lecture
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Exam Modal */}
      <Modal isOpen={isDeleteExamModalOpen} onClose={() => setIsDeleteExamModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setIsDeleteExamModalOpen(false)}>
          Delete Exam
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5 12h14" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">This will delete all questions in this exam.</p>
            {examToDelete && (
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg italic">
                "Exam {(examToDelete.e_id || examToDelete.E_ID)}"
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteExamModalOpen(false)} disabled={deletingExam}>Cancel</Button>
          <Button type="button" variant="primary" onClick={handleConfirmDeleteExam} disabled={deletingExam} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
            {deletingExam ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <HiTrash className="w-5 h-5 mr-2" />
                Delete Exam
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ManageCourseContent;

// Server-side authentication
export const getServerSideProps = withInstructorAuth();
