import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString, IsUUID } from 'class-validator';
import { Action, EntityType } from '../../common/entity-logs/base-log.entity';

export class OrderLogDto {
  @ApiProperty({ description: 'ID unique du log' })
  @IsUUID('4', { message: 'Le champ id doit être un UUID valide' })
  id: string;

  @ApiProperty({ description: "Type d'entité concerné par le log", enum: EntityType })
  @IsEnum(EntityType, { message: 'Le champ entityType doit être une valeur valide' })
  entityType: EntityType;

  @ApiProperty({ description: 'Action effectuée', enum: Action })
  @IsEnum(Action, { message: 'Le champ action doit être une valeur valide' })
  action: Action;

  @ApiProperty({ description: 'Données avant la modification', nullable: true })
  oldData: any;

  @ApiProperty({ description: 'Données après la modification', nullable: true })
  newData: any;

  @ApiProperty({ description: "ID de l'utilisateur ayant effectué l'action" })
  @IsString({ message: 'Le champ userId doit être une chaîne de caractères' })
  userId: string;

  @ApiProperty({ description: 'Date de création du log' })
  @IsDateString({}, { message: 'Le champ createdAt doit être une date valide' })
  createdAt: Date;
}
