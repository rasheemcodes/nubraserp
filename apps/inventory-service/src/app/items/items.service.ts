import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class ItemsService {
  constructor(private readonly db: ReturnType<typeof drizzle>) {}
}