/**
 * Instructor - View Course Structure
 * URL: /instructor/courses/[c_id]/structure
 * View complete course structure, topics, lectures, and exams
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost, apiGet } from '@/lib/api';
import { withInstructorAuth } from '@/lib/auth/withServerSideAuth';
import { Card, Button, Badge } from '@/components/ui';
import {
  HiArrowLeft,
  HiAcademicCap,
  HiChevronRight,
  HiBookOpen,
  HiVideoCamera,
  HiClipboardList,
  HiChevronDown,
  HiChevronUp,
  HiPencil,
  HiCollection,
  HiPlay,
  HiDocumentText,
  HiClock,
  HiCheckCircle,
} from 'react-icons/hi';

function CourseStructure({ serverUser }) {
  const router = useRouter();
  const { c_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalLectures: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalDuration: 0,
  });
  const [expandedTopics, setExpandedTopics] = useState({});

  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  useEffect(() => {
    if (c_id && u_id) {
      loadCourseStructure();
    }
  }, [c_id, u_id]);

  const loadCourseStructure = async () => {
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
      console.error('Error loading course structure:', error);
      router.push('/instructor');
    }
  };

  const loadTopics = async () => {
    try {
      const response = await apiGet(`/api/course/topics?c_id=${c_id}`);
      const data = await response.json();
      
      if (data.success && data.topics) {
        // Load lectures and exams for each topic
        const topicsWithContent = await Promise.all(
          data.topics.map(async (topic) => {
            const topicId = topic.t_id || topic.T_ID;
            
            const [lecturesRes, examsRes] = await Promise.all([
              apiGet(`/api/topic/lectures?t_id=${topicId}`),
              apiGet(`/api/topic/exams?t_id=${topicId}`),
            ]);
            
            const lecturesData = await lecturesRes.json();
            const examsData = await examsRes.json();
            
            // Load questions for each exam
            const examsWithQuestions = await Promise.all(
              (examsData.exams || []).map(async (exam) => {
                try {
                  const questionsRes = await apiGet(`/api/exam/questions?e_id=${exam.e_id || exam.E_ID}`);
                  const questionsData = await questionsRes.json();
                  return {
                    ...exam,
                    questions: questionsData.questions || [],
                  };
                } catch (err) {
                  return { ...exam, questions: [] };
                }
              })
            );
            
            return {
              ...topic,
              lectures: lecturesData.lectures || [],
              exams: examsWithQuestions || [],
            };
          })
        );
        
        setTopics(topicsWithContent);
        
        // Calculate statistics
        const totalTopics = topicsWithContent.length;
        const totalLectures = topicsWithContent.reduce((sum, t) => sum + (t.lectures?.length || 0), 0);
        const totalExams = topicsWithContent.reduce((sum, t) => sum + (t.exams?.length || 0), 0);
        const totalQuestions = topicsWithContent.reduce((sum, t) => 
          sum + (t.exams?.reduce((qSum, e) => qSum + (e.questions?.length || 0), 0) || 0), 0
        );
        const totalDuration = topicsWithContent.reduce((sum, t) => 
          sum + (t.lectures?.reduce((dSum, l) => dSum + (parseInt(l.duration) || 0), 0) || 0) + (t.exams?.reduce((dSum, e) => dSum + (parseInt(e.duration) || 0), 0) || 0), 0
        );
        
        setStats({
          totalTopics,
          totalLectures,
          totalExams,
          totalQuestions,
          totalDuration,
        });
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <HiCollection className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading course structure...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mx-auto mb-4">
            <HiAcademicCap className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 text-center mb-2">Course Not Found</h2>
          <p className="text-red-800 dark:text-red-300 text-center mb-6">Unable to load course structure.</p>
          <Link href="/instructor">
            <Button variant="primary" className="w-full">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, icon: Icon, gradient }) => (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-6 text-white shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className="text-sm text-white/80 font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Course Structure - {course.title} | EduX</title>
        <meta name="description" content="View complete course structure and content" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="py-3 flex items-center gap-2 text-sm">
              <Link href="/instructor" className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors">
                Dashboard
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <Link href={`/instructor/courses/${c_id}`} className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors">
                Course
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">Structure</span>
            </div>

            {/* Title Row */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                  <HiCollection className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    Course Structure
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {course.title}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/instructor/courses/${c_id}/manage-content`}>
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <HiPencil className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit Content</span>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Statistics */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <HiCheckCircle className="w-6 h-6 text-white" />
              </div>
              Course Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                title="Topics"
                value={stats.totalTopics}
                icon={HiBookOpen}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              />
              <StatCard
                title="Lectures"
                value={stats.totalLectures}
                icon={HiVideoCamera}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard
                title="Exams"
                value={stats.totalExams}
                icon={HiClipboardList}
                gradient="bg-gradient-to-br from-orange-500 to-red-600"
              />
              <StatCard
                title="Questions"
                value={stats.totalQuestions}
                icon={HiDocumentText}
                gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              />
              <StatCard
                title="Duration"
                value={formatDuration(stats.totalDuration)}
                subtitle="Total content"
                icon={HiClock}
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              />
            </div>
          </div>

          {/* Course Content */}
          {topics.length === 0 ? (
            <Card className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <HiBookOpen className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Content Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">This course doesn't have any topics or content yet.</p>
              <Link href={`/instructor/courses/${c_id}/manage-content`}>
                <Button variant="primary" className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <HiPencil className="w-5 h-5 mr-2" />
                  Add Content
                </Button>
              </Link>
            </Card>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <HiBookOpen className="w-6 h-6 text-white" />
                </div>
                Course Content
              </h2>
              <div className="space-y-4">
                {topics.map((topic, topicIndex) => {
                  const topicId = topic.t_id || topic.T_ID;
                  const isExpanded = expandedTopics[topicId];
                  
                  return (
                    <Card key={topicId} padding="none" className="overflow-hidden">
                      {/* Topic Header */}
                      <button
                        onClick={() => toggleTopic(topicId)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 text-left">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                            {topicIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                              {topic.name || topic.NAME}
                            </h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <HiVideoCamera className="w-4 h-4" />
                                {topic.lectures?.length || 0} Lectures
                              </span>
                              <span className="flex items-center gap-1">
                                <HiClipboardList className="w-4 h-4" />
                                {topic.exams?.length || 0} Exams
                              </span>
                              {topic.lectures?.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <HiClock className="w-4 h-4" />
                                  {formatDuration(topic.lectures.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 ml-4">
                          {isExpanded ? <HiChevronUp className="w-6 h-6" /> : <HiChevronDown className="w-6 h-6" />}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-6 bg-gray-50 dark:bg-gray-800/50">
                          {topic.description && (
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <p className="text-gray-700 dark:text-gray-300">{topic.description}</p>
                            </div>
                          )}

                          {/* Lectures */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <HiPlay className="w-5 h-5 text-white" />
                              </div>
                              Lectures ({topic.lectures?.length || 0})
                            </h4>
                            
                            {topic.lectures?.length > 0 ? (
                              <div className="space-y-3">
                                {topic.lectures.map((lecture, lectureIndex) => (
                                  <div
                                    key={lecture.l_id || lecture.L_ID}
                                    className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-green-700 dark:text-green-400 font-bold">{lectureIndex + 1}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                          {lecture.description || lecture.DESCRIPTION}
                                        </h5>
                                        <div className="flex flex-wrap gap-3 text-sm">
                                          {lecture.video && (
                                            <Badge variant="info" className="flex items-center gap-1">
                                              <HiPlay className="w-3 h-3" />
                                              Video Available
                                            </Badge>
                                          )}
                                          {lecture.duration && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                              <HiClock className="w-3 h-3" />
                                              {lecture.duration} min
                                            </Badge>
                                          )}
                                          {lecture.order_num && (
                                            <Badge variant="secondary">
                                              Order: {lecture.order_num}
                                            </Badge>
                                          )}
                                        </div>
                                        {lecture.video && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                                            🔗 {lecture.video}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <HiVideoCamera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">No lectures in this topic</p>
                              </div>
                            )}
                          </div>

                          {/* Exams */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <HiClipboardList className="w-5 h-5 text-white" />
                              </div>
                              Exams ({topic.exams?.length || 0})
                            </h4>
                            
                            {topic.exams?.length > 0 ? (
                              <div className="space-y-3">
                                {topic.exams.map((exam, examIndex) => (
                                  <div
                                    key={exam.e_id || exam.E_ID}
                                    className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center flex-shrink-0">
                                          <span className="text-orange-700 dark:text-orange-400 font-bold">{examIndex + 1}</span>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-gray-900 dark:text-white">
                                            Exam {examIndex + 1}
                                          </h5>
                                          <Badge variant="warning" className="mt-1">
                                            {exam.questions?.length || 0} Questions
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                      <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Marks</p>
                                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{exam.marks || 0}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pass Marks</p>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{exam.pass_marks || 0}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{exam.duration || 0}m</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Questions</p>
                                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{exam.questions?.length || 0}</p>
                                      </div>
                                    </div>

                                    {exam.questions?.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Questions:</p>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                          {exam.questions.map((question, qIndex) => (
                                            <div
                                              key={question.q_id || question.Q_ID}
                                              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
                                            >
                                              <div className="flex gap-2">
                                                <Badge variant="secondary" className="flex-shrink-0">Q{qIndex + 1}</Badge>
                                                <p className="text-gray-700 dark:text-gray-300 flex-1">
                                                  {question.question || question.QUESTION}
                                                </p>
                                              </div>
                                              {question.marks && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-12">
                                                  Marks: {question.marks}
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <HiClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">No exams in this topic</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CourseStructure;

// Server-side authentication
export const getServerSideProps = withInstructorAuth();
