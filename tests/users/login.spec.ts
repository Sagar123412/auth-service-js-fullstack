import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { RefreshToken } from '../../src/entity/RefreshToken';

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

  describe('happly path', () => {
    it('should not null', () => {
      expect(2).toBe(2);
    });
    it('should return the data', () => {
      expect(2).toBe(2);
    });
  });
});
