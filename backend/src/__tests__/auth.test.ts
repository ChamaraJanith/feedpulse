import request from 'supertest';
import app from '../index';

describe('Auth API', () => {
  it('POST /api/auth/login - should fail with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@wrong.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login - should succeed with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@feedpulse.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      });
    expect(res.status).toBe(200);
    expect(res.body.data?.token || res.body.token).toBeDefined();
  });
});