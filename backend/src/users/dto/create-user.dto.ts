import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsStrongPassword,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
