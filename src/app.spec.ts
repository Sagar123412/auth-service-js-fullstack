import app from './app';
import { addition } from './utils';
import request from 'supertest';

describe('App', () => {
  it('should work', () => {
    const result = addition(10, 20);
    expect(result).toBe(30);
  });

  it('home api test', async () => {
    const result = await request(app).get('/').send();
    expect(result.statusCode).toBe(200);
  });
});
