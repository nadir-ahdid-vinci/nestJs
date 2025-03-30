import { ApiProperty } from '@nestjs/swagger';
import { Action } from '../../../common/entity-logs/base-log.entity';
import { EntityType } from '../../../common/entity-logs/base-log.entity';

export class OrderStatusLogDto {
  @ApiProperty({ description: 'ID du log' })
  id: number;

  @ApiProperty({ description: "Type d'entité (ORDER_STATUS)" })
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
