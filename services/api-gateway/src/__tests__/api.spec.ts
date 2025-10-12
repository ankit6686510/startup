import request from 'supertest';
import app from '@/index';

describe('API Gateway basic endpoints', () => {
  it('GET /api returns api descriptor', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('endpoints');
  });
});
