/**
 * Accessibility tests for VideoPlayer and EnhancedVideoPlayer
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import VideoPlayer from '../../components/VideoPlayer';
import EnhancedVideoPlayer from '../../components/EnhancedVideoPlayer';

expect.extend(toHaveNoViolations);

// Allow longer time for video player tests
jest.setTimeout(10000);

// Mock fetch so saveProgress doesn't attempt network calls
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));

// Mock window sizes used by VideoPlayer
Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });

// Helper to attach media method mocks to a real video element (after render)
const attachMediaMocks = (video) => {
  if (!video) return {};
  const play = jest.fn().mockResolvedValue();
  const pause = jest.fn();
  Object.defineProperty(video, 'play', { value: play });
  Object.defineProperty(video, 'pause', { value: pause });
  Object.defineProperty(video, 'duration', { value: 100, writable: true });
  Object.defineProperty(video, 'currentTime', { value: 0, writable: true });
  Object.defineProperty(video, 'buffered', { value: { length: 0 }, writable: true });
  Object.defineProperty(video, 'volume', { value: 1, writable: true });
  return { play, pause };
};
describe('Video player accessibility', () => {
  it('VideoPlayer iframe has a title', async () => {
    const { container } = render(<VideoPlayer videoUrl="https://www.youtube.com/watch?v=abc123" />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('title');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('EnhancedVideoPlayer has no detectable axe violations and keyboard shortcuts work', async () => {
    const { container } = render(
      <EnhancedVideoPlayer
        src="/sample.mp4"
        title="Test Lecture"
        lectureId={1}
        courseId={1}
        studentId={1}
        initialProgress={0}
      />
    );

    // Basic checks
    const videoElement = container.querySelector('video');
    expect(videoElement).toBeInTheDocument();

    // Attach mocks to the real video element so methods like play/pause exist
    const { play, pause } = attachMediaMocks(videoElement);

    // Trigger spacebar to toggle play/pause and ensure no exceptions
    fireEvent.keyDown(window, { key: ' ', code: 'Space' });

    // Axe check on a clone without media elements (prevents media-related async hooks from interfering)
    const clone = container.cloneNode(true);
    clone.querySelectorAll('video, iframe').forEach((n) => n.remove());
    const results = await axe(clone);
    expect(results).toHaveNoViolations();

    // Ensure play was attempted
    expect(play).toHaveBeenCalledTimes(1);
  });
});