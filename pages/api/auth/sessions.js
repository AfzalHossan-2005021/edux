/**
 * Session Management API Endpoints
 * 
 * GET /api/auth/sessions - Get all active sessions for current user
 * DELETE /api/auth/sessions - Invalidate all sessions (logout everywhere)
 * DELETE /api/auth/sessions/[sessionId] - Invalidate a specific session
 */

import { withAuth } from '../../../middleware/authMiddleware';
import { getUserSessions, invalidateAllUserSessions, invalidateSession } from '../../../lib/auth/sessionManager';
import { audit } from '../../../lib/auth/auditLogger';
import { clearAuthCookies } from '../../../lib/auth/cookies';

async function handler(req, res) {
  const { method } = req;
  const user = req.user;

  switch (method) {
    case 'GET':
      // Get all active sessions for the user
      try {
        const sessions = await getUserSessions(user.u_id);
        return res.status(200).json({
          success: true,
          sessions: sessions.map(s => ({
            sessionId: s.sessionId.slice(0, 8) + '...', // Partial ID for security
            userAgent: s.userAgent,
            ipAddress: s.ipAddress,
            createdAt: s.createdAt,
            lastUsedAt: s.lastUsedAt,
            isCurrent: s.sessionId === user.sessionId,
          })),
        });
      } catch (error) {
        console.error('Error fetching sessions:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch sessions',
        });
      }

    case 'DELETE':
      // Invalidate all sessions (logout everywhere) or specific session
      try {
        const { sessionId, keepCurrent } = req.body || {};

        if (sessionId) {
          // Invalidate specific session
          await invalidateSession(sessionId);
          await audit.allSessionsInvalidated(user.u_id, user.email, 'Single session logout', req);
          
          return res.status(200).json({
            success: true,
            message: 'Session invalidated',
          });
        }

        // Invalidate all sessions
        const exceptSessionId = keepCurrent ? user.sessionId : null;
        await invalidateAllUserSessions(user.u_id, exceptSessionId);
        await audit.allSessionsInvalidated(user.u_id, user.email, 'Logout from all devices', req);

        // If not keeping current session, clear cookies
        if (!keepCurrent) {
          clearAuthCookies(res);
        }

        return res.status(200).json({
          success: true,
          message: keepCurrent 
            ? 'All other sessions invalidated' 
            : 'All sessions invalidated',
        });
      } catch (error) {
        console.error('Error invalidating sessions:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to invalidate sessions',
        });
      }

    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).json({
        success: false,
        error: `Method ${method} not allowed`,
      });
  }
}

export default withAuth(handler);
