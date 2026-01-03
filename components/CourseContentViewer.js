/**
 * Course Content Viewer Component
 * Display course materials and track student progress
 */

import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import {
  FaCheckCircle,
  FaClock,
  FaPlay,
  FaBook,
  FaClipboardList,
  FaCalendar,
} from 'react-icons/fa';

export default function CourseContentViewer({ courseId, studentId, isEnrolled = false }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [progress, setProgress] = useState({});
  const [videoProgress, setVideoProgress] = useState({});

  useEffect(() => {
    loadCourseContent();
  }, [courseId, studentId]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/course/structure?c_id=${courseId}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
        // Load progress if student is enrolled
        if (studentId && isEnrolled) {
          loadStudentProgress();
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async () => {
    try {
      // This would load lecture progress data from a database
      // For now, we'll initialize an empty progress object
      setProgress({});
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const updateLectureProgress = async (lectureId, watched = 0, currentTime = 0, isComplete = false) => {
    if (!studentId || !isEnrolled) return;

    try {
      const response = await apiPost('/api/update_lecture_progress', {
        s_id: studentId,
        l_id: lectureId,
        c_id: courseId,
        progress: watched,
        current_time: currentTime,
        is_complete: isComplete
      });

      const data = await response.json();
      if (data.success) {
        setProgress(prev => ({
          ...prev,
          [lectureId]: { watched, currentTime, isComplete }
        }));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoProgress = (lectureId, currentTime, videoDuration) => {
    const watched = Math.round((currentTime / videoDuration) * 100);
    setVideoProgress(prev => ({
      ...prev,
      [lectureId]: { currentTime, watched, videoDuration }
    }));

    // Update progress periodically
    if (watched >= 90) {
      updateLectureProgress(lectureId, watched, currentTime, true);
    } else {
      updateLectureProgress(lectureId, watched, currentTime, false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-indigo-100 mb-4">{course.description}</p>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <FaBook /> {course.topics?.length || 0} Topics
          </div>
          <div className="flex items-center gap-2">
            <FaPlay /> {course.topics?.reduce((sum, t) => sum + (t.lectures?.length || 0), 0) || 0} Lectures
          </div>
          <div className="flex items-center gap-2">
            <FaClipboardList /> {course.topics?.reduce((sum, t) => sum + (t.exams?.length || 0), 0) || 0} Exams
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {course.topics?.map((topic, index) => (
              <div key={topic.t_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Topic Header */}
                <div className="bg-gray-50 p-4 border-l-4 border-indigo-600">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {index + 1}. {topic.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {topic.lectures?.length || 0} Lectures • {topic.exams?.length || 0} Exams
                  </p>
                </div>

                {/* Topic Content */}
                <div className="p-4 space-y-3">
                  {/* Lectures */}
                  {topic.lectures && topic.lectures.map((lecture, lectureIndex) => {
                    const lectureProgress = progress[lecture.l_id];
                    const isCompleted = lectureProgress?.isComplete;

                    return (
                      <div
                        key={lecture.l_id}
                        onClick={() => isEnrolled && setSelectedLecture(lecture)}
                        className={`p-3 rounded-lg border-l-4 cursor-pointer transition ${
                          isCompleted
                            ? 'bg-green-50 border-green-500'
                            : selectedLecture?.l_id === lecture.l_id
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FaPlay className="text-indigo-600 text-sm" />
                              <p className="font-medium text-gray-900">
                                Lecture {lectureIndex + 1}: {lecture.description}
                              </p>
                              {isCompleted && (
                                <FaCheckCircle className="text-green-500 ml-2" />
                              )}
                            </div>
                            {lectureProgress && (
                              <p className="text-xs text-gray-600 mt-1 ml-6">
                                Progress: {lectureProgress.watched}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Exams */}
                  {topic.exams && topic.exams.map((exam, examIndex) => (
                    <div
                      key={exam.e_id}
                      className="p-3 rounded-lg border-l-4 border-orange-500 bg-orange-50 hover:bg-orange-100 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaClipboardList className="text-orange-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Exam: {exam.question_count} Questions
                            </p>
                            <p className="text-xs text-gray-600">
                              {exam.marks} Marks • {exam.duration} Minutes
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player / Details Panel */}
        <div className="lg:col-span-1">
          {selectedLecture ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              {selectedLecture.video && (
                <div className="relative bg-black aspect-video">
                  <iframe
                    src={selectedLecture.video.replace('watch?v=', 'embed/')}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={(e) => {
                      const iframe = e.target;
                      iframe.addEventListener('play', (evt) => {
                        const videoElement = iframe.contentDocument?.querySelector('video');
                        if (videoElement) {
                          handleVideoProgress(
                            selectedLecture.l_id,
                            videoElement.currentTime,
                            videoElement.duration
                          );
                        }
                      });
                    }}
                    className="w-full h-full"
                  />
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {selectedLecture.description}
                </h3>

                {selectedLecture.video && (
                  <div className="mb-4">
                    <a
                      href={selectedLecture.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm underline"
                    >
                      Open in YouTube
                    </a>
                  </div>
                )}

                {isEnrolled && (
                  <div className="space-y-3">
                    {progress[selectedLecture.l_id] && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Progress</span>
                          <span className="font-bold text-blue-600">
                            {progress[selectedLecture.l_id].watched}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${progress[selectedLecture.l_id].watched}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {progress[selectedLecture.l_id]?.isComplete && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" />
                        <span className="text-sm text-green-800 font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                )}

                {!isEnrolled && (
                  <p className="text-sm text-gray-600 text-center py-4">
                    Enroll in this course to track progress
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <p className="text-gray-600 text-center">
                Select a lecture to view content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
