import { useState, useEffect } from 'react';

export default function AIRecommendations({ limit = 4 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'personalized', limit }),
        });

        if (!isMounted) return;

        if (response.status === 401) {
          setRecommendations([]);
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (isMounted && data.success && data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching recommendations:', err);
          setError('Failed to load recommendations');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h2 className="text-xl font-semibold">Recommended for You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-2" />
              <div className="bg-gray-200 h-4 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h2 className="text-xl font-semibold text-gray-800">Recommended for You</h2>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
            AI Powered
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((course, index) => (
          <a
            key={course.course_id || course.id || `rec-${index}`}
            href={`/courses/${course.course_id || course.id}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="h-24 bg-gradient-to-r from-indigo-400 to-purple-400 relative">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-2 left-2 right-2">
                <span className="px-2 py-1 bg-white/90 text-xs rounded text-gray-700">
                  {course.category || 'General'}
                </span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {course.rating?.toFixed(1) || 'N/A'}
                </span>
                {course.level && (
                  <span className="capitalize">{course.level}</span>
                )}
              </div>
              {course.reason && (
                <p className="mt-2 text-xs text-indigo-600 line-clamp-1">
                  {course.reason}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
