// src/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CLIENT } from '@nubras/infra';
import { roles, userRoles } from '../../schema';
import { and, eq } from 'drizzle-orm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(@Inject(DRIZZLE_CLIENT) private db: ReturnType<typeof drizzle>) {}

  async create(dto: CreateRoleDto) {
    const [r] = await this.db.insert(roles).values(dto).returning();
    return r;
  }

  findAll() {
    return this.db.select().from(roles);
  }

  async findOne(id: number) {
    const [r] = await this.db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!r) throw new NotFoundException('Role not found');
    return r;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);
    await this.db.update(roles).set(dto).where(eq(roles.id, id));
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.delete(roles).where(eq(roles.id, id));
    return { deleted: true };
  }

  async assignToUser(roleId: number, userId: number) {
    await this.findOne(roleId);
    await this.db
      .insert(userRoles)
      .values({ userId, roleId })
      .onConflictDoNothing();
    return { assigned: true };
  }

  async removeFromUser(roleId: number, userId: number) {
    await this.db
      .delete(userRoles)
      .where(and(eq(userRoles.roleId, roleId), eq(userRoles.userId, userId)))
    return { removed: true };
  }

  /** Merge all assigned roles → effective access map */
  async getUserEffective(userId: number) {
    const rows = await this.db
      .select({ access: roles.access })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const merged: Record<string, Record<string, boolean>> = {};
    for (const { access } of rows) {
      for (const entry of access) {
        merged[entry.module] ||= {};
        Object.assign(merged[entry.module], entry.permissions);
      }
    }
    return merged;
  }
}
