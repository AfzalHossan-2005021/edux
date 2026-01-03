/**
 * Exam Answers Review Page
 * Modern, attractive UI for reviewing exam answers
 * Route: /student/courses/topic/exam/answer/[e_id]
 * 
 * Only accessible after taking the exam
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import secureLocalStorage from "react-secure-storage";
import { apiPost } from "../../../../../../lib/api";
import { useAuth } from "../../../../../../context/AuthContext";
import { useRouter } from "next/router";
import { Card, Button, Badge } from "../../../../../../components/ui";
import {
  HiCheckCircle,
  HiXCircle,
  HiArrowLeft,
  HiAcademicCap,
  HiClipboardList,
  HiLightBulb,
  HiBookOpen,
  HiChevronDown,
  HiChevronUp,
  HiLockClosed,
  HiRefresh,
  HiDocumentText,
} from "react-icons/hi";

// Answer Option Component
const AnswerOption = ({ letter, text, isCorrect }) => {
  const getStyles = () => {
    if (isCorrect) {
      return 'bg-emerald-50 border-2 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-400';
    }
    return 'bg-neutral-50 border-2 border-transparent dark:bg-neutral-800';
  };

  const getLetterStyles = () => {
    if (isCorrect) {
      return 'bg-emerald-500 text-white';
    }
    return 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400';
  };

  return (
    <div className={`p-4 rounded-xl flex items-center gap-4 transition-all ${getStyles()}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getLetterStyles()}`}>
        {letter}
      </div>
      <span className={`flex-1 ${isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-neutral-700 dark:text-neutral-300'}`}>
        {text}
      </span>
      {isCorrect && (
        <HiCheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
      )}
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, index, isExpanded, onToggle }) => {
  const options = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d },
  ];

  const correctAnswer = question.right_ans;

  return (
    <Card className="overflow-hidden mb-4" padding="none">
      {/* Question Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
            {question.serial || index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white text-lg line-clamp-1">
              {question.q_description}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="success" size="sm">
                Answer: {correctAnswer}
              </Badge>
              <Badge variant="secondary" size="sm">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <HiChevronUp className="w-6 h-6 text-neutral-400" />
          ) : (
            <HiChevronDown className="w-6 h-6 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-5 bg-neutral-50 dark:bg-neutral-850">
          {/* Full Question */}
          <div className="mb-4 p-4 bg-white dark:bg-neutral-800 rounded-xl">
            <h4 className="font-medium text-neutral-800 dark:text-white mb-2">Question:</h4>
            <p className="text-neutral-700 dark:text-neutral-300">{question.q_description}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <AnswerOption
                key={option.letter}
                letter={option.letter}
                text={option.text}
                isCorrect={option.letter === correctAnswer}
              />
            ))}
          </div>

          {/* Explanation Card */}
          <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="flex items-start gap-3">
              <HiLightBulb className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-neutral-800 dark:text-white text-sm mb-1">
                  Correct Answer: {correctAnswer}
                </h5>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  The correct option is "{options.find(o => o.letter === correctAnswer)?.text}".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Loading Skeleton
const AnswersSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-2xl mb-6" />
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      ))}
    </div>
  </div>
);

