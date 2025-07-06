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
} from 'class-validator';
import { Type } from 'class-transformer';

class RoleAssignment {
  @IsInt()
  @Min(1)
  roleId: number;

}

export class CreateUserDto {
  @IsNotEmpty()
  @Length(5, 20)
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RoleAssignment)
  roles: RoleAssignment[];
}
