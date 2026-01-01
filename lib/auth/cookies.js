/**
 * Cookie utility functions for handling authentication cookies
 * Provides secure cookie management for JWT tokens
 */

import { serialize, parse } from 'cookie';

const TOKEN_COOKIE_NAME = 'edux_token';
const REFRESH_COOKIE_NAME = 'edux_refresh_token';

// Cookie options for production security
const defaultCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

/**
 * Set authentication cookies with tokens
 * @param {object} res - Next.js response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookies = [
    serialize(TOKEN_COOKIE_NAME, accessToken, {
      ...defaultCookieOptions,
      maxAge: 15 * 60, // 15 minutes
    }),
    serialize(REFRESH_COOKIE_NAME, refreshToken, {
      ...defaultCookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    }),
  ];
  
  res.setHeader('Set-Cookie', cookies);
};

/**
 * Clear authentication cookies (logout)
 * @param {object} res - Next.js response object
 */
export const clearAuthCookies = (res) => {
  const cookies = [
    serialize(TOKEN_COOKIE_NAME, '', {
      ...defaultCookieOptions,
      maxAge: 0,
    }),
    serialize(REFRESH_COOKIE_NAME, '', {
      ...defaultCookieOptions,
      maxAge: 0,
    }),
  ];
  
  res.setHeader('Set-Cookie', cookies);
};

/**
 * Get tokens from request cookies
 * @param {object} req - Next.js request object
 * @returns {object} { accessToken, refreshToken }
 */
export const getTokensFromCookies = (req) => {
  const cookies = parse(req.headers.cookie || '');
  return {
    accessToken: cookies[TOKEN_COOKIE_NAME] || null,
    refreshToken: cookies[REFRESH_COOKIE_NAME] || null,
  };
};

/**
 * Get access token from request
 * Checks cookies first, then Authorization header
 * @param {object} req - Next.js request object
 * @returns {string|null} Access token or null
 */
export const getAccessToken = (req) => {
  // First check cookies
  const { accessToken } = getTokensFromCookies(req);
  if (accessToken) return accessToken;
  
  // Then check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

export default {
  setAuthCookies,
  clearAuthCookies,
  getTokensFromCookies,
  getAccessToken,
  TOKEN_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
};
