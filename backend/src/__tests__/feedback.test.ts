import request from 'supertest';
import app from '../index';

jest.mock('../models/feedback.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockImplementation(async (data) => ({
      ...data,
      _id: 'mock-id',
      aiProcessed: true,
      save: jest.fn().mockResolvedValue({
        ...data,
        _id: 'mock-id',
      }),
    })),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    }),
  },
}));

jest.mock('../services/gemini.service', () => ({
  analyzeFeedback: jest.fn().mockResolvedValue({
    aiCategory: 'Bug',
    aiSentiment: 'Negative',
    aiPriority: 8,
    aiSummary: 'Test summary',
    aiTags: ['test', 'bug'],
    originalLanguage: 'en',
    translatedTitle: null,
    translatedDescription: null,
  }),
}));

describe('Feedback API', () => {
  it('POST /api/feedback - should fail without required fields', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/feedback - should succeed with valid data', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        title: 'Test Feedback',
        description: 'This is a test feedback description minimum length',
        category: 'Bug',
        submitterName: 'Test User',
        submitterEmail: 'test@test.com',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  }, 15000);

  it('GET /api/feedback - should return feedback list', async () => {
    const res = await request(app).get('/api/feedback');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/auth/login - should succeed with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: process.env.ADMIN_EMAIL || 'admin@feedpulse.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
  });

  it('POST /api/auth/login - should fail with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'wrong@feedpulse.com',
      password: 'badpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/feedback/:id - should refuse without token', async () => {
    const res = await request(app).patch('/api/feedback/mock-id').send({ status: 'Resolved' });
    expect(res.status).toBe(401);
  });
});