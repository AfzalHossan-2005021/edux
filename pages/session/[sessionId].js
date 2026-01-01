/**
 * Live Session Room Component
 * Video call interface with Jitsi integration
 */

import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { initJitsiMeet, cleanupJitsi, getSessionStatus, formatDuration } from '@/lib/liveSessions';
import { fr } from 'zod/v4/locales';

export default function LiveSessionRoom() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        cleanupJitsi(jitsiApiRef.current);
        handleLeave();
      }
    };
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/live-sessions?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Session not found');
      const data = await response.json();
      setSession(data);
      setParticipantCount(data.participantCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !session) return;

    try {
      // Join session in backend
      await fetch('/api/live-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          action: 'join',
          userId: user.U_ID,
        }),
      });

      // Initialize Jitsi
      if (jitsiContainerRef.current) {
        const api = await initJitsiMeet(
          session.roomName,
          { name: user.NAME, email: user.EMAIL },
          jitsiContainerRef.current,
          { password: session.password }
        );

        jitsiApiRef.current = api;

        // Track participants
        api.addEventListener('participantJoined', () => {
          setParticipantCount((prev) => prev + 1);
        });

        api.addEventListener('participantLeft', () => {
          setParticipantCount((prev) => Math.max(0, prev - 1));
        });

        api.addEventListener('videoConferenceLeft', () => {
          handleLeave();
        });

        setIsJoined(true);
      }
    } catch (err) {
      console.error('Failed to join session:', err);
      setError('Failed to join session');
    }
  };

  const handleLeave = async () => {
    if (!user || !session) return;

    try {
      await fetch('/api/live-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          action: 'leave',
          userId: user.U_ID,
        }),
      });
    } catch (err) {
      console.error('Failed to leave session:', err);
    }

    if (jitsiApiRef.current) {
      cleanupJitsi(jitsiApiRef.current);
      jitsiApiRef.current = null;
    }

    setIsJoined(false);
    router.push(`/courses/${session.cId}`);
  };

  const handleStartSession = async () => {
    try {
      await fetch('/api/live-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          action: 'start',
        }),
      });
      fetchSession();
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session?')) return;

    try {
      await fetch('/api/live-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          action: 'end',
        }),
      });

      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('hangup');
      }

      router.push(`/courses/${session.cId}`);
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This session does not exist or has been cancelled.'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const status = getSessionStatus(session);
  const isInstructor = user?.I_ID === session.instructorId;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{session.title}</h1>
            <p className="text-gray-400 text-sm">{session.courseName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm">{participantCount} participants</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'live' ? 'bg-red-500' :
              status === 'upcoming' ? 'bg-blue-500' :
              status === 'ended' ? 'bg-gray-500' : 'bg-yellow-500'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {!isJoined ? (
          /* Pre-join Screen */
          <div className="flex items-center justify-center py-12">
            <div className="bg-gray-800 rounded-xl p-8 text-white text-center max-w-lg w-full">
              <div className="text-6xl mb-6">🎥</div>
              <h2 className="text-2xl font-semibold mb-2">{session.title}</h2>
              <p className="text-gray-400 mb-6">{session.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">Instructor</span>
                  <p className="font-medium">{session.instructorName}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">Duration</span>
                  <p className="font-medium">{formatDuration(session.duration)}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">Type</span>
                  <p className="font-medium capitalize">{session.type}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">Scheduled</span>
                  <p className="font-medium">{new Date(session.scheduledStart).toLocaleString()}</p>
                </div>
              </div>

              {status === 'ended' ? (
                <p className="text-gray-400">This session has ended.</p>
              ) : status === 'cancelled' ? (
                <p className="text-red-400">This session has been cancelled.</p>
              ) : (
                <div className="space-y-3">
                  {isInstructor && status === 'upcoming' && (
                    <button
                      onClick={handleStartSession}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Start Session
                    </button>
                  )}
                  {(status === 'live' || isInstructor) && (
                    <button
                      onClick={handleJoin}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Join Session
                    </button>
                  )}
                  {status === 'upcoming' && !isInstructor && (
                    <p className="text-gray-400">
                      Session starts at {new Date(session.scheduledStart).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Jitsi Container */
          <div className="relative">
            <div
              ref={jitsiContainerRef}
              className="w-full rounded-xl overflow-hidden"
              style={{ height: '600px' }}
            />

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleLeave}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Leave Session
              </button>

              {isInstructor && (
                <button
                  onClick={handleEndSession}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  End Session for All
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
