/**
 * Student Lecture Page
 * Route: /student/courses/topic/lecture/[l_id]
 * 
 * Displays lecture video content with AI features for students.
 */

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import VideoPlayer from '../../../../../components/VideoPlayer';
import { apiPost } from '../../../../../lib/api';
import { AIQuizGenerator, AIChat } from '../../../../../components/ai';
import { useAuth } from '../../../../../context/AuthContext';

export default function LecturePage({ l_id }) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const s_id = user?.u_id || secureLocalStorage.getItem('u_id');
  const { c_id, t_id } = router.query;
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (!s_id || !c_id || !t_id || !l_id) return;
    
    apiPost('/api/lecture_content', { s_id, c_id, t_id, l_id })
      .then((res) => res.json())
      .then((json_res) => {
        if (json_res && !json_res.message) {
          setDescription(json_res.description || '');
          setVideoUrl(json_res.video_link || '');
        }
      })
      .catch((error) => {
        console.error('Error fetching lecture content:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [s_id, c_id, t_id, l_id]);

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="flex flex-wrap w-full flex-col items-center text-center">
        <h1 className="sm:text-3xl text-2xl font-medium underline title-font mt-10 text-gray-900">{description}</h1>
      </div>
      {videoUrl && <VideoPlayer videoUrl={videoUrl} />}
      
      {/* AI Features Section */}
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setShowQuiz(!showQuiz)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <span>🧠</span>
            {showQuiz ? 'Hide Quiz' : 'Practice Quiz'}
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all flex items-center gap-2"
          >
            <span>💬</span>
            Ask AI Tutor
          </button>
        </div>

        {/* AI Quiz Generator */}
        {showQuiz && (
          <div className="mb-8">
            <AIQuizGenerator 
              topic={description || 'this lecture content'} 
              lectureId={l_id}
            />
          </div>
        )}
      </div>

      {/* AI Chat Widget */}
      {showChat && (
        <AIChat 
          courseId={c_id} 
          onClose={() => setShowChat(false)} 
        />
      )}
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const { params } = context
  const { l_id } = params
  return { props: { l_id } }
}
