import { ApiProperty } from '@nestjs/swagger';
import { Action, EntityType } from '../../common/entity-logs/base-log.entity';
import { IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class RewardLogDto {
  @ApiProperty({ description: 'ID du log' })
  @IsNumber({}, { message: "L'ID doit être un nombre" })
  id: number;

  @ApiProperty({ description: "Type d'entité (REWARD)" })
  @IsEnum(EntityType, { message: "Le type d'entité doit être un nombre" })
  entityType: EntityType;

  @ApiProperty({ description: 'Action effectuée (CREATE, UPDATE, DELETE)' })
  @IsEnum(Action, { message: "L'action doit être un nombre" })
  action: Action;

  @ApiProperty({ description: "ID de l'utilisateur ayant effectué l'action" })
  @IsNumber({}, { message: "L'ID de l'utilisateur doit être un nombre" })
  userId: number;

  @ApiProperty({ description: 'Données avant modification', required: false })
  @IsOptional()
  oldData?: any;

  @ApiProperty({ description: 'Données après modification', required: false })
  @IsOptional()
  newData?: any;

  @ApiProperty({ description: 'Date de création du log' })
  @IsDateString({}, { message: 'La date de création doit être une chaîne de caractères' })
  createdAt: Date;
}
