import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderStatusDto {
  @ApiProperty({
    description: 'Nom du statut de commande',
    example: 'En attente',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
