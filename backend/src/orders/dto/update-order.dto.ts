import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({ description: 'ID de la commande', required: true })
  @IsNumber({}, { message: 'Le champ orderId doit être un nombre' })
  orderId: number;

  @ApiProperty({ description: 'ID de l\'administrateur', required: true })
  @IsNumber({}, { message: 'Le champ adminId doit être un nombre' })
  adminId: number;
}
