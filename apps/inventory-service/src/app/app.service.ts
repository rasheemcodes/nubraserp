import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
  sayHello(): { message: string } {
    return { message: `Hello from Inventory!` };
  }
}
