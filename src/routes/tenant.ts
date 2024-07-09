import express from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import { CreateTenantRequest } from '../types';
import authenticate from '../middlewares/authenticate';
const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantSerive = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantSerive, logger);

router.post('/', authenticate, (req: CreateTenantRequest, res, next) =>
  tenantController.create(req, res, next),
);

export default router;
