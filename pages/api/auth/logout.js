/**
 * Logout API Endpoint
 * POST /api/auth/logout
 * 
 * Handles user logout by clearing authentication tokens and cookies
 */

import { clearAuthCookies } from '@/lib/auth/cookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }

  try {
    // Clear authentication cookies
    clearAuthCookies(res);

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during logout' 
    });
  }
}
