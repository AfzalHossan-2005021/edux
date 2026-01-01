import { useState } from 'react';

export default function CourseSummary({ courseId, type = 'course' }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateSummary = async () => {
    if (summary) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, id: courseId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSummary(data);
        setIsExpanded(true);
      }
    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={generateSummary}
        disabled={isLoading}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="font-medium text-gray-800">AI Summary</span>
          {summary?.aiGenerated && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
              AI Generated
            </span>
          )}
        </div>
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isExpanded && summary && (
        <div className="p-4 bg-white space-y-4">
          {/* Overview */}
          {summary.overview && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Overview</h4>
              <p className="text-gray-600 text-sm">{summary.overview}</p>
            </div>
          )}

          {/* Key Takeaways */}
          {summary.keyTakeaways?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Key Takeaways</h4>
              <ul className="space-y-1">
                {summary.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {summary.skills?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Skills You'll Learn</h4>
              <div className="flex flex-wrap gap-2">
                {summary.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {summary.prerequisites?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Prerequisites</h4>
              <ul className="space-y-1">
                {summary.prerequisites.map((prereq, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-yellow-500">⚡</span>
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Estimated Time */}
          {summary.estimatedTime && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                <span className="font-medium">⏱ Estimated Time:</span> {summary.estimatedTime}
              </span>
            </div>
          )}

          {/* Difficulty */}
          {summary.difficulty && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Difficulty:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                summary.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                summary.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {summary.difficulty}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
