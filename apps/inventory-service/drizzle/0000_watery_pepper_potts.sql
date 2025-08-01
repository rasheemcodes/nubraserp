CREATE SCHEMA "inventory";
--> statement-breakpoint
CREATE TYPE "public"."inventory_item_category" AS ENUM('fabric', 'thread', 'zipper', 'button', 'product', 'other');--> statement-breakpoint
CREATE TABLE "inventory"."inventory_item_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_item_id" integer,
	"sku" text NOT NULL,
	"cost_price" numeric(10, 2) NOT NULL,
	"selling_price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"attributes" jsonb NOT NULL,
	"total_quantity" integer NOT NULL,
	"available_quantity" integer NOT NULL,
	"reserved_quantity" integer NOT NULL,
	"sold_quantity" integer NOT NULL,
	"damaged_quantity" integer NOT NULL,
	"returned_quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_item_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "inventory"."inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "inventory_item_category" NOT NULL,
	"subcategory" varchar,
	"barcode" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
ALTER TABLE "inventory"."inventory_item_variants" ADD CONSTRAINT "inventory_item_variants_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory"."inventory_items"("id") ON DELETE no action ON UPDATE no action;