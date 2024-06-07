import request from 'supertest';
import app from '../../src/app';

describe('POST auth/register', () => {
  describe('happy path', () => {
    it('should work', async () => {
      //AAA rute

      //Arrange
      const userData = {
        firstName: '',
        lastName: '',
        email: 'test@gmail.com',
        password: 'secret',
      };

      //Act
      const result = await request(app).post('/auth/resigter').send(userData);

      //Assert
      expect(result.statusCode).toBe(201);
    });
  });
});
