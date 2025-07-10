import { IsPhoneNumber, IsString, Length, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class SigninDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ''))
  phone: string;
}

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ''))
  phone: string;

  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString({ message: 'OTP must be a string' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  code: string;
}

export class MagicLinkDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  @Length(64, 64, { message: 'Invalid token format' })
  @Matches(/^[a-f0-9]{64}$/, { message: 'Token must be a valid hexadecimal string' })
  token: string;
}