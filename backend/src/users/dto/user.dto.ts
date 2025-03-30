import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
  Min,
} from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: "L'email doit être valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @Exclude()
  password?: string;

  @ApiProperty({
    description: "Nom de l'utilisateur",
    example: 'John Doe',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  name: string;

  @ApiProperty({
    description: "Points de l'utilisateur",
    example: 100,
    default: 0,
  })
  @IsNumber({}, { message: 'Les points doivent être un nombre' })
  @Min(0, { message: 'Les points ne peuvent pas être négatifs' })
  @IsOptional()
  points: number = 0;

  @ApiProperty({
    description: "Score de l'utilisateur",
    example: 500,
    default: 0,
  })
  @IsNumber({}, { message: 'Le score doit être un nombre' })
  @Min(0, { message: 'Le score ne peut pas être négatif' })
  @IsOptional()
  score: number = 0;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: UserRole,
    example: UserRole.HUNTER,
    default: UserRole.HUNTER,
  })
  @IsEnum(UserRole, { message: 'Le rôle doit être valide' })
  @IsOptional()
  role: UserRole = UserRole.HUNTER;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2025-03-14T10:30:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  createdAt?: Date;
}
