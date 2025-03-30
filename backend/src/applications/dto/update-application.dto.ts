import { PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsPositive, IsInt, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la mise à jour d'une application
 *
 * Ce DTO étend le CreateApplicationDto en rendant tous les champs optionnels.
 * Cela permet de mettre à jour uniquement les champs souhaités sans avoir à fournir
 * toutes les données de l'application.
 */
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: "Logo de l'application (fichier jpg, jpeg ou png)",
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  logo?: Express.Multer.File;

  @ApiProperty({
    description: "État d'ouverture de l'application",
    type: 'boolean',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  open?: boolean;

  @ApiProperty({
    description: "Status de l'application",
    enum: ['OPEN', 'CLOSED'],
    example: 'OPEN',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Le status est requis' })
  @IsString({ message: 'Le status doit être une chaîne de caractères' })
  status?: 'OPEN' | 'CLOSED';
}
