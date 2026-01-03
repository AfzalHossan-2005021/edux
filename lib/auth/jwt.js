/**
 * JWT utility functions for authentication
 * Handles token generation, verification, and refresh
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate an access token for a user
 * @param {object} payload - User data to encode in token
 * @returns {string} JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate a refresh token for a user
 * @param {object} payload - User data to encode in token
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Generate both access and refresh tokens
 * @param {object} user - User object with id, email, name, role
 * @returns {object} { accessToken, refreshToken }
 */
export const generateTokens = (user) => {
  const payload = {
    u_id: user.u_id,
    email: user.email,
    name: user.name,
    role: user.role || 'student', // Include role for middleware route protection
    isStudent: user.isStudent || user.role === 'student',
    isInstructor: user.isInstructor || user.role === 'instructor',
    isAdmin: user.isAdmin || user.role === 'admin',
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ 
      u_id: user.u_id,
      role: payload.role, // Include role in refresh token for token refresh
    }),
  };
};

/**
 * Verify an access token
 * @param {string} token - JWT access token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode a token without verifying (useful for getting expiry info)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token or null
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
};
