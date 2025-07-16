import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { audits } from '../../schema';
import { DRIZZLE_CLIENT } from '@nubras/infra';
import { drizzle } from 'drizzle-orm/node-postgres';

@Controller()
export class AuditListenerController {
  constructor(@Inject(DRIZZLE_CLIENT) private db: ReturnType<typeof drizzle>) {}

  @EventPattern('audit.*')
  async handleAudit(
    @Payload()
    audit: {
      id: string;
      user_id: string;
      action: string;
      module: string;
      entity_id: string;
      description: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: Record<string, any>;
      ip: string;
      timestamp: string;
    }
  ) {
    await this.db.insert(audits).values({
      id: audit.id,
      user_id: audit.user_id,
      action: audit.action,
      module: audit.module,
      entity_id: audit.entity_id,
      description: audit.description,
      metadata: audit.metadata,
      ip: audit.ip,
      timestamp: audit.timestamp ? new Date(audit.timestamp) : new Date(),
    });
  }
}
