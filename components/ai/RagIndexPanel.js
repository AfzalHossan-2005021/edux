import {useCallback, useEffect, useState} from 'react';
import {Card} from '../ui';

/**
 * Instructor panel for the AI tutor's retrieval index. Shows how much of the
 * course is indexed and lets the instructor (re)build the index after
 * changing content or transcripts.
 */
export default function RagIndexPanel({courseId}) {
  const [status, setStatus] = useState(null);
  const [building, setBuilding] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({action: 'status', courseId}),
      });
      const data = await response.json();
      if (data.success) setStatus(data);
    } catch (error) {
      console.error('RAG status error:', error);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchStatus();
  }, [courseId, fetchStatus]);

  const buildIndex = async () => {
    setBuilding(true);
    setMessage(null);
    try {
      const response = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({action: 'ingest', courseId}),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Indexed ${data.chunkCount} chunks (${data.embedded} embedded, ${data.reused} reused). ` +
            `${data.lecturesWithTranscripts}/${data.lectureCount} lectures have transcripts.`,
        });
        fetchStatus();
      } else {
        setMessage({type: 'error', text: data.error || 'Indexing failed'});
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Indexing failed. Please try again.'});
    } finally {
      setBuilding(false);
    }
  };

  const indexed = status && status.chunkCount > 0;

  return (
    <Card className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 mb-8">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-xl" aria-hidden="true">🤖</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Tutor Index</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {indexed ?
                  `${status.chunkCount} content chunks indexed · ${status.embeddedCount} embedded` +
                    (status.embeddingModel ? ` · ${status.embeddingModel}` : '') :
                  'Not indexed yet — students get generic (ungrounded) answers until you build the index.'}
              </p>
            </div>
          </div>
          <button
            onClick={buildIndex}
            disabled={building}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-60 whitespace-nowrap"
          >
            {building ? 'Indexing…' : indexed ? 'Rebuild index' : 'Build index'}
          </button>
        </div>
        {message && (
          <p
            className={`mt-4 text-sm ${
              message.type === 'success' ?
                'text-emerald-600 dark:text-emerald-400' :
                'text-red-600 dark:text-red-400'
            }`}
            role="status"
          >
            {message.text}
          </p>
        )}
      </div>
    </Card>
  );
}
