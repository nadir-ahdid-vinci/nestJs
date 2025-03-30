import {
  IsBoolean,
  IsPositive,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO pour la création d'une application
 *
 * Ce DTO définit la structure des données nécessaires pour créer une nouvelle application.
 * Il inclut :
 * - Le nom de l'application
 * - L'ID de la criticité associée
 * - Le logo (optionnel)
 */
export class CreateApplicationDto {
  /**
   * Nom de l'application
   * - Minimum 3 caractères
   * - Maximum 50 caractères
   */
  @ApiProperty({
    description: "Nom de l'application",
    minLength: 3,
    maxLength: 50,
    example: 'Application de test',
  })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MinLength(3, { message: 'Le nom doit contenir au moins 3 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: "Description détaillée de l'application",
    example: "Une description complète de l'application et de ses fonctionnalités",
    minLength: 10,
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @MinLength(10, { message: 'La description doit contenir au moins 10 caractères' })
  @MaxLength(1000, { message: 'La description ne peut pas dépasser 1000 caractères' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({
    description: "Périmètre de test de l'application (URLs autorisées)",
    example: 'https://monulb.be/*, https://api.monulb.be/*',
    minLength: 5,
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Le scope est requis' })
  @IsString({ message: 'Le scope doit être une chaîne de caractères' })
  @MinLength(5, { message: 'Le scope doit contenir au moins 5 caractères' })
  @MaxLength(500, { message: 'Le scope ne peut pas dépasser 500 caractères' })
  @Transform(({ value }) => value?.trim())
  scope: string;

  @ApiProperty({
    description: "ID de l'utilisateur gestionnaire",
    example: 1,
  })
  @IsNotEmpty({ message: "L'ID utilisateur est requis" })
  @IsInt({ message: "L'ID utilisateur doit être un nombre entier" })
  @IsPositive({ message: "L'ID utilisateur doit être positif" })
  userId: number;

  /**
   * ID de la criticité associée à l'application
   */
  @ApiProperty({
    description: 'ID de la criticité associée',
    example: 1,
  })
  @IsNotEmpty({ message: "L'ID de criticité est requis" })
  @IsInt({ message: "L'ID de criticité doit être un nombre entier" })
  @IsPositive({ message: "L'ID de criticité doit être positif" })
  criticalityId: number;

  /**
   * Logo de l'application (optionnel)
   * - Format : JPG, JPEG, PNG
   * - Taille maximale : 5MB
   */
  @ApiPropertyOptional({
    description: "Logo de l'application (optionnel)",
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  logo?: Express.Multer.File;
}
