/**
 * Meilisearch Integration for EduX
 * Fast, typo-tolerant search for courses, instructors, and content
 */

import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';

// Initialize Meilisearch client
let client = null;

export function getMeilisearchClient() {
  if (!client) {
    client = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
    });
  }
  return client;
}

// Index names
export const Indexes = {
  COURSES: 'courses',
  INSTRUCTORS: 'instructors',
  LECTURES: 'lectures',
  TOPICS: 'topics',
};

/**
 * Initialize all search indexes with proper settings
 */
export async function initializeSearchIndexes() {
  const client = getMeilisearchClient();
  
  try {
    // Courses index
    const coursesIndex = client.index(Indexes.COURSES);
    await coursesIndex.updateSettings({
      searchableAttributes: [
        'title',
        'description',
        'field',
        'instructor_name',
      ],
      filterableAttributes: [
        'field',
        'rating',
        'student_count',
        'i_id',
        'appr',
      ],
      sortableAttributes: [
        'rating',
        'student_count',
        'title',
      ],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'rating:desc',
        'student_count:desc',
      ],
      distinctAttribute: 'c_id',
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      },
      synonyms: {
        'js': ['javascript'],
        'ts': ['typescript'],
        'py': ['python'],
        'ml': ['machine learning'],
        'ai': ['artificial intelligence'],
        'dev': ['development'],
        'web': ['web development'],
        'react': ['reactjs', 'react.js'],
        'node': ['nodejs', 'node.js'],
      },
    });

    // Instructors index
    const instructorsIndex = client.index(Indexes.INSTRUCTORS);
    await instructorsIndex.updateSettings({
      searchableAttributes: [
        'name',
        'subject',
        'bio',
      ],
      filterableAttributes: [
        'subject',
        'course_count',
      ],
      sortableAttributes: [
        'course_count',
        'name',
      ],
      distinctAttribute: 'i_id',
    });

    // Lectures index
    const lecturesIndex = client.index(Indexes.LECTURES);
    await lecturesIndex.updateSettings({
      searchableAttributes: [
        'description',
        'topic_name',
        'course_title',
      ],
      filterableAttributes: [
        'c_id',
        't_id',
      ],
      distinctAttribute: 'l_id',
    });

    console.log('[Meilisearch] Indexes initialized successfully');
    return true;
  } catch (error) {
    console.error('[Meilisearch] Failed to initialize indexes:', error);
    return false;
  }
}

/**
 * Index courses for search
 */
export async function indexCourses(courses) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.COURSES);
  
  try {
    const documents = courses.map(course => ({
      c_id: course.c_id,
      title: course.title,
      description: course.description,
      field: course.field,
      rating: course.rating || 0,
      student_count: course.student_count || 0,
      i_id: course.i_id,
      instructor_name: course.instructor_name || '',
      wall: course.wall,
      seat: course.seat,
      appr: course.appr,
    }));
    
    const response = await index.addDocuments(documents, { primaryKey: 'c_id' });
    console.log(`[Meilisearch] Indexed ${documents.length} courses`);
    return response;
  } catch (error) {
    console.error('[Meilisearch] Failed to index courses:', error);
    throw error;
  }
}

/**
 * Index instructors for search
 */
export async function indexInstructors(instructors) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.INSTRUCTORS);
  
  try {
    const documents = instructors.map(instructor => ({
      i_id: instructor.i_id,
      name: instructor.name,
      subject: instructor.subject,
      bio: instructor.bio || '',
      course_count: instructor.course_count || 0,
    }));
    
    const response = await index.addDocuments(documents, { primaryKey: 'i_id' });
    console.log(`[Meilisearch] Indexed ${documents.length} instructors`);
    return response;
  } catch (error) {
    console.error('[Meilisearch] Failed to index instructors:', error);
    throw error;
  }
}

/**
 * Index lectures for search
 */
export async function indexLectures(lectures) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.LECTURES);
  
  try {
    const response = await index.addDocuments(lectures, { primaryKey: 'l_id' });
    console.log(`[Meilisearch] Indexed ${lectures.length} lectures`);
    return response;
  } catch (error) {
    console.error('[Meilisearch] Failed to index lectures:', error);
    throw error;
  }
}

/**
 * Search courses
 */
export async function searchCourses(query, options = {}) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.COURSES);
  
  const {
    limit = 20,
    offset = 0,
    filter = null,
    sort = null,
    attributesToRetrieve = ['*'],
    attributesToHighlight = ['title', 'description'],
  } = options;
  
  try {
    const searchParams = {
      limit,
      offset,
      attributesToRetrieve,
      attributesToHighlight,
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    };
    
    if (filter) {
      searchParams.filter = filter;
    }
    
    if (sort) {
      searchParams.sort = sort;
    }
    
    const results = await index.search(query, searchParams);
    
    return {
      hits: results.hits,
      totalHits: results.estimatedTotalHits,
      processingTimeMs: results.processingTimeMs,
      query: results.query,
    };
  } catch (error) {
    console.error('[Meilisearch] Search failed:', error);
    throw error;
  }
}

/**
 * Search instructors
 */
export async function searchInstructors(query, options = {}) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.INSTRUCTORS);
  
  const { limit = 10, offset = 0 } = options;
  
  try {
    const results = await index.search(query, {
      limit,
      offset,
      attributesToHighlight: ['name', 'subject'],
    });
    
    return {
      hits: results.hits,
      totalHits: results.estimatedTotalHits,
    };
  } catch (error) {
    console.error('[Meilisearch] Instructor search failed:', error);
    throw error;
  }
}

/**
 * Search lectures within a course
 */
export async function searchLectures(query, courseId = null, options = {}) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.LECTURES);
  
  const { limit = 20 } = options;
  const filter = courseId ? `c_id = ${courseId}` : null;
  
  try {
    const results = await index.search(query, {
      limit,
      filter,
      attributesToHighlight: ['description'],
    });
    
    return {
      hits: results.hits,
      totalHits: results.estimatedTotalHits,
    };
  } catch (error) {
    console.error('[Meilisearch] Lecture search failed:', error);
    throw error;
  }
}

/**
 * Multi-index search (search across all content)
 */
export async function globalSearch(query, options = {}) {
  const { limit = 5 } = options;
  
  try {
    const [courses, instructors, lectures] = await Promise.all([
      searchCourses(query, { limit }),
      searchInstructors(query, { limit }),
      searchLectures(query, null, { limit }),
    ]);
    
    return {
      courses: courses.hits,
      instructors: instructors.hits,
      lectures: lectures.hits,
      totalResults: courses.totalHits + instructors.totalHits + lectures.totalHits,
    };
  } catch (error) {
    console.error('[Meilisearch] Global search failed:', error);
    throw error;
  }
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(query, limit = 5) {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    const results = await searchCourses(query, {
      limit,
      attributesToRetrieve: ['c_id', 'title', 'field'],
    });
    
    return results.hits.map(hit => ({
      id: hit.c_id,
      title: hit.title,
      field: hit.field,
      type: 'course',
    }));
  } catch (error) {
    console.error('[Meilisearch] Suggestions failed:', error);
    return [];
  }
}

/**
 * Delete a course from the index
 */
export async function deleteCourseFromIndex(courseId) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.COURSES);
  
  try {
    await index.deleteDocument(courseId);
    console.log(`[Meilisearch] Deleted course ${courseId} from index`);
  } catch (error) {
    console.error('[Meilisearch] Failed to delete course:', error);
  }
}

/**
 * Update a single course in the index
 */
export async function updateCourseInIndex(course) {
  const client = getMeilisearchClient();
  const index = client.index(Indexes.COURSES);
  
  try {
    await index.updateDocuments([course]);
    console.log(`[Meilisearch] Updated course ${course.c_id} in index`);
  } catch (error) {
    console.error('[Meilisearch] Failed to update course:', error);
  }
}

/**
 * Get index statistics
 */
export async function getIndexStats() {
  const client = getMeilisearchClient();
  
  try {
    const stats = await client.getStats();
    return stats;
  } catch (error) {
    console.error('[Meilisearch] Failed to get stats:', error);
    return null;
  }
}

/**
 * Health check
 */
export async function healthCheck() {
  const client = getMeilisearchClient();
  
  try {
    const health = await client.health();
    return health.status === 'available';
  } catch (error) {
    console.error('[Meilisearch] Health check failed:', error);
    return false;
  }
}

export default {
  getMeilisearchClient,
  Indexes,
  initializeSearchIndexes,
  indexCourses,
  indexInstructors,
  indexLectures,
  searchCourses,
  searchInstructors,
  searchLectures,
  globalSearch,
  getSearchSuggestions,
  deleteCourseFromIndex,
  updateCourseInIndex,
  getIndexStats,
  healthCheck,
};
