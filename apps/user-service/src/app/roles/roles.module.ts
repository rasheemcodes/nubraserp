// src/roles/roles.module.ts
import { Module }     from '@nestjs/common';
import { APP_GUARD }  from '@nestjs/core';
import { Reflector }  from '@nestjs/core';

import { RolesController } from './roles.controller';
import { RolesService }    from './roles.service';
import { AccessGuard } from '../../guards/roles.gaurd';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    Reflector,
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
  exports: [RolesService]
})
export class RolesModule {}
