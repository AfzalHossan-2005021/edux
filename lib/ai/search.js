// AI-Powered Smart Search

import aiService from './service';
import { SYSTEM_PROMPTS, AI_FEATURES } from './config';

/**
 * Perform AI-enhanced search on courses
 */
export async function smartSearch(query, courses, options = {}) {
  if (!AI_FEATURES.SMART_SEARCH) {
    return basicSearch(query, courses);
  }

  try {
    // First, parse the natural language query
    const searchIntent = await parseSearchQuery(query);
    
    // Then filter courses based on parsed intent
    let results = filterCoursesByIntent(courses, searchIntent);
    
    // If AI parsing failed or no results, fall back to basic search
    if (results.length === 0) {
      results = basicSearch(query, courses).results;
    }

    // Rank results by relevance
    const rankedResults = await rankSearchResults(query, results);

    return {
      success: true,
      results: rankedResults,
      searchIntent,
      totalResults: rankedResults.length,
      aiEnhanced: true,
    };
  } catch (error) {
    console.error('Smart search error:', error);
    return basicSearch(query, courses);
  }
}

/**
 * Parse natural language query into structured search parameters
 */
async function parseSearchQuery(query) {
  const prompt = `
Parse this search query into structured search parameters:
"${query}"

Extract and return as JSON:
{
  "keywords": ["<relevant keywords>"],
  "topics": ["<identified topics/subjects>"],
  "difficulty": "<beginner|intermediate|advanced|null>",
  "duration": "<short|medium|long|null>",
  "intent": "<learn|review|practice|explore>",
  "specific_skills": ["<any specific skills mentioned>"]
}`;

  try {
    const response = await aiService.chat(SYSTEM_PROMPTS.SMART_SEARCH, prompt, {
      temperature: 0.3, // Lower temperature for more consistent parsing
    });
    
    const parsed = aiService.parseJSON(response);
    return parsed || { keywords: query.split(' '), intent: 'explore' };
  } catch {
    return { keywords: query.split(' '), intent: 'explore' };
  }
}

/**
 * Filter courses based on parsed search intent
 */
function filterCoursesByIntent(courses, intent) {
  if (!intent) return courses;

  return courses.filter(course => {
    const titleLower = (course.title || '').toLowerCase();
    const descLower = (course.description || '').toLowerCase();
    const fieldLower = (course.field || '').toLowerCase();
    const combined = `${titleLower} ${descLower} ${fieldLower}`;

    // Check keywords
    const keywordMatch = (intent.keywords || []).some(keyword =>
      combined.includes(keyword.toLowerCase())
    );

    // Check topics
    const topicMatch = (intent.topics || []).some(topic =>
      combined.includes(topic.toLowerCase())
    );

    // Check specific skills
    const skillMatch = (intent.specific_skills || []).some(skill =>
      combined.includes(skill.toLowerCase())
    );

    return keywordMatch || topicMatch || skillMatch;
  });
}

/**
 * Rank search results by relevance
 */
async function rankSearchResults(query, courses) {
  if (courses.length <= 1) return courses;

  // Calculate relevance scores
  const scoredCourses = courses.map(course => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = (course.title || '').toLowerCase();
    const descLower = (course.description || '').toLowerCase();

    // Title match (highest weight)
    if (titleLower.includes(queryLower)) {
      score += 10;
    }

    // Word-by-word title match
    query.split(' ').forEach(word => {
      if (word.length > 2 && titleLower.includes(word.toLowerCase())) {
        score += 3;
      }
    });

    // Description match
    query.split(' ').forEach(word => {
      if (word.length > 2 && descLower.includes(word.toLowerCase())) {
        score += 1;
      }
    });

    // Boost by rating and popularity
    score += (course.rating || 0) * 0.5;
    score += Math.min((course.student_count || 0) / 100, 2);

    return { ...course, relevanceScore: score };
  });

  // Sort by relevance score
  return scoredCourses
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map(({ relevanceScore, ...course }) => course);
}

/**
 * Basic keyword search (fallback)
 */
function basicSearch(query, courses) {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(' ').filter(w => w.length > 2);

  const results = courses.filter(course => {
    const searchText = `${course.title} ${course.description} ${course.field}`.toLowerCase();
    return words.some(word => searchText.includes(word));
  });

  return {
    success: true,
    results,
    totalResults: results.length,
    aiEnhanced: false,
  };
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(partialQuery, courses) {
  if (partialQuery.length < 2) return [];

  const queryLower = partialQuery.toLowerCase();
  
  // Extract unique fields and keywords from courses
  const suggestions = new Set();

  courses.forEach(course => {
    if (course.title?.toLowerCase().includes(queryLower)) {
      suggestions.add(course.title);
    }
    if (course.field?.toLowerCase().includes(queryLower)) {
      suggestions.add(course.field);
    }
  });

  // Add common search patterns
  const patterns = [
    `learn ${partialQuery}`,
    `${partialQuery} for beginners`,
    `advanced ${partialQuery}`,
    `${partialQuery} course`,
  ];

  patterns.forEach(p => {
    if (p.toLowerCase().startsWith(queryLower)) {
      suggestions.add(p);
    }
  });

  return Array.from(suggestions).slice(0, 8);
}

/**
 * Semantic search using embeddings (for future use with vector DB)
 */
export async function semanticSearch(query, courses) {
  try {
    // Get embedding for search query
    const queryEmbedding = await aiService.getEmbedding(query);
    
    // In a production system, you would:
    // 1. Store course embeddings in a vector database
    // 2. Query the vector DB for similar embeddings
    // 3. Return the most similar courses
    
    // For now, fall back to smart search
    return smartSearch(query, courses);
  } catch (error) {
    console.error('Semantic search error:', error);
    return basicSearch(query, courses);
  }
}

export default { smartSearch, getSearchSuggestions, semanticSearch };
