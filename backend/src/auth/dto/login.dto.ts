// auth/dto/login.dto.ts (DTO pour la connexion)
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}