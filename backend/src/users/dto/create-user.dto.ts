// users/dto/create-user.dto.ts (DTO pour la création d'un utilisateur)
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['HUNTER', 'HUNTER_DEV', 'HUNTER_ADMIN'])
  role: string;
}