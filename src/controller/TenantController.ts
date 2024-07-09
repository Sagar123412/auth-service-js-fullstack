import { NextFunction, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import { CreateTenantRequest } from '../types';

export class TenantController {
  constructor(
    private tenantSerive: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body;
    this.logger.debug('Request for creating a tenant', req.body);
    try {
      //save tenant into database
      const tenant = await this.tenantSerive.create({ name, address });
      this.logger.info('tenant has been created', { id: tenant.id });

      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
    }
  }
}