// Not Taken Exam Screen
const NotTakenScreen = ({ e_id }) => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20 flex items-center justify-center">
    <Card className="text-center max-w-md" padding="lg">
      <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
        <HiLockClosed className="w-10 h-10 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
        Exam Not Taken Yet
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        You need to complete this exam at least once before you can view the answers and explanations.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/student/courses/topic/exam/${e_id}`} className="flex-1">
          <Button variant="primary" size="lg" className="w-full">
            <HiClipboardList className="w-5 h-5 mr-2" />
            Take Exam Now
          </Button>
        </Link>
      </div>
    </Card>
  </div>
);

const Answer = ({ e_id }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasTaken, setHasTaken] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandAll, setExpandAll] = useState(false);

  // Check authentication
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

  // Fetch exam answers
  useEffect(() => {
    if (!e_id) return;
    
    const s_id = user?.u_id || secureLocalStorage.getItem("u_id");
    if (!s_id) return;
    
    apiPost("/api/exam_answers", { s_id, e_id })
      .then((res) => res.json())
      .then((json_res) => {
        if (json_res.hasTaken === false) {
          setHasTaken(false);
        } else if (json_res.success) {
          setData(json_res);
          // Auto-expand first question
          if (json_res.questions?.length > 0) {
            setExpandedQuestions({ 0: true });
          }
        } else {
          setError(json_res.message || 'Failed to load answers');
        }
      })
      .catch((error) => {
        console.error('Error fetching exam answers:', error);
        setError('Failed to load exam answers');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [e_id, user]);

  // Toggle question expansion
  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Toggle all questions
  const toggleAllQuestions = () => {
    if (expandAll) {
      setExpandedQuestions({});
    } else {
      const allExpanded = {};
      data?.questions?.forEach((_, index) => {
        allExpanded[index] = true;
      });
      setExpandedQuestions(allExpanded);
    }
    setExpandAll(!expandAll);
  };

  // Show loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnswersSkeleton />
        </div>
      </div>
    );
  }

  // Not taken exam yet
  if (!hasTaken) {
    return <NotTakenScreen e_id={e_id} />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20 flex items-center justify-center">
        <Card className="text-center max-w-md" padding="lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
            Error Loading Answers
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
          <Button variant="primary" onClick={() => router.back()}>
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const { exam, studentResult, questions } = data || {};
  const percentage = exam?.totalMarks > 0 
    ? Math.round((studentResult?.obtainedMarks / exam.totalMarks) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>Back to Results</span>
        </button>

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden" padding="none">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <HiBookOpen className="w-6 h-6" />
              <span className="text-white/80">{exam?.courseTitle}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {exam?.topicName || `Quiz #${e_id}`} - Answer Key
            </h1>
            <p className="text-white/70">
              Review the correct answers and learn from your mistakes
            </p>
          </div>

          {/* Score Summary */}
          <div className="p-6 bg-white dark:bg-neutral-800">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl ${
                  studentResult?.status !== 'f' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {percentage}%
                </div>
                <div>
                  <div className="text-lg font-semibold text-neutral-800 dark:text-white">
                    Your Score
                  </div>
                  <div className="text-sm text-neutral-500">
                    {studentResult?.obtainedMarks} / {exam?.totalMarks} marks
                  </div>
                </div>
              </div>

              <div className="h-12 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center">
                  <HiDocumentText className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-neutral-800 dark:text-white">
                    {questions?.length || 0}
                  </div>
                  <div className="text-sm text-neutral-500">Questions</div>
                </div>
              </div>

              <div className="ml-auto">
                <Badge 
                  variant={studentResult?.status !== 'f' ? 'success' : 'error'} 
                  size="lg"
                >
                  {studentResult?.status !== 'f' ? 'Passed' : 'Failed'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white flex items-center gap-2">
            <HiClipboardList className="w-6 h-6 text-primary-500" />
            Questions & Answers
          </h2>
          <Button variant="ghost" size="sm" onClick={toggleAllQuestions}>
            {expandAll ? 'Collapse All' : 'Expand All'}
            {expandAll ? <HiChevronUp className="w-4 h-4 ml-1" /> : <HiChevronDown className="w-4 h-4 ml-1" />}
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions?.map((question, index) => (
            <QuestionCard
              key={question.q_id || index}
              question={question}
              index={index}
              isExpanded={expandedQuestions[index]}
              onToggle={() => toggleQuestion(index)}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href={`/student/courses/topic/exam/result/${e_id}`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <HiAcademicCap className="w-5 h-5 mr-2" />
              View Results Summary
            </Button>
          </Link>
          <Link href={`/student/courses/topic/exam/${e_id}`} className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              <HiRefresh className="w-5 h-5 mr-2" />
              Retake Quiz
            </Button>
          </Link>
        </div>

        {/* Study Tips Card */}
        <Card className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <HiLightBulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800 dark:text-white mb-2">
                Study Tips
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                <li>• Review questions you got wrong and understand why the correct answer is right</li>
                <li>• Go back to the lecture materials for topics you found challenging</li>
                <li>• Take notes on key concepts and formulas</li>
                <li>• Practice similar questions to reinforce your understanding</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Answer;

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { e_id } = params;
  return { props: { e_id } };
};
