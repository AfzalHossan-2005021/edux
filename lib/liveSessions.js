/**
 * Live Sessions Library
 * Video call integration for instructor-led sessions
 */

// Jitsi Meet Integration
export const JitsiConfig = {
  domain: 'meet.jit.si',
  options: {
    width: '100%',
    height: 600,
    parentNode: null,
    configOverwrite: {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      disableDeepLinking: true,
      prejoinPageEnabled: true,
      enableWelcomePage: false,
      enableClosePage: false,
      disableInviteFunctions: true,
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'desktop',
        'fullscreen',
        'fodeviceselection',
        'hangup',
        'profile',
        'chat',
        'recording',
        'settings',
        'raisehand',
        'videoquality',
        'filmstrip',
        'tileview',
        'download',
        'help',
        'mute-everyone',
      ],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      MOBILE_APP_PROMO: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
    },
    userInfo: {
      displayName: '',
      email: '',
    },
  },
};

// Generate unique room name for a session
export function generateRoomName(courseId, sessionId) {
  const prefix = 'edux';
  const uniqueId = `${courseId}-${sessionId}-${Date.now()}`;
  return `${prefix}-${Buffer.from(uniqueId).toString('base64').replace(/[+=\/]/g, '')}`.slice(0, 50);
}

// Generate secure room password
export function generateRoomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Session Types
export const SessionTypes = {
  LECTURE: 'lecture',
  QA: 'q&a',
  WORKSHOP: 'workshop',
  OFFICE_HOURS: 'office_hours',
};

// Create session data
export function createSessionData(options) {
  const {
    courseId,
    instructorId,
    title,
    description,
    type = SessionTypes.LECTURE,
    scheduledStart,
    duration = 60,
    maxParticipants = 100,
  } = options;

  const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const roomName = generateRoomName(courseId, sessionId);
  const password = generateRoomPassword();

  return {
    sessionId,
    courseId,
    instructorId,
    title,
    description,
    type,
    roomName,
    password,
    scheduledStart: new Date(scheduledStart).toISOString(),
    scheduledEnd: new Date(new Date(scheduledStart).getTime() + duration * 60000).toISOString(),
    duration,
    maxParticipants,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    participants: [],
    recording: null,
  };
}

// Initialize Jitsi API
export async function initJitsiMeet(roomName, userInfo, containerElement, options = {}) {
  return new Promise((resolve, reject) => {
    // Load Jitsi API script
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => createJitsiApi();
      script.onerror = () => reject(new Error('Failed to load Jitsi API'));
      document.body.appendChild(script);
    } else {
      createJitsiApi();
    }

    function createJitsiApi() {
      try {
        const config = {
          ...JitsiConfig.options,
          roomName,
          parentNode: containerElement,
          userInfo: {
            displayName: userInfo.name || 'Anonymous',
            email: userInfo.email || '',
          },
          ...options,
        };

        if (options.password) {
          config.password = options.password;
        }

        const api = new window.JitsiMeetExternalAPI(JitsiConfig.domain, config);

        // Event listeners
        api.addEventListener('videoConferenceJoined', (data) => {
          console.log('Joined conference:', data);
        });

        api.addEventListener('videoConferenceLeft', (data) => {
          console.log('Left conference:', data);
        });

        api.addEventListener('participantJoined', (data) => {
          console.log('Participant joined:', data);
        });

        api.addEventListener('participantLeft', (data) => {
          console.log('Participant left:', data);
        });

        resolve(api);
      } catch (error) {
        reject(error);
      }
    }
  });
}

// Clean up Jitsi instance
export function cleanupJitsi(api) {
  if (api) {
    api.dispose();
  }
}

// Session participant roles
export const ParticipantRoles = {
  HOST: 'host',
  CO_HOST: 'co_host',
  PARTICIPANT: 'participant',
};

// Check if user can host
export function canHost(userRole, isInstructor) {
  return isInstructor || userRole === ParticipantRoles.HOST || userRole === ParticipantRoles.CO_HOST;
}

// Format session duration
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Get session status
export function getSessionStatus(session) {
  const now = new Date();
  const start = new Date(session.scheduledStart);
  const end = new Date(session.scheduledEnd);

  if (session.status === 'cancelled') return 'cancelled';
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  if (now > end) return 'ended';
  return 'unknown';
}

// Get time until session
export function getTimeUntilSession(scheduledStart) {
  const now = new Date();
  const start = new Date(scheduledStart);
  const diff = start - now;

  if (diff <= 0) return 'Starting now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
