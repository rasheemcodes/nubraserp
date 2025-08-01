  import {
    InventoryItemCategoryEnum,
    ITEM_CATEGORIES,
  } from 'apps/inventory-service/src/schema/inventoryItem.schema';
  import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';

  export class CreateItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsEnum(ITEM_CATEGORIES)
    @IsNotEmpty()
    category: InventoryItemCategoryEnum;

    @IsString()
    @IsOptional()
    subcategory: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateItemVariantDto)
    variants: CreateItemVariantDto[];

    @IsOptional()
    @IsObject()
    specifications: Record<string, string>;
  }

  export class CreateItemVariantDto {
    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsNumber()
    @IsNotEmpty()
    costPrice: number;

    @IsNumber()
    @IsNotEmpty()
    sellingPrice: number;

    @IsObject()
    @IsNotEmpty()
    attributes: Record<string, string>;

    @IsNumber()
    @IsNotEmpty()
    totalQuantity: number;
  }
