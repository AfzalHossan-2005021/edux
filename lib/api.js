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

export default {
  getApiUrl,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  API_BASE_URL,
};
