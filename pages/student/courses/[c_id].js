/**
 * Student Course Learning Page
 * Modern, attractive UI with consistent design system
 * Route: /student/courses/[c_id]
 */

import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import secureLocalStorage from "react-secure-storage";
import { apiPost } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { Card, Button, Badge } from "../../../components/ui";
import {
  HiPlay,
  HiCheckCircle,
  HiChevronDown,
  HiChevronRight,
  HiBookOpen,
  HiClipboardList,
  HiClock,
  HiAcademicCap,
  HiStar,
  HiUserGroup,
  HiArrowLeft,
  HiLockClosed,
  HiLockOpen,
  HiSparkles,
  HiChartBar,
  HiDocumentText,
  HiTrendingUp,
} from "react-icons/hi";

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-neutral-200 dark:text-neutral-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary-500 transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-neutral-800 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Topic Card Component
const TopicCard = ({ topic, lectures, exam, index, isExpanded, onToggle, c_id, totalTopics }) => {
  const completedLectures = lectures.filter(l => l.STATUS === 1).length;
  const totalLectures = lectures.length;
  const topicProgress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
  const isCompleted = completedLectures === totalLectures && totalLectures > 0;
  const hasExam = exam && exam.e_id;
  const examCompleted = exam?.STATUS === 1;

  return (
    <Card className="overflow-hidden mb-4" padding="none">
      {/* Topic Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
            isCompleted 
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
          }`}>
            {isCompleted ? <HiCheckCircle className="w-6 h-6" /> : index + 1}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-neutral-800 dark:text-white text-lg">
              {topic.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <HiBookOpen className="w-4 h-4" />
                {totalLectures} lectures
              </span>
              {hasExam && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <HiClipboardList className="w-4 h-4" />
                  Quiz
                </span>
              )}
              <Badge 
                variant={isCompleted ? "success" : topicProgress > 0 ? "warning" : "secondary"}
                size="sm"
              >
                {completedLectures}/{totalLectures} completed
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Mini progress bar */}
          <div className="hidden sm:block w-32">
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-primary-500'}`}
                style={{ width: `${topicProgress}%` }}
              />
            </div>
          </div>
          {isExpanded ? (
            <HiChevronDown className="w-6 h-6 text-neutral-400" />
          ) : (
            <HiChevronRight className="w-6 h-6 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
          {/* Lectures List */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {lectures.map((lecture, lectureIndex) => (
              <Link
                key={lecture.l_id}
                href={`/student/courses/topic/lecture/${lecture.l_id}?c_id=${c_id}&t_id=${topic.t_id}`}
              >
                <div className="p-4 pl-8 flex items-center gap-4 hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    lecture.STATUS === 1 
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400'
                  }`}>
                    {lecture.STATUS === 1 ? (
                      <HiCheckCircle className="w-5 h-5" />
                    ) : (
                      <HiPlay className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-800 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {lecture.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Lecture {lectureIndex + 1}
                      </span>
                      {lecture.video && (
                        <Badge variant="primary" size="sm">Video</Badge>
                      )}
                    </div>
                  </div>
                  <HiChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* Exam Section */}
          {hasExam && (
            <div className="p-4 pl-8 border-t border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    examCompleted
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  }`}>
                    {examCompleted ? (
                      <HiCheckCircle className="w-5 h-5" />
                    ) : (
                      <HiClipboardList className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 dark:text-white">
                      Topic Quiz
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <HiDocumentText className="w-4 h-4" />
                        {exam.question_count} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <HiClock className="w-4 h-4" />
                        {exam.duration} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <HiStar className="w-4 h-4" />
                        {exam.marks} marks
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {examCompleted && exam.exam_marks !== null && (
                    <Badge variant="success" size="md">
                      Score: {exam.exam_marks}/{exam.marks}
                    </Badge>
                  )}
                  <Link href={`/student/courses/topic/exam/${exam.e_id}`}>
                    <Button variant={examCompleted ? "outline" : "primary"} size="sm">
                      {examCompleted ? 'Retake Quiz' : 'Start Quiz'}
                    </Button>
                  </Link>
                  {examCompleted && (
                    <Link href={`/student/courses/topic/exam/result/${exam.e_id}`}>
                      <Button variant="ghost" size="sm">
                        View Results
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Exam Message */}
          {!hasExam && (
            <div className="p-4 pl-8 border-t border-neutral-200 dark:border-neutral-700 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No quiz available for this topic
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// Loading Skeleton
const CourseSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-2xl mb-8" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      ))}
    </div>
  </div>
);

export default function StudentCoursePage({ c_id }) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [content, setContent] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});

  const u_id = useMemo(() => {
    if (user?.u_id) return user.u_id;
    return secureLocalStorage.getItem("u_id");
  }, [user]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/user/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch course data
  useEffect(() => {
    if (!u_id || !c_id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course content
        const contentRes = await apiPost("/api/user_course_content", { u_id, c_id });
        const contentData = await contentRes.json();

        if (contentData && Array.isArray(contentData) && contentData.length > 0 && contentData[0]) {
          const topicsCount = contentData[0].length || 0;
          const newContent = [];
          for (let i = 0; i < topicsCount; i++) {
            const topic_content = {
              topic: contentData[0][i],
              lectures: contentData[i + 1] || [],
              exam: contentData[topicsCount + i + 1]?.[0] || { e_id: null, duration: 0, STATUS: 0 },
            };
            newContent.push(topic_content);
          }
          setContent(newContent);
          // Auto-expand first incomplete topic
          const firstIncomplete = newContent.findIndex(item => {
            const completedLectures = item.lectures.filter(l => l.STATUS === 1).length;
            return completedLectures < item.lectures.length;
          });
          if (firstIncomplete !== -1) {
            setExpandedTopics({ [firstIncomplete]: true });
          } else if (newContent.length > 0) {
            setExpandedTopics({ 0: true });
          }
        }

        // Fetch course info
        const courseRes = await apiPost("/api/selected_course", { c_id });
        const courseJson = await courseRes.json();
        if (courseJson && courseJson[0]) {
          setCourseData(courseJson[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [u_id, c_id]);

  const toggleTopic = (index) => {
    setExpandedTopics(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (content.length === 0) return 0;
    let totalLectures = 0;
    let completedLectures = 0;
    content.forEach(item => {
      totalLectures += item.lectures.length;
      completedLectures += item.lectures.filter(l => l.STATUS === 1).length;
    });
    return totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
  }, [content]);

  // Stats
  const stats = useMemo(() => {
    let totalLectures = 0;
    let completedLectures = 0;
    let totalExams = 0;
    let completedExams = 0;

    content.forEach(item => {
      totalLectures += item.lectures.length;
      completedLectures += item.lectures.filter(l => l.STATUS === 1).length;
      if (item.exam?.e_id) {
        totalExams++;
        if (item.exam.STATUS === 1) completedExams++;
      }
    });

    return {
      totalLectures,
      completedLectures,
      totalExams,
      completedExams,
      totalTopics: content.length,
    };
  }, [content]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseSkeleton />
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20 flex items-center justify-center">
        <Card className="text-center max-w-md" padding="lg">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
            Course Not Found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            The course you're looking for doesn't exist or you're not enrolled.
          </p>
          <Link href="/student">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 pt-20">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Button */}
          <Link href="/student" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <HiArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2 text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary" size="md" className="bg-white/20 text-white border-0">
                  {courseData.field || 'Technology'}
                </Badge>
                {overallProgress === 100 && (
                  <Badge variant="success" size="md" className="bg-emerald-500/20 text-emerald-300 border-0">
                    ✓ Completed
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {courseData.title}
              </h1>

              <p className="text-lg text-white/80 mb-6 leading-relaxed line-clamp-2">
                {courseData.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-white/80">
                  <HiAcademicCap className="w-5 h-5" />
                  <span>{stats.totalTopics} topics</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <HiBookOpen className="w-5 h-5" />
                  <span>{stats.totalLectures} lectures</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <HiClipboardList className="w-5 h-5" />
                  <span>{stats.totalExams} quizzes</span>
                </div>
                {courseData.rating && (
                  <div className="flex items-center gap-2 text-white/80">
                    <HiStar className="w-5 h-5 text-amber-400" />
                    <span>{courseData.rating}</span>
                  </div>
                )}
              </div>

              {/* Instructor */}
              {courseData.name && (
                <div className="flex items-center gap-3 mt-6 p-3 bg-white/10 backdrop-blur-sm rounded-xl inline-flex">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {courseData.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{courseData.name}</p>
                    <p className="text-xs text-white/60">{courseData.qualification}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20" padding="lg">
              <div className="text-center">
                <ProgressRing progress={overallProgress} />
                <h3 className="text-xl font-bold text-white mt-4">Course Progress</h3>
                <p className="text-white/70 text-sm mt-1">
                  {stats.completedLectures} of {stats.totalLectures} lectures completed
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.completedLectures}
                    </div>
                    <div className="text-xs text-white/60">Lectures Done</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats.completedExams}
                    </div>
                    <div className="text-xs text-white/60">Quizzes Passed</div>
                  </div>
                </div>

                {overallProgress === 100 && (
                  <div className="mt-6 space-y-3">
                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-3 border border-emerald-400/30">
                      <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
                        <HiCheckCircle className="w-5 h-5 animate-pulse" />
                        <span>🎉 Course Completed!</span>
                      </div>
                    </div>
                    <Link href={`/certificate/${c_id}/${u_id}`} className="block">
                      <button className="w-full relative overflow-hidden group py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-amber-900 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transform hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <div className="relative flex items-center justify-center gap-2">
                          <HiSparkles className="w-6 h-6 animate-bounce" />
                          <span>Get Your Certificate</span>
                          <HiSparkles className="w-6 h-6 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Content - Left */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                <HiBookOpen className="w-7 h-7 text-primary-500" />
                Course Content
              </h2>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {stats.completedLectures}/{stats.totalLectures} completed
              </span>
            </div>

            {content.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">
                  No Content Yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Course content is being prepared. Check back soon!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {content.map((item, index) => (
                  <TopicCard
                    key={item.topic.t_id}
                    topic={item.topic}
                    lectures={item.lectures}
                    exam={item.exam}
                    index={index}
                    isExpanded={expandedTopics[index]}
                    onToggle={() => toggleTopic(index)}
                    c_id={c_id}
                    totalTopics={content.length}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <Card>
              <h3 className="font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                <HiChartBar className="w-5 h-5 text-primary-500" />
                Your Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600 dark:text-neutral-400">Lectures</span>
                    <span className="font-medium text-neutral-800 dark:text-white">
                      {stats.completedLectures}/{stats.totalLectures}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${stats.totalLectures > 0 ? (stats.completedLectures / stats.totalLectures) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600 dark:text-neutral-400">Quizzes</span>
                    <span className="font-medium text-neutral-800 dark:text-white">
                      {stats.completedExams}/{stats.totalExams}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${stats.totalExams > 0 ? (stats.completedExams / stats.totalExams) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Course Info Card */}
            <Card>
              <h3 className="font-bold text-neutral-800 dark:text-white mb-4">
                Course Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <HiAcademicCap className="w-5 h-5 text-primary-500" />
                  <span>{stats.totalTopics} topics</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <HiBookOpen className="w-5 h-5 text-primary-500" />
                  <span>{stats.totalLectures} video lectures</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <HiClipboardList className="w-5 h-5 text-primary-500" />
                  <span>{stats.totalExams} quizzes</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <HiUserGroup className="w-5 h-5 text-primary-500" />
                  <span>{courseData.student_count || 0} students enrolled</span>
                </div>
              </div>
            </Card>

            {/* Continue Learning CTA */}
            {content.length > 0 && (
              <Card className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-primary-100 dark:border-primary-800">
                <div className="text-center">
                  <HiTrendingUp className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                  <h3 className="font-bold text-neutral-800 dark:text-white mb-2">
                    Keep Learning!
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    You're making great progress. Continue where you left off.
                  </p>
                  {(() => {
                    // Find first incomplete lecture
                    for (const item of content) {
                      const incompleteLecture = item.lectures.find(l => l.STATUS === 0);
                      if (incompleteLecture) {
                        return (
                          <Link href={`/student/courses/topic/lecture/${incompleteLecture.l_id}?c_id=${c_id}&t_id=${item.topic.t_id}`}>
                            <Button variant="primary" size="md" className="w-full">
                              <HiPlay className="w-5 h-5 mr-2" />
                              Continue Learning
                            </Button>
                          </Link>
                        );
                      }
                    }
                    return (
                      <Button variant="primary" size="md" className="w-full" disabled>
                        <HiCheckCircle className="w-5 h-5 mr-2" />
                        All Completed!
                      </Button>
                    );
                  })()}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { c_id } = params;
  return { props: { c_id } };
};
