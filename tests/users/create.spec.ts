import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';

import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { roles } from '../../src/constants';
import { createTenant } from '../utils';
import { Tenant } from '../../src/entity/Tenant';

describe('POST /users', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should persist the user in the database', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: '1',
        role: roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: 'ss',
        lastName: 's',
        email: 'demo1@gmail.com',
        password: 'password',
        role: roles.ADMIN,
        tenantId: tenant.id,
      };

      // Add token to cookie
      const result = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it('should create a manager user', async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: '1',
        role: roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: 'sss',
        lastName: 's',
        email: 'rakesh@mern.space',
        password: 'password',
        role: roles.ADMIN,
        tenantId: tenant.id,
      };

      // Add token to cookie
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(roles.MANAGER);
    });

    it.todo('should return 403 if non admin user tries to create a user');
  });
});
