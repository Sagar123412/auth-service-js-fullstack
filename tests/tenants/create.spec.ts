import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import createJWKSMock from 'mock-jwks';
import { Tenant } from '../../src/entity/Tenant';
import { roles } from '../../src/constants';

describe('POST auth/self', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //start jwt mock
    await connection.dropDatabase();
    await connection.synchronize();

    jwks.start();
    adminToken = jwks.token({
      sub: '1',
      role: roles.ADMIN,
    });
    //truncate database
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => {
    jwks.stop();
  });

  describe('happy path', () => {
    it('should return 201 status code', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });

    it('should create a tenant in the database', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });
    it('should return 401 if user is not autheticated', async () => {
      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });
    it('should return 403 if user is not an admin', async () => {
      const managerToken = jwks.token({
        sub: '1',
        role: roles.MANAGER,
      });

      const tenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      };

      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${managerToken}`])
        .send(tenantData);
      expect(response.statusCode).toBe(403);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });
  });
});
