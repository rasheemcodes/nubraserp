import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class AccessEntry {
  @IsString() @IsNotEmpty()
  module: string;

  @IsObject()
  permissions: Record<string, boolean>;
}

export class CreateRoleDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true })
  @Type(() => AccessEntry)
  access: AccessEntry[];
}