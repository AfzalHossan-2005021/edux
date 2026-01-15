/**
 * Student Exam Result Page
 * Modern, attractive UI for displaying exam results
 * Route: /student/courses/topic/exam/result/[e_id]
 */

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import secureLocalStorage from "react-secure-storage";
import { apiPost } from "../../../../../../lib/api";
import { useAuth } from "../../../../../../context/AuthContext";
import { useRouter } from "next/router";
import { Card, Button, Badge } from "../../../../../../components/ui";
import {
  HiCheckCircle,
  HiXCircle,
  HiAcademicCap,
  HiArrowLeft,
  HiDocumentText,
  HiChartBar,
  HiStar,
  HiTrendingUp,
  HiTrendingDown,
  HiLightningBolt,
  HiRefresh,
  HiEye,
  HiSparkles,
  HiClipboardList,
} from "react-icons/hi";

// Circular Progress Component
const CircularProgress = ({ percentage, size = 180, strokeWidth = 12, isPassing }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 80) return { stroke: '#10b981', bg: '#d1fae5', text: 'text-emerald-500' };
    if (percentage >= 60) return { stroke: '#3b82f6', bg: '#dbeafe', text: 'text-blue-500' };
    if (percentage >= 40) return { stroke: '#f59e0b', bg: '#fef3c7', text: 'text-amber-500' };
    return { stroke: '#ef4444', bg: '#fee2e2', text: 'text-red-500' };
  };
  
  const colors = getColor();

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
          style={{ stroke: colors.stroke }}
          className="transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${colors.text}`}>
          {Math.round(percentage)}%
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Score</span>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-neutral-800 dark:text-white">
          {value}
          {subValue && <span className="text-sm font-normal text-neutral-500 ml-1">{subValue}</span>}
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
      </div>
    </div>
  );
};

// Loading Skeleton
const ResultSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-2xl mb-6" />
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      ))}
    </div>
    <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
  </div>
);

const ViewResult = ({ e_id }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  // Check authentication and role
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/user/login');
      return;
    }
    
    if (!authLoading && user && user.role !== 'student' && !user.isStudent) {
      if (user.role === 'instructor' || user.isInstructor) {
        router.push('/instructor');
      } else if (user.role === 'admin' || user.isAdmin) {
        router.push('/admin');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!e_id) return;
    
    const s_id = user?.u_id || secureLocalStorage.getItem("u_id");
    if (!s_id) return;
    
    apiPost("/api/exam/result", { s_id, e_id })
      .then((res) => res.json())
      .then((json_res) => {
        setData(json_res[0] || {});
      })
      .catch((error) => {
        console.error('Error fetching exam result:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [e_id, user]);

  // Calculate derived values
  const results = useMemo(() => {
    const fullMarks = data.FULL_MARK || 0;
    const obtainedMarks = data.OBTAINED_MARK || 0;
    const percentage = fullMarks > 0 ? (obtainedMarks / fullMarks) * 100 : 0;
    const isPassing = data.status !== 'f';
    const correctAnswers = data.CORRECT_ANSWER || 0;
    const wrongAnswers = data.WRONG_ANSWER || 0;
    const totalQuestions = data.question_count || 0;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      fullMarks,
      obtainedMarks,
      percentage,
      isPassing,
      correctAnswers,
      wrongAnswers,
      totalQuestions,
      accuracy,
    };
  }, [data]);

  // Get grade based on percentage
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', label: 'Excellent!', color: 'emerald' };
    if (percentage >= 80) return { grade: 'A', label: 'Great Job!', color: 'emerald' };
    if (percentage >= 70) return { grade: 'B', label: 'Good Work!', color: 'blue' };
    if (percentage >= 60) return { grade: 'C', label: 'Keep Improving!', color: 'amber' };
    if (percentage >= 50) return { grade: 'D', label: 'Needs Work', color: 'amber' };
    return { grade: 'F', label: 'Try Again', color: 'red' };
  };

  const gradeInfo = getGrade(results.percentage);

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ResultSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </button>

        {/* Main Result Card */}
        <Card padding="none" className="overflow-hidden mb-6">
          {/* Header with Grade */}
          <div className={`p-8 text-center ${
            results.isPassing 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          } text-white`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              {results.isPassing ? (
                <HiCheckCircle className="w-8 h-8" />
              ) : (
                <HiXCircle className="w-8 h-8" />
              )}
              <span className="text-xl font-semibold">
                {results.isPassing ? 'Congratulations!' : 'Better Luck Next Time'}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-2">
              {results.isPassing ? 'You Passed!' : 'You Did Not Pass'}
            </h1>
            <p className="text-white/80">
              Quiz #{e_id} Result
            </p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center -mt-16 mb-6 relative z-10">
            <div className="bg-white dark:bg-neutral-800 rounded-full p-3 shadow-xl">
              <CircularProgress 
                percentage={results.percentage} 
                isPassing={results.isPassing}
              />
            </div>
          </div>

          {/* Grade Badge */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
              gradeInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              gradeInfo.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              gradeInfo.color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <HiStar className="w-5 h-5" />
              <span className="text-2xl font-bold">{gradeInfo.grade}</span>
              <span className="text-sm font-medium">- {gradeInfo.label}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                icon={HiAcademicCap}
                label="Obtained Marks"
                value={results.obtainedMarks}
                subValue={`/ ${results.fullMarks}`}
                color="indigo"
              />
              <StatCard
                icon={HiClipboardList}
                label="Total Questions"
                value={results.totalQuestions}
                color="primary"
              />
              <StatCard
                icon={HiCheckCircle}
                label="Correct Answers"
                value={results.correctAnswers}
                color="emerald"
              />
              <StatCard
                icon={HiXCircle}
                label="Wrong Answers"
                value={results.wrongAnswers}
                color="red"
              />
            </div>

            {/* Accuracy Bar */}
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Accuracy
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-white">
                  {Math.round(results.accuracy)}%
                </span>
              </div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    results.accuracy >= 70 ? 'bg-emerald-500' :
                    results.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${results.accuracy}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/student/courses/topic/exam/answer/${e_id}`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  <HiEye className="w-5 h-5 mr-2" />
                  View Answers
                </Button>
              </Link>
              <Link href={`/student/courses/topic/exam/${e_id}`} className="flex-1">
                <Button variant="primary" size="lg" className="w-full">
                  <HiRefresh className="w-5 h-5 mr-2" />
                  Retake Quiz
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-primary-100 dark:border-primary-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <HiLightningBolt className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800 dark:text-white mb-2">
                {results.isPassing ? 'Great Performance!' : 'Tips for Improvement'}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {results.isPassing 
                  ? 'You\'ve demonstrated good understanding of the material. Keep up the excellent work and continue reviewing to maintain your knowledge!'
                  : 'Don\'t be discouraged! Review the lecture materials, focus on the topics you found challenging, and try again. Practice makes perfect!'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewResult;

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { e_id } = params;
  return { props: { e_id } };
};
