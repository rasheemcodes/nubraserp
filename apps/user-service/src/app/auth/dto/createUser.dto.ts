// src/auth/dto/create-user.dto.ts
import {
  IsNotEmpty,
  IsEmail,
  Length,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  ArrayNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class RoleAssignment {
  @IsInt()
  @Min(1)
  roleId: number;
}

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  lastName: string;
  
  @IsNotEmpty()
  @Length(5, 20)
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RoleAssignment)
  roles: RoleAssignment[];
}
