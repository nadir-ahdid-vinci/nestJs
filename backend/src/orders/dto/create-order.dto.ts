// orders/dto/create-order.dto.ts (DTO pour la création d'une commande)
import { IsInt, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  userId: number;

  @IsInt()
  rewardId: number;

  @IsEnum(['PENDING', 'DELIVERED'])
  status: string;
}