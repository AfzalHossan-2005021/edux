/**
 * CSRF Token API Endpoint
 * 
 * GET /api/auth/csrf - Get a new CSRF token
 */

import { handleCsrfTokenRequest } from '../../../lib/auth/csrf';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return handleCsrfTokenRequest(req, res);
}
