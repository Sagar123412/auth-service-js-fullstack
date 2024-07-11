import express, { NextFunction, Response } from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import { CreateTenantRequest } from '../types';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { roles } from '../constants';
import tenantValidator from '../validators/ tenant-validator';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantSerive = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantSerive, logger);

router.post(
  '/',
  authenticate,
  canAccess([roles.ADMIN]),
  (req: CreateTenantRequest, res, next) =>
    tenantController.create(req, res, next),
);

router.patch(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next),
);

router.get('/', (req, res, next) => tenantController.getAll(req, res, next));

router.get('/:id', (req, res, next) => tenantController.getOne(req, res, next));

router.delete(
  '/:id',
  authenticate,
  canAccess([roles.ADMIN]),
  (req, res, next) => tenantController.destroy(req, res, next),
);

export default router;
