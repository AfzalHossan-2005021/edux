import { useState, useEffect } from 'react';

export default function LearningAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch learning patterns analysis
        const analysisResponse = await fetch('/api/ai/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'analyze' }),
        });
        
        // Handle non-authenticated gracefully
        if (analysisResponse.status === 401) {
          setIsLoading(false);
          return;
        }
        
        const analysisData = await analysisResponse.json();
        
        // Fetch progress report
        const reportResponse = await fetch('/api/ai/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'report', period: 'weekly' }),
        });
        const reportData = await reportResponse.json();

        if (isMounted) {
          if (analysisData.success) {
            setAnalytics(analysisData);
          }
          if (reportData.success) {
            setReport(reportData.report);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Analytics error:', err);
          setIsLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const metrics = analytics?.metrics || {};
  const insights = analytics?.insights || {};

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Learning Analytics</h2>
            <p className="text-indigo-200 text-sm mt-1">
              {analytics?.aiGenerated ? 'AI-powered insights' : 'Your learning overview'}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{metrics.avgQuizScore || 0}%</div>
          <div className="text-sm text-gray-600">Quiz Average</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{metrics.studyStreak || 0}</div>
          <div className="text-sm text-gray-600">Day Streak 🔥</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">{metrics.lecturesCompleted || 0}</div>
          <div className="text-sm text-gray-600">Lectures Done</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">{metrics.completionRate || 0}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {['overview', 'insights', 'report'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Study Time */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Study Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span>📚</span> Courses Enrolled
                  </div>
                  <div className="text-2xl font-bold mt-1">{metrics.coursesEnrolled || 0}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span>⏰</span> Total Study Hours
                  </div>
                  <div className="text-2xl font-bold mt-1">{metrics.totalStudyHours || 0}h</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span>🌅</span> Peak Study Time
                  </div>
                  <div className="text-2xl font-bold mt-1">{metrics.peakStudyTime || 'N/A'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span>🎯</span> Learning Style
                  </div>
                  <div className="text-2xl font-bold mt-1">{insights.learning_style || 'Varied'}</div>
                </div>
              </div>
            </div>

            {/* Progress Chart Placeholder */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Weekly Progress</h3>
              <div className="h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Progress visualization coming soon</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Strengths */}
            {insights.strengths?.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <span>💪</span> Your Strengths
                </h3>
                <ul className="space-y-2">
                  {insights.strengths.map((strength, i) => (
                    <li key={i} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {insights.areas_for_improvement?.length > 0 && (
              <div>
                <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                  <span>📈</span> Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {insights.areas_for_improvement.map((area, i) => (
                    <li key={i} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations?.length > 0 && (
              <div>
                <h3 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                  <span>💡</span> AI Recommendations
                </h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                      <span className="text-indigo-600 font-bold">{i + 1}.</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'report' && report && (
          <div className="space-y-6">
            {/* Report Summary */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Weekly Summary</h3>
              <p className="text-gray-600">{report.summary}</p>
            </div>

            {/* Achievements */}
            {report.achievements?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🏆</span> Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.achievements.map((achievement, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {report.next_steps?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📋</span> Next Steps
                </h3>
                <ul className="space-y-2">
                  {report.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" className="mt-1 rounded" />
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Encouragement */}
            {report.encouragement && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 flex items-center gap-2">
                  <span>🌟</span>
                  {report.encouragement}
                </p>
              </div>
            )}

            {/* Grade */}
            {report.grade && (
              <div className="text-center p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Your Grade This Week</div>
                <div className={`text-5xl font-bold ${
                  report.grade === 'A' ? 'text-green-600' :
                  report.grade === 'B' ? 'text-blue-600' :
                  report.grade === 'C' ? 'text-yellow-600' :
                  'text-orange-600'
                }`}>
                  {report.grade}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
