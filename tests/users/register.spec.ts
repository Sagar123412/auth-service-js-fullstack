import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { truncateTable } from '../utils';

describe('POST auth/register', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //truncate database
    await truncateTable(connection);
  });

  afterAll(async () => {
    await connection.destroy();
  });

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

    it('should user persist', async () => {
      //AAA rute

      //Arrange
      const userData = {
        firstName: '',
        lastName: '',
        email: 'test@gmail.com',
        password: 'secret',
      };

      //Act
      await request(app).post('/auth/resigter').send(userData);

      //Assert
      const userRepository = await connection.getRepository(User);
      const userlist = await userRepository.find();
      expect(userlist).toHaveLength(1);
    });
  });
});
