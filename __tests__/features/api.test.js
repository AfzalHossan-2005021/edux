/**
 * Phase 5 API Tests
 * Tests for Certificate, Discussion, Live Sessions, Payment APIs
 */

import { createMocks } from 'node-mocks-http';

// Mock pool
jest.mock('../../middleware/connectdb', () => ({
  getConnection: jest.fn(() => ({
    execute: jest.fn(),
    close: jest.fn(),
  })),
}));

describe('Certificate API', () => {
  let handler;
  
  beforeEach(() => {
    jest.resetModules();
    handler = require('../../pages/api/certificate').default;
  });

  it('should return 400 if userId is missing on POST', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { courseId: 1 },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 if courseId is missing on POST', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { userId: 1 },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('Discussions API', () => {
  let handler;
  let mockPool;

  beforeEach(() => {
    jest.resetModules();
    mockPool = require('../../middleware/connectdb');
    mockPool.getConnection.mockResolvedValue({
      execute: jest.fn().mockResolvedValue({ rows: [], metaData: [] }),
      close: jest.fn(),
    });
    handler = require('../../pages/api/discussions').default;
  });

  it('should return 400 if courseId is missing on GET', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return threads for valid courseId', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { courseId: '1' },
    });

    await handler(req, res);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('threads');
  });

  it('should return 400 for POST without required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'PATCH',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('Live Sessions API', () => {
  let handler;
  let mockPool;

  beforeEach(() => {
    jest.resetModules();
    mockPool = require('../../middleware/connectdb');
    mockPool.getConnection.mockResolvedValue({
      execute: jest.fn().mockResolvedValue({ rows: [], metaData: [] }),
      close: jest.fn(),
    });
    handler = require('../../pages/api/live-sessions').default;
  });

  it('should return sessions for GET', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { courseId: '1' },
    });

    await handler(req, res);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('sessions');
  });

  it('should return 400 for POST without required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 for PUT without sessionId', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: { action: 'join' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 for DELETE without sessionId', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      body: {},
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('Payments API', () => {
  let handler;
  let mockPool;

  beforeEach(() => {
    jest.resetModules();
    mockPool = require('../../middleware/connectdb');
    mockPool.getConnection.mockResolvedValue({
      execute: jest.fn().mockResolvedValue({ rows: [], metaData: [] }),
      close: jest.fn(),
    });
    handler = require('../../pages/api/payments').default;
  });

  it('should return 400 if missing parameters on GET', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 for invalid action on POST', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { action: 'invalid' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 for checkout without required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { action: 'create-checkout', userId: 1 },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('Gamification API', () => {
  let handler;
  let mockPool;

  beforeEach(() => {
    jest.resetModules();
    mockPool = require('../../middleware/connectdb');
    mockPool.getConnection.mockResolvedValue({
      execute: jest.fn().mockResolvedValue({ rows: [[0]], metaData: [{ name: 'TOTAL_XP' }] }),
      close: jest.fn(),
    });
    handler = require('../../pages/api/gamification').default;
  });

  it('should return 400 for profile without userId', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { action: 'profile' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 for POST without action', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 for award-xp without required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { action: 'award-xp', userId: 1 },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('Versioning API', () => {
  let handler;
  let mockPool;

  beforeEach(() => {
    jest.resetModules();
    mockPool = require('../../middleware/connectdb');
    mockPool.getConnection.mockResolvedValue({
      execute: jest.fn().mockResolvedValue({ rows: [], metaData: [] }),
      close: jest.fn(),
    });
    handler = require('../../pages/api/versioning').default;
  });

  it('should return empty versions for GET', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { courseId: '1' },
    });

    await handler(req, res);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('versions');
  });

  it('should return 400 for POST without required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { contentType: 'course' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 400 for PUT without versionId', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: {},
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('Instructor Analytics API', () => {
  let handler;
  let mockPool;

  beforeEach(() => {
    jest.resetModules();
    mockPool = require('../../middleware/connectdb');
    mockPool.getConnection.mockResolvedValue({
      execute: jest.fn().mockResolvedValue({ rows: [[0]], metaData: [] }),
      close: jest.fn(),
    });
    handler = require('../../pages/api/instructor/analytics').default;
  });

  it('should return 400 if instructorId is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 405 for non-GET methods', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});
