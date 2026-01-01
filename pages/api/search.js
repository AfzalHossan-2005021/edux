/**
 * Search API endpoint with Meilisearch
 */
import { searchCourses, globalSearch, getSearchSuggestions, healthCheck } from '../../lib/search';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, type = 'courses', limit = 20, offset = 0, filter, sort } = req.body;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ message: 'Query must be at least 2 characters' });
  }

  try {
    // Check if Meilisearch is available
    const isHealthy = await healthCheck();
    
    if (!isHealthy) {
      // Fallback to database search if Meilisearch is unavailable
      return res.status(503).json({ 
        message: 'Search service temporarily unavailable',
        fallback: true 
      });
    }

    let results;

    switch (type) {
      case 'global':
        results = await globalSearch(query, { limit });
        break;
      
      case 'suggestions':
        results = await getSearchSuggestions(query, limit);
        break;
      
      case 'courses':
      default:
        results = await searchCourses(query, {
          limit,
          offset,
          filter,
          sort,
        });
        break;
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Search failed', error: error.message });
  }
}
