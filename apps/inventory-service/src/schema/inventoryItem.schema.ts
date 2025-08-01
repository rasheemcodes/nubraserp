import { sql, SQL } from 'drizzle-orm';
import { inventorySchema } from '.';
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const ITEM_CATEGORIES = [
  'fabric',
  'thread',
  'zipper',
  'button',
  'product',
  'other',
] as const;

export const InventoryItemCategory = pgEnum('inventory_item_category', ITEM_CATEGORIES);

export type InventoryItemCategoryEnum = typeof ITEM_CATEGORIES[number];

export const InventoryTable = inventorySchema.table('inventory_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: InventoryItemCategory('category').notNull(),
  subcategory: varchar('subcategory'),
  barcode: text('barcode').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const InventoryItemVariants = inventorySchema.table(
  'inventory_item_variants',
  {
    id: serial('id').primaryKey(),
    inventoryItemId: integer('inventory_item_id').references(
      () => InventoryTable.id
    ),
    sku: text('sku').notNull().unique(),
    costPrice: numeric('cost_price', { precision: 10, scale: 2 }).notNull(),
    sellingPrice: numeric('selling_price', {
      precision: 10,
      scale: 2,
    }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    attributes: jsonb('attributes').notNull(),
    totalQuantity: integer('total_quantity').notNull(),
    availableQuantity: integer('available_quantity').generatedAlwaysAs(
      (): SQL =>
        sql`${InventoryItemVariants.totalQuantity} - ${InventoryItemVariants.reservedQuantity}`
    ),
    reservedQuantity: integer('reserved_quantity').default(0),
    soldQuantity: integer('sold_quantity').default(0),
    damagedQuantity: integer('damaged_quantity').default(0),
    returnedQuantity: integer('returned_quantity').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  }
);
