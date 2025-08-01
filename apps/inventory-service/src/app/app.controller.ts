import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InventoryService } from './app.service';
import {
  HelloResponse,
  InventoryRequest,
  InventoryResponse,
  InventoryServiceController,
  Empty,
} from '@nubras/protos';
import { Metadata } from '@grpc/grpc-js';

@Controller()
export class InventoryController implements InventoryServiceController {
  private readonly logger = new Logger(InventoryController.name);
  constructor(private readonly inventoryService: InventoryService) {}

  @GrpcMethod('InventoryService', 'SayHello')
  sayHello(_: Empty, metadata: Metadata): HelloResponse {
    this.logger.log(metadata);
    const traceId = metadata.get('trace-id')[0];
    this.logger.log(`[trace-id=${traceId}] SayHello called`);
    return this.inventoryService.sayHello();
  }

  @GrpcMethod('InventoryService', 'GetInventory')
  getInventory(_: InventoryRequest, metadata: Metadata): InventoryResponse {
    this.logger.log(metadata);
    const traceId = metadata.get('trace-id')[0];
    this.logger.log(`[trace-id=${traceId}] GetInventory called`);
    return { message: 'Inventory' };
  }
}
