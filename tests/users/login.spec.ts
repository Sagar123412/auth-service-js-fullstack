import request from 'supertest';
import app from '../../src/app';

describe('login /auth/login', () => {
  describe('happy path', () => {
    it('should return 200 status code', async () => {
      //AAA rute

      //Arrange
      const userData = {
        email: 'tesaddadsadsdast@gmail.com',
        password: 'Ss@12345',
      };

      //Act
      const result = await request(app).post('/auth/login').send(userData);

      //Assert
      expect(result.statusCode).toBe(400);
    });
  });

  describe('sad path', () => {});
});
