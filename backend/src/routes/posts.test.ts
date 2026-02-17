import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../index';

describe('GET /api/posts/:slug/likes', () => {
  it('returns 200 with the post slug', async () => {
    const res = await request(app).get('/api/posts/cape-town-itinerary/likes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ slug: 'cape-town-itinerary' });
  });

  it('returns 404 when slug is missing', async () => {
    const res = await request(app).get('/api/posts//likes');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/posts/:slug/like', () => {
  it('returns 200 with the post slug', async () => {
    const res = await request(app).post('/api/posts/cape-town-itinerary/like');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ slug: 'cape-town-itinerary' });
  });

  it('returns 404 when slug is missing', async () => {
    const res = await request(app).post('/api/posts//like');
    expect(res.status).toBe(404);
  });
});
