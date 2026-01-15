/**
 * API Route Tests
 * Tests for the EduX API endpoints
 */
import { createMocks } from 'node-mocks-http';

// Mock the database connection
jest.mock('../../middleware/connectdb', () => ({
  __esModule: true,
  default: jest.fn((handler) => handler),
}));

// Mock oracledb
jest.mock('oracledb', () => ({
  getConnection: jest.fn().mockResolvedValue({
    execute: jest.fn().mockResolvedValue({ rows: [] }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
  BIND_OUT: 1,
  STRING: 2001,
  NUMBER: 2010,
}));

describe('API Route Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login API', () => {
    it('should return 405 for non-POST requests', async () => {
      const loginHandler = require('../../pages/api/login').default;
      
      const { req, res } = createMocks({
        method: 'GET',
      });

      await loginHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 400 for missing credentials', async () => {
      const loginHandler = require('../../pages/api/login').default;
      
      const { req, res } = createMocks({
        method: 'POST',
        body: {},
      });

      await loginHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('Signup API', () => {
    it('should return 405 for non-POST requests', async () => {
      const signupHandler = require('../../pages/api/signup').default;
      
      const { req, res } = createMocks({
        method: 'GET',
      });

      await signupHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('All Courses API', () => {
    it('should return 405 for non-GET requests', async () => {
      const allCoursesHandler = require('../../pages/api/all_courses').default;
      
      const { req, res } = createMocks({
        method: 'POST',
      });

      await allCoursesHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe('Exam Questions API', () => {
    it('should return 405 for non-GET requests', async () => {
      const examQuestionsHandler = require('../../pages/api/exam/questions').default;
      
      const { req, res } = createMocks({
        method: 'POST',
      });

      await examQuestionsHandler(req, res);
      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 400 for missing exam ID', async () => {
      const examQuestionsHandler = require('../../pages/api/exam/questions').default;
      
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await examQuestionsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
    });
  });
});
