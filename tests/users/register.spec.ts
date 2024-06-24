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
        firstName: 'Sagar',
        lastName: 'Sain',
        email: 'test@gmail.com',
        password: 'Ss@12345',
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
        firstName: 'Sagar',
        lastName: 'Sain',
        email: 'test@gmail.com',
        password: 'Ss@12345',
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
        firstName: 'Sagar',
        lastName: 'Sain',
        email: 'test@gmail.com',
        password: 'Ss@12345',
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
        firstName: 'Sagar',
        lastName: 'Sain',
        email: 'test@gmail.com',
        password: 'Ss@12345',
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

    it('email should be unique while registeration of user', async () => {
      //Arrange
      const userData = {
        firstName: 'Sagar',
        lastName: 'Sain',
        email: 'test@gmail.com',
        password: 'secret',
      };

      //Act
      const userRepository = await connection.getRepository(User);
      userRepository.save({ ...userData, role: 'customer' });

      await request(app).post('/auth/resigter').send(userData);

      //Assert
      const user = await userRepository.find();
      expect(user).toHaveLength(1);
    });
  });

  describe('sad path - fields are missing', () => {
    it('email should be validate for empty and valid email', async () => {
      //Arrange
      const userData = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      };

      //Act
      const response = await request(app).post('/auth/resigter').send(userData);

      //Assert

      expect(response.statusCode).toBe(400);

      //also check if email is not valid the no record should be created in the database
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe('input should be in the correct formate', () => {
    it('email should be trim', async () => {
      //Arrange
      const userData = {
        firstName: 'sagar',
        lastName: 'sain',
        email: ' example@gmail.com ',
        password: 'Ss@2345678',
      };

      //Act
      const response = await request(app).post('/auth/resigter').send(userData);

      //Assert

      //also check if email is not valid the no record should be created in the database
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      const user = users[0];
      expect(user.email).toBe('example@gmail.com');
    });
    it('first name should not be empty', async () => {
      //Arrange
      const userData = {
        firstName: '',
        lastName: 'sain',
        email: ' example@gmail.com ',
        password: 'Ss@2345678',
      };

      //Act
      const response = await request(app).post('/auth/resigter').send(userData);

      expect(response.statusCode).toBe(400);
      //Assert

      //also check if email is not valid the no record should be created in the database
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it('last name should not be empty', async () => {
      //Arrange
      const userData = {
        firstName: 'Sagar',
        lastName: '',
        email: ' example@gmail.com ',
        password: 'Ss@2345678',
      };

      //Act
      const response = await request(app).post('/auth/resigter').send(userData);

      expect(response.statusCode).toBe(400);
      //Assert

      //also check if email is not valid the no record should be created in the database
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it('password should not be empty', async () => {
      //Arrange
      const userData = {
        firstName: 'Sagar',
        lastName: 'sain',
        email: ' example@gmail.com ',
        password: '',
      };

      //Act
      const response = await request(app).post('/auth/resigter').send(userData);

      expect(response.statusCode).toBe(400);
      //Assert

      //also check if email is not valid the no record should be created in the database
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
    it('password should not be in correct format', async () => {
      //Arrange
      const userData = {
        firstName: 'Sagar',
        lastName: 'sain',
        email: ' example@gmail.com ',
        password: 'sdfjlsfk',
      };

      //Act
      const response = await request(app).post('/auth/resigter').send(userData);

      expect(response.statusCode).toBe(400);
      //Assert

      //also check if email is not valid the no record should be created in the database
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });
});
