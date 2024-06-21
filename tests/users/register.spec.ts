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
    await connection.dropDatabase();
    await connection.synchronize();
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

    it('user should a have a customer role', async () => {
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
      const user = await userRepository.find();

      expect(user[0]).toHaveProperty('role');
      expect(user[0].role).toBe('customer');
    });

    it('should store hashed password in the database', async () => {
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
      const user = await userRepository.find();

      expect(user[0].password).not.toBe(userData.password);
      expect(user[0].password).toHaveLength(60);
      expect(user[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
    });
  });
});
