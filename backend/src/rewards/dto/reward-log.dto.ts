import { ApiProperty } from '@nestjs/swagger';
import { Action, EntityType } from '../../common/entity-logs/base-log.entity';

export class RewardLogDto {
  @ApiProperty({ description: 'ID du log' })
  id: number;

  @ApiProperty({ description: "Type d'entité (REWARD)" })
  entityType: EntityType;

  @ApiProperty({ description: 'Action effectuée (CREATE, UPDATE, DELETE)' })
  action: Action;

  @ApiProperty({ description: "ID de l'utilisateur ayant effectué l'action" })
  userId: string;

  @ApiProperty({ description: 'Données avant modification', required: false })
  oldData?: any;

  @ApiProperty({ description: 'Données après modification', required: false })
  newData?: any;

  @ApiProperty({ description: 'Date de création du log' })
  createdAt: Date;
}
