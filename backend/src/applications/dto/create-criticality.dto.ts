import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ValidateCriticalityOrder } from '../decorators/criticality-validation.decorator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la création d'un niveau de criticité
 *
 * Ce DTO définit la structure des données nécessaires pour créer un nouveau niveau de criticité.
 * Il inclut :
 * - Le nom du niveau
 * - Les seuils de valeurs (low, medium, high, critical)
 *
 * Les valeurs doivent être dans l'ordre croissant : low < medium < high < critical
 */
@ValidateCriticalityOrder()
export class CreateCriticalityDto {
  /**
   * Nom du niveau de criticité
   * - Minimum 3 caractères
   * - Maximum 50 caractères
   */
  @ApiProperty({
    description: 'Nom du niveau de criticité',
    minLength: 3,
    maxLength: 50,
    example: 'Critique',
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  @MinLength(3, { message: 'Le nom doit contenir au moins 3 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  name: string;

  /**
   * Seuil de valeur basse
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Seuil de valeur basse',
    minimum: 0,
    maximum: 100,
    example: 25,
  })
  @IsNumber({}, { message: 'low must be a number conforming to the specified constraints' })
  @IsNotEmpty({ message: 'low should not be empty' })
  @IsPositive({ message: 'low must be a positive number' })
  @Min(0, { message: 'low must not be less than 0' })
  @Max(100, { message: 'low must not be greater than 100' })
  low: number;

  /**
   * Seuil de valeur moyenne
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Seuil de valeur moyenne',
    minimum: 0,
    maximum: 100,
    example: 50,
  })
  @IsNumber({}, { message: 'medium must be a number conforming to the specified constraints' })
  @IsNotEmpty({ message: 'medium should not be empty' })
  @IsPositive({ message: 'medium must be a positive number' })
  @Min(0, { message: 'medium must not be less than 0' })
  @Max(100, { message: 'medium must not be greater than 100' })
  medium: number;

  /**
   * Seuil de valeur haute
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Seuil de valeur haute',
    minimum: 0,
    maximum: 100,
    example: 75,
  })
  @IsNumber({}, { message: 'high must be a number conforming to the specified constraints' })
  @IsNotEmpty({ message: 'high should not be empty' })
  @IsPositive({ message: 'high must be a positive number' })
  @Min(0, { message: 'high must not be less than 0' })
  @Max(100, { message: 'high must not be greater than 100' })
  high: number;

  /**
   * Seuil de valeur critique
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Seuil de valeur critique',
    minimum: 0,
    maximum: 100,
    example: 90,
  })
  @IsNumber({}, { message: 'critical must be a number conforming to the specified constraints' })
  @IsNotEmpty({ message: 'critical should not be empty' })
  @IsPositive({ message: 'critical must be a positive number' })
  @Min(0, { message: 'critical must not be less than 0' })
  @Max(100, { message: 'critical must not be greater than 100' })
  critical: number;
}
