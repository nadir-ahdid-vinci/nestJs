import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ description: 'ID de la récompense associée à la commande' })
    @IsNotEmpty({ message: 'Le champ rewardId est requis' })
    @IsNumber({}, { message: 'Le champ rewardId doit être un nombre' })
    @IsPositive({ message: 'Le champ rewardId doit être un nombre positif' })
    rewardId: number;
}
 