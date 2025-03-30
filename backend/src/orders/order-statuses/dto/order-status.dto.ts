import { ApiProperty } from '@nestjs/swagger';
import { OrderDto } from '../../dto/order.dto';

export class OrderStatusDto {
  @ApiProperty({
    description: 'Identifiant unique du statut de commande',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nom du statut de commande',
    example: 'En attente',
  })
  name: string;

  @ApiProperty({
    description: 'Commandes associées à ce statut',
    type: [OrderDto],
    required: false,
  })
  orders?: OrderDto[];
}
