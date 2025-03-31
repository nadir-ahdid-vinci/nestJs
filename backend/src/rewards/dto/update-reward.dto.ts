import { PartialType } from '@nestjs/mapped-types';
import { CreateRewardDto } from './create-reward.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la mise à jour d'une récompense
 * Tous les champs sont optionnels
 * @class UpdateRewardDto
 */
export class UpdateRewardDto extends PartialType(CreateRewardDto) {
  @ApiProperty({
    description: 'Nom de la récompense',
    example: 'T-shirt collector',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Description détaillée de la récompense',
    example: "T-shirt édition limitée avec le logo de l'application",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Nombre de points nécessaires pour obtenir la récompense',
    example: 1000,
    required: false,
  })
  points?: number;

  @ApiProperty({
    description: 'Quantité totale de récompenses disponibles',
    example: 100,
    required: false,
  })
  quantity?: number;

  @ApiProperty({
    description: 'Indique si la récompense est actuellement disponible',
    example: true,
    required: false,
  })
  available?: boolean;
}
