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
import { RolesGuard } from '../../guards/roles.gaurd';
import { Roles } from '../../decorators/roles.decorator';

@Controller('roles')
@UseGuards(RolesGuard)
@Roles('admin')
export class RolesController {
  constructor(private svc: RolesService) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Post(':id/users')
  assignToUser(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() dto: AssignRoleDto
  ) {
    return this.svc.assignToUser(roleId, dto.userId);
  }

  @Delete(':id/users/:userId')
  removeFromUser(
    @Param('id', ParseIntPipe) roleId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.svc.removeFromUser(roleId, userId);
  }

  @Get('user/:userId/effective')
  effective(@Param('userId', ParseIntPipe) userId: number) {
    return this.svc.getUserEffective(userId);
  }
}
