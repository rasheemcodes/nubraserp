import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InventoryServiceClient } from '@nubras/protos';
import { Metadata } from '@grpc/grpc-js';


@Injectable()
export class AppService {
  private inventoryService: InventoryServiceClient;

  constructor(@Inject('INVENTORY_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.inventoryService =
      this.client.getService<InventoryServiceClient>('InventoryService');
  }

  callInventory() {
    const metadata = new Metadata();
    metadata.set('trace-id', 'some-trace-id');

    return this.inventoryService.sayHello({}, metadata);
  }

  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
