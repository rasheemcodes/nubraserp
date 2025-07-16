// src/roles/roles.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto }  from './dto/assign-role.dto';
import { AccessGuard } from '../../guards/roles.gaurd';
import { RequireAccess } from '../../decorators/roles.decorator';

@Controller('roles')
@UseGuards(AccessGuard)
export class RolesController {
  constructor(private svc: RolesService) {}

  @RequireAccess('roles', 'create')
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.svc.create(dto);
  }

  @RequireAccess('roles', 'read')
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @RequireAccess('roles', 'read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @RequireAccess('roles', 'update')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto
  ) {
    return this.svc.update(id, dto);
  }

  @RequireAccess('roles', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @RequireAccess('users', 'update')
  @Post(':id/users')
  assignToUser(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() dto: AssignRoleDto
  ) {
    return this.svc.assignToUser(roleId, dto.userId);
  }

  @RequireAccess('users', 'update')
  @Delete(':id/users/:userId')
  removeFromUser(
    @Param('id', ParseIntPipe) roleId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.svc.removeFromUser(roleId, userId);
  }

  @RequireAccess('users', 'read')
  @Get('user/:userId/effective')
  effective(@Param('userId', ParseIntPipe) userId: number) {
    return this.svc.getUserEffective(userId);
  }
}
