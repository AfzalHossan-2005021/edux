/**
 * Enhanced Video Player with Progress Tracking
 * Advanced video player for EduX learning platform with analytics and progress persistence
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

const EnhancedVideoPlayer = ({
  src,
  youtubeUrl,
  title,
  lectureId,
  courseId,
  studentId,
  onProgress,
  onComplete,
  initialProgress = 0,
  autoSaveInterval = 30, // seconds
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [watchedProgress, setWatchedProgress] = useState(initialProgress);
  const [showSettings, setShowSettings] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const lastSaveRef = useRef(Date.now());

  // Check if source is YouTube
  useEffect(() => {
    if (youtubeUrl) {
      setIsYouTube(true);
    } else if (src) {
      setIsYouTube(false);
    }
  }, [src, youtubeUrl]);

  // Format time in MM:SS or HH:MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercent = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  // Get YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^?&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
    return match && match[1];
  };

  // Save progress to server
  const saveProgress = useCallback(async (progress, isComplete = false) => {
    const now = Date.now();
    // Don't save too frequently (minimum 5 seconds between saves)
    if (now - lastSaveRef.current < 5000 && !isComplete) return;
    lastSaveRef.current = now;

    const progressData = {
      lectureId,
      courseId,
      studentId,
      progress: Math.round(progress),
      currentTime,
      duration,
      isComplete,
      timestamp: new Date().toISOString(),
    };

    try {
      if (onProgress) {
        onProgress(progressData);
      }

      // API call to save progress
      await fetch('/api/update_lecture_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [lectureId, courseId, studentId, currentTime, duration, onProgress]);

  // Handle video time update
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    
    // Calculate watched progress (highest point watched)
    const currentProgress = (video.currentTime / video.duration) * 100;
    if (currentProgress > watchedProgress) {
      setWatchedProgress(currentProgress);
    }

    // Update buffered amount
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered((bufferedEnd / video.duration) * 100);
    }

    // Auto-save progress periodically
    const timeSinceLastSave = (Date.now() - lastSaveRef.current) / 1000;
    if (timeSinceLastSave >= autoSaveInterval) {
      saveProgress(currentProgress);
    }
  };

  // Handle video loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration);

    // Restore previous position if available
    if (initialProgress > 0) {
      video.currentTime = (initialProgress / 100) * video.duration;
    }
  };

  // Handle video ended
  const handleEnded = () => {
    setIsPlaying(false);
    setWatchedProgress(100);
    saveProgress(100, true);

    if (onComplete) {
      onComplete({ lectureId, courseId, watchTime: duration });
    }
  };

  // Play/Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek to position
  const handleSeek = (e) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (video) {
      video.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Playback rate change
  const handlePlaybackRateChange = (rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  // Skip forward/backward
  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (isYouTube) return; // YouTube handles its own shortcuts

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => {
            const newVol = Math.min(v + 0.1, 1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => {
            const newVol = Math.max(v - 0.1, 0);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isYouTube]);

  // Auto-hide controls
  useEffect(() => {
    if (isYouTube) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isPlaying, isYouTube]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (!isYouTube && videoRef.current && videoRef.current.duration) {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        if (progress > 0) {
          saveProgress(progress);
        }
      }
    };
  }, [saveProgress, isYouTube]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Render YouTube player
  if (isYouTube) {
    const videoId = getYouTubeVideoId(youtubeUrl);
    const aspectRatio = 9 / 16;
    
    return (
      <div ref={containerRef} className="enhanced-video-player relative bg-black rounded-lg overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'Video Player'}
          />
        </div>
        {/* Progress Indicator for YouTube */}
        <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-white text-sm z-10">
          Watching
        </div>
      </div>
    );
  }

  // Render HTML5 video player
  return (
    <div 
      ref={containerRef}
      className="enhanced-video-player relative bg-black rounded-lg overflow-hidden group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Video Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="relative h-1 bg-gray-600 rounded cursor-pointer mb-3 group/progress hover:h-2 transition-all"
          onClick={handleSeek}
        >
          {/* Buffered */}
          <div
            className="absolute h-full bg-gray-500 rounded"
            style={{ width: `${buffered}%` }}
          />
          {/* Watched Progress (highest point) */}
          <div
            className="absolute h-full bg-blue-400/50 rounded"
            style={{ width: `${watchedProgress}%` }}
          />
          {/* Current Progress */}
          <div
            className="absolute h-full bg-blue-500 rounded"
            style={{ width: `${getProgressPercent()}%` }}
          />
          {/* Scrubber */}
          <div
            className="absolute h-3 w-3 bg-blue-500 rounded-full -top-1 transform -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${getProgressPercent()}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="hover:text-blue-400 transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip Backward */}
            <button onClick={() => skip(-10)} className="hover:text-blue-400 transition-colors" aria-label="Rewind 10 seconds">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            {/* Skip Forward */}
            <button onClick={() => skip(10)} className="hover:text-blue-400 transition-colors" aria-label="Forward 10 seconds">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
              </svg>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="hover:text-blue-400 transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-blue-500"
                aria-label="Volume"
              />
            </div>

            {/* Time Display */}
            <span className="text-sm tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="hover:text-blue-400 transition-colors"
                aria-label="Settings"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
              </button>
              
              {/* Settings Menu */}
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg p-2 min-w-[150px]">
                  <div className="text-sm font-medium mb-2 px-2">Playback Speed</div>
                  {playbackRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${
                        playbackRate === rate ? 'text-blue-400' : ''
                      }`}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={() => {
                if (document.pictureInPictureElement) {
                  document.exitPictureInPicture();
                } else {
                  videoRef.current?.requestPictureInPicture();
                }
              }}
              className="hover:text-blue-400 transition-colors hidden sm:block"
              aria-label="Picture in Picture"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
              </svg>
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors" aria-label="Fullscreen">
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button (shown when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500/80 hover:bg-blue-500 rounded-full p-4 transition-all hover:scale-110"
          aria-label="Play"
        >
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <h3 className="text-white text-lg font-medium">{title}</h3>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-white text-sm font-medium">
        {Math.round(watchedProgress)}% watched
      </div>

      <style jsx>{`
        .enhanced-video-player:fullscreen {
          width: 100vw;
          height: 100vh;
        }
        .enhanced-video-player:fullscreen video {
          height: 100vh;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};

export default EnhancedVideoPlayer;
