import { Repository } from "typeorm";
import { ITenant, TenantQueryParams } from "../types";
import { Tenant } from "../entity/Tenant";
import createHttpError from "http-errors";
import { Logger } from "winston";

export class TenantService {
  constructor(
    private tenantRepository: Repository<Tenant>,
    private logger: Logger,
  ) {}

  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }

  async update(id: number, tenantData: ITenant) {
    return await this.tenantRepository.update(id, tenantData);
  }

  async getAll(validatedQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where("CONCAT(tenant.name, ' ', tenant.address) ILike :q", {
        q: searchTerm,
      });
    }

    const result = await queryBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("tenant.id", "DESC")
      .getManyAndCount();
    return result;
  }

  async getById(tenantId: number) {
    return await this.tenantRepository.findOne({ where: { id: tenantId } });
  }

  async deleteById(tenantId: number) {
    const items = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!items) {
      this.logger.info("this tenant does not exist", { id: Number(tenantId) });
      const err = createHttpError(404, "this record does not exist");
      throw err;
    }

    return await this.tenantRepository.delete(tenantId);
  }
}
