import { useState } from 'react';

export default function AIQuizGenerator({ topicId, topic, onQuizStart }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: topicId ? 'practice' : 'generate',
          topicId,
          topic,
          difficulty,
          count: questionCount,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.questions?.length > 0) {
        setQuestions(data.questions);
        setQuizStarted(true);
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        if (onQuizStart) onQuizStart();
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Get AI feedback for the answer
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'grade',
          question: question.question,
          userAnswer: question.options[answerIndex],
          correctAnswer: question.options[question.correct],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data);
      }
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizStarted(false);
    setFeedback(null);
  };

  // Quiz Configuration Screen
  if (!quizStarted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <span className="text-4xl mb-4 block">🧠</span>
          <h2 className="text-2xl font-bold text-gray-800">AI Quiz Generator</h2>
          <p className="text-gray-600 mt-2">
            Generate practice questions on: <span className="font-medium">{topic}</span>
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 px-4 rounded-lg capitalize transition-colors ${
                    difficulty === level
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[3, 5, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    questionCount === count
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateQuiz}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Questions...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-6">
          <span className="text-6xl">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
        
        <div className="my-6">
          <div className={`text-6xl font-bold ${
            grade === 'A' ? 'text-green-600' :
            grade === 'B' ? 'text-blue-600' :
            grade === 'C' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {grade}
          </div>
          <div className="text-gray-600 mt-2">
            {score} / {questions.length} correct ({percentage}%)
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <p className="text-gray-700">
            {percentage >= 80
              ? "Excellent work! You've mastered this topic! 🌟"
              : percentage >= 60
              ? "Good effort! A bit more practice and you'll master it! 💪"
              : "Keep studying! Review the material and try again. 📖"}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={restartQuiz}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            New Quiz
          </button>
          <button
            onClick={() => {
              setShowResult(false);
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setScore(0);
              setFeedback(null);
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry Same Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz Question Screen
  const question = questions[currentQuestion];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        {/* Question Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {difficulty}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = question.correct === index;
            const showCorrect = selectedAnswer !== null && isCorrect;
            const showWrong = isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => selectedAnswer === null && handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  showCorrect
                    ? 'bg-green-100 border-2 border-green-500'
                    : showWrong
                    ? 'bg-red-100 border-2 border-red-500'
                    : isSelected
                    ? 'bg-indigo-100 border-2 border-indigo-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    showCorrect
                      ? 'bg-green-500 text-white'
                      : showWrong
                      ? 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-700">{option}</span>
                  {showCorrect && (
                    <svg className="w-5 h-5 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {showWrong && (
                    <svg className="w-5 h-5 text-red-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {selectedAnswer !== null && feedback && (
          <div className={`mt-4 p-4 rounded-lg ${
            feedback.isCorrect ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <p className="text-sm text-gray-700">
              <span className="font-medium">
                {feedback.isCorrect ? '✅ Correct!' : '❌ Not quite.'}
              </span>
              {' '}{feedback.explanation || question.explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {selectedAnswer !== null && (
          <button
            onClick={nextQuestion}
            className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {currentQuestion + 1 < questions.length ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
