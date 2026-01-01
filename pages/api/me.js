/**
 * Get current user API endpoint
 * Returns the authenticated user's information
 */

import { withAuth } from '../../middleware/authMiddleware';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // req.user is set by withAuth middleware
    return res.status(200).json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred' 
    });
  }
}

export default withAuth(handler);
