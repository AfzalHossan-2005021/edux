/**
 * Student Exam Page
 * Modern, attractive UI for taking exams
 * Route: /student/courses/topic/exam/[e_id]
 */

import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "../../../../../context/AuthContext";
import { Card, Button, Badge } from "../../../../../components/ui";
import {
  HiClipboardList,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiArrowLeft,
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
  HiExclamationCircle,
  HiLightningBolt,
  HiAcademicCap,
  HiDocumentText,
  HiCheck,
} from "react-icons/hi";

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { e_id } = params;
  return { props: { e_id } };
};

// Timer Component
const ExamTimer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 60;
  const isCritical = timeLeft < 30;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${isCritical
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
        : isLowTime
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
      }`}>
      <HiClock className="w-5 h-5" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

// Progress Ring Component  
const ProgressRing = ({ progress, size = 60, strokeWidth = 4 }) => {
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
          className="text-primary-500 transition-all duration-300 ease-out"
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
        <span className="text-sm font-bold text-neutral-800 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Question Navigation Button
const QuestionNavButton = ({ number, status, isCurrent, onClick }) => {
  const getStyles = () => {
    if (isCurrent) {
      return 'bg-primary-500 text-white ring-2 ring-primary-300 ring-offset-2 dark:ring-offset-neutral-900';
    }
    if (status === 'answered') {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
    return 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700';
  };

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${getStyles()}`}
    >
      {number}
    </button>
  );
};

