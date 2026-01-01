// Authentication Middleware

import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * Parse cookies from request headers
 * @param {Object} req - Next.js request object
 * @returns {Object} - Parsed cookies
 */
function parseCookies(req) {
  // Try req.cookies first (populated by Next.js in dev mode)
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    return req.cookies;
  }
  
  // Manually parse from cookie header (needed in standalone mode)
  const cookieHeader = req.headers?.cookie || '';
  return parse(cookieHeader);
}

/**
 * Verify JWT token from request
 * @param {Object} req - Next.js request object
 * @returns {Object|null} - Decoded user object or null
 */
export async function verifyAuth(req) {
  try {
    const cookies = parseCookies(req);
    
    // Get token from cookie (edux_token) or Authorization header
    let token = cookies.edux_token || cookies.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return {
      id: decoded.u_id || decoded.userId || decoded.id,
      email: decoded.email,
      userType: decoded.isInstructor ? 'instructor' : 'student',
    };
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return null;
  }
}

/**
 * Middleware wrapper for protected routes
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler
 */
export function withAuth(handler) {
  return async (req, res) => {
    const user = await verifyAuth(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Please log in' });
    }
    
    // Attach user to request
    req.user = user;
    
    return handler(req, res);
  };
}

/**
 * Middleware for instructor-only routes
 * @param {Function} handler - API route handler
 * @returns {Function} - Wrapped handler
 */
export function withInstructorAuth(handler) {
  return async (req, res) => {
    const user = await verifyAuth(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Please log in' });
    }
    
    if (user.userType !== 'instructor') {
      return res.status(403).json({ error: 'Forbidden - Instructor access required' });
    }
    
    req.user = user;
    
    return handler(req, res);
  };
}

export default { verifyAuth, withAuth, withInstructorAuth };
