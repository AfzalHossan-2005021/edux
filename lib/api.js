/**
 * API utility functions for making requests to the backend
 * Uses environment variables for base URL configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint (e.g., '/api/login')
 * @returns {string} The full API URL
 */
export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * Make a GET request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>}
 */
export const apiGet = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
    ...options,
  });
  return response;
};

/**
 * Make a POST request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>}
 */
export const apiPost = async (endpoint, data = {}, options = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
    body: JSON.stringify(data),
    ...options,
  });
  return response;
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>}
 */
export const apiPut = async (endpoint, data = {}, options = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    body: JSON.stringify(data),
    ...options,
  });
  return response;
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>}
 */
export const apiDelete = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });
  return response;
};

/**
 * Safely parse JSON from a response
 * Handles cases where the response might be HTML error pages
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} Parsed JSON or throws error
 */
export const safeJsonParse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  // If not JSON, throw a descriptive error
  const text = await response.text();
  const isHtml = text.trim().startsWith('<') || text.includes('<!DOCTYPE');
  if (isHtml) {
    throw new Error('Server returned HTML instead of JSON. The server may be experiencing issues.');
  }
  throw new Error(`Unexpected response type: ${contentType || 'unknown'}`);
};

/**
 * Make an API request and automatically parse JSON response
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body (for POST/PUT)
 * @param {object} options - Additional fetch options
 * @returns {Promise<{success: boolean, data?: any, error?: string, status: number}>}
 */
export const apiRequest = async (method, endpoint, data = null, options = {}) => {
  try {
    let response;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await apiGet(endpoint, options);
        break;
      case 'POST':
        response = await apiPost(endpoint, data, options);
        break;
      case 'PUT':
        response = await apiPut(endpoint, data, options);
        break;
      case 'DELETE':
        response = await apiDelete(endpoint, options);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    const json = await safeJsonParse(response);
    return {
      success: response.ok,
      data: json,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 0,
    };
  }
};

export default {
  getApiUrl,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  safeJsonParse,
  apiRequest,
  API_BASE_URL,
};
