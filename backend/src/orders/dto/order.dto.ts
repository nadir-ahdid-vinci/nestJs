import { RewardDto } from '../../rewards/dto/reward.dto';
import { OrderStatusDto } from '../order-statuses/dto/order-status.dto';
import { UserDto } from '../../users/dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsDateString } from 'class-validator';

export class OrderDto {
  @ApiProperty({ description: 'ID de la commande' })
  @IsNumber({}, { message: 'Le champ id doit être un nombre' })
  @IsPositive({ message: 'Le champ id doit être un nombre positif' })
  id: number;

  @ApiProperty({ description: 'Récompense associée à la commande' })
  @IsNumber({}, { message: 'Le champ reward doit être un nombre' })
  @IsPositive({ message: 'Le champ reward doit être un nombre positif' })
  reward: RewardDto;

  @ApiProperty({ description: 'Statut de la commande' })
  @IsNumber({}, { message: 'Le champ status doit être un nombre' })
  @IsPositive({ message: 'Le champ status doit être un nombre positif' })
  status: OrderStatusDto;

  @ApiProperty({ description: 'Utilisateur associé à la commande' })
  @IsNumber({}, { message: 'Le champ user doit être un nombre' })
  @IsPositive({ message: 'Le champ user doit être un nombre positif' })
  user: UserDto;

  @ApiProperty({ description: 'Prix de la commande' })
  @IsNumber({}, { message: 'Le champ price doit être un nombre' })
  @IsPositive({ message: 'Le champ price doit être un nombre positif' })
  price: number;

  @ApiProperty({ description: 'Date de création de la commande' })
  @IsDateString({}, { message: 'Le champ createdAt doit être une date valide' })
  createdAt: Date;
}
