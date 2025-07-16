import { Controller, Get, Inject, Query } from '@nestjs/common';

import { DRIZZLE_CLIENT } from '@nubras/infra';
import { drizzle } from 'drizzle-orm/node-postgres';
import { audits } from '../../schema';
import { desc } from 'drizzle-orm';

@Controller('audits')
export class AuditHttpController {
  constructor(@Inject(DRIZZLE_CLIENT) private db: ReturnType<typeof drizzle>) {}

  @Get()
  async getAudits(@Query('page') page = 1, @Query('limit') limit = 20) {
    const offset = (page - 1) * limit;
    const result = await this.db
      .select()
      .from(audits)
      .orderBy(desc(audits.timestamp))
      .limit(limit)
      .offset(offset);
    return result;
  }
}