// Question Card Component
const QuestionCard = ({ question, index, totalQuestions, selectedOption, onOptionSelect }) => {
  const options = [
    { key: 'option_a', letter: 'A', value: question.option_a },
    { key: 'option_b', letter: 'B', value: question.option_b },
    { key: 'option_c', letter: 'C', value: question.option_c },
    { key: 'option_d', letter: 'D', value: question.option_d },
  ];

  return (
    <Card className="overflow-hidden" padding="none">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="primary" size="md">
            Question {question.serial || index + 1} of {totalQuestions}
          </Badge>
          <Badge variant="secondary" size="sm">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white leading-relaxed">
          {question.q_description}
        </h2>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {options.map((option, optionIndex) => {
          const isSelected = selectedOption === optionIndex + 1;

          return (
            <button
              key={option.key}
              onClick={() => onOptionSelect(index, optionIndex + 1)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 group ${isSelected
                  ? 'bg-primary-50 border-2 border-primary-500 dark:bg-primary-900/20 dark:border-primary-400'
                  : 'bg-neutral-50 border-2 border-transparent hover:bg-neutral-100 hover:border-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 dark:hover:border-neutral-600'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-600 group-hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-400 dark:group-hover:bg-neutral-600'
                }`}>
                {option.letter}
              </div>
              <span className={`flex-1 text-base ${isSelected
                  ? 'text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-neutral-700 dark:text-neutral-300'
                }`}>
                {option.value}
              </span>
              {isSelected && (
                <HiCheckCircle className="w-6 h-6 text-primary-500 dark:text-primary-400" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// Loading Skeleton
const ExamSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-48 mb-6" />
    <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl mb-6" />
    <div className="flex gap-3">
      <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex-1" />
      <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex-1" />
    </div>
  </div>
);

// Confirm Submit Modal
const ConfirmSubmitModal = ({ isOpen, onClose, onConfirm, answeredCount, totalCount }) => {
  if (!isOpen) return null;

  const unanswered = totalCount - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md w-full" padding="lg">
        <div className="text-center">
          {unanswered > 0 ? (
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <HiExclamationCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}

          <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
            {unanswered > 0 ? 'Submit with Unanswered Questions?' : 'Ready to Submit?'}
          </h3>

          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {unanswered > 0
              ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`
              : 'You have answered all questions. Submit your exam now?'
            }
          </p>

          <div className="flex items-center justify-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {answeredCount}
              </div>
              <div className="text-xs text-neutral-500">Answered</div>
            </div>
            <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {unanswered}
              </div>
              <div className="text-xs text-neutral-500">Unanswered</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Review Answers
            </Button>
            <Button variant="primary" onClick={onConfirm} className="flex-1">
              Submit Exam
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function StudentExamPage({ e_id }) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const s_id = user?.u_id || secureLocalStorage.getItem("u_id");

  const [questions, setQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examDuration] = useState(30); // 30 minutes default

  // Check authentication and role
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/student/login');
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

    apiGet(`/api/exam/questions?e_id=${e_id}`)
      .then((res) => res.json())
      .then((json_res) => {
        if (json_res.success) {
          if (Array.isArray(json_res.questions)) {
            setQuestions(json_res.questions);
            setSelectedOptions(new Array(json_res.questions.length).fill(null));
          }
        } else {
          throw new Error(json_res.error || 'Failed to load exam');
        }
      })
      .catch((error) => {
        console.error('Error fetching exam questions:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [e_id]);

  const handleOptionSelect = (questionIndex, option) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[questionIndex] = option;
    setSelectedOptions(updatedOptions);
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    let newScore = 0;

    const indexToLetter = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };

    for (let i = 0; i < questions.length; i++) {
      // Normalize selected and correct answers to indices (1-4) so both 'A'/'B' and '1'/'2' formats work
      const rawSelected = selectedOptions[i];
      const rawCorrect = questions[i].right_ans;

      // Derive numeric index for correct answer
      let correctIndex = null;
      if (typeof rawCorrect === 'number') {
        correctIndex = rawCorrect;
      } else if (typeof rawCorrect === 'string') {
        const t = rawCorrect.trim();
        if (/^[A-D]$/i.test(t)) {
          correctIndex = { A: 1, B: 2, C: 3, D: 4 }[t.toUpperCase()];
        } else if (/^[1-4]$/.test(t)) {
          correctIndex = parseInt(t, 10);
        } else {
          const p = parseInt(t, 10);
          correctIndex = Number.isNaN(p) ? null : p;
        }
      }

      console.log('Question', i + 1, 'Selected:', rawSelected, 'Correct(raw):', rawCorrect, 'Correct(index):', correctIndex);

      if (rawSelected != null && correctIndex != null && Number(rawSelected) === Number(correctIndex)) {
        newScore += (questions[i].marks || 0);
      }
    }
    console.log('Total Score:', newScore);

    try {
      await apiPost("/api/exam/update_mark", { s_id, e_id, score: newScore });
      router.replace(`/student/courses/topic/exam/result/${e_id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      setIsSubmitting(false);
    }
  }, [questions, selectedOptions, s_id, e_id, router]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  // Progress calculation
  const answeredCount = useMemo(() => {
    return selectedOptions.filter(opt => opt !== null).length;
  }, [selectedOptions]);

  const progressPercentage = useMemo(() => {
    return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  }, [answeredCount, questions.length]);

  const totalMarks = useMemo(() => {
    return questions.reduce((acc, q) => acc + (q.marks || 1), 0);
  }, [questions]);

  // Navigation
  const goToQuestion = (index) => {
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExamSkeleton />
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20 flex items-center justify-center">
        <Card className="text-center max-w-md" padding="lg">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
            No Questions Found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            This exam doesn't have any questions yet.
          </p>
          <Button variant="primary" onClick={() => router.back()}>
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Start Exam Screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card padding="none" className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-white text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <HiClipboardList className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Ready to Begin?</h1>
              <p className="text-white/80">Quiz #{e_id}</p>
            </div>

            {/* Info */}
            <div className="p-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <HiDocumentText className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {questions.length}
                  </div>
                  <div className="text-sm text-neutral-500">Questions</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <HiClock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {examDuration}
                  </div>
                  <div className="text-sm text-neutral-500">Minutes</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <HiAcademicCap className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {totalMarks}
                  </div>
                  <div className="text-sm text-neutral-500">Total Marks</div>
                </div>
              </div>

              <div className="space-y-3 mb-8 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <HiExclamationCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>Once you start, the timer cannot be paused. Make sure you have enough time to complete the exam.</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <HiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>You can navigate between questions and change your answers before submitting.</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()} className="flex-1">
                  <HiArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </Button>
                <Button variant="primary" onClick={() => setExamStarted(true)} className="flex-1">
                  <HiLightningBolt className="w-5 h-5 mr-2" />
                  Start Exam
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      {/* Sticky Header */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ProgressRing progress={progressPercentage} />
              <div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Progress</div>
                <div className="font-semibold text-neutral-800 dark:text-white">
                  {answeredCount} / {questions.length} answered
                </div>
              </div>
            </div>
            <ExamTimer duration={examDuration} onTimeUp={handleTimeUp} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question */}
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              totalQuestions={questions.length}
              selectedOption={selectedOptions[currentIndex]}
              onOptionSelect={handleOptionSelect}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                <HiChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button variant="primary" onClick={goNext}>
                  Next
                  <HiChevronRight className="w-5 h-5 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Exam
                      <HiCheck className="w-5 h-5 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-36">
              <h3 className="font-semibold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                <HiClipboardList className="w-5 h-5 text-primary-500" />
                Questions
              </h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2 mb-4">
                {questions.map((_, index) => (
                  <QuestionNavButton
                    key={index}
                    number={index + 1}
                    status={selectedOptions[index] !== null ? 'answered' : 'unanswered'}
                    isCurrent={currentIndex === index}
                    onClick={() => goToQuestion(index)}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary-500" />
                  <span className="text-neutral-600 dark:text-neutral-400">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/30" />
                  <span className="text-neutral-600 dark:text-neutral-400">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800" />
                  <span className="text-neutral-600 dark:text-neutral-400">Unanswered</span>
                </div>
              </div>

              {/* Submit Button on Sidebar */}
              <Button
                variant="primary"
                size="md"
                className="w-full mt-4"
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
              >
                Submit Exam
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <ConfirmSubmitModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmit}
        answeredCount={answeredCount}
        totalCount={questions.length}
      />
    </div>
  );
}
