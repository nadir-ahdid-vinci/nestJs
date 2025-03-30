import { IsNotEmpty, IsNumber, IsString, IsBoolean, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
  @ApiProperty({
    description: 'Nom de la récompense',
    example: 'T-shirt collector',
  })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  name: string;

  @ApiProperty({
    description: 'Description détaillée de la récompense',
    example: "T-shirt édition limitée avec le logo de l'application",
  })
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description: string;

  @ApiProperty({
    description: 'Nombre de points nécessaires pour obtenir la récompense',
    example: 1000,
  })
  @IsNotEmpty({ message: 'Le coût en points est requis' })
  @IsNumber({}, { message: 'Le coût doit être un nombre' })
  @Min(0, { message: 'Le coût ne peut pas être négatif' })
  @Transform(({ value }) => Number(value))
  points: number;

  @ApiProperty({
    description: 'Quantité totale de récompenses disponibles',
    example: 100,
  })
  @IsNotEmpty({ message: 'La quantité est requise' })
  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Min(0, { message: 'La quantité ne peut pas être négative' })
  @Transform(({ value }) => Number(value))
  quantity: number;

  @ApiProperty({
    description: 'Indique si la récompense est actuellement disponible',
    example: true,
  })
  @IsBoolean({ message: 'La disponibilité doit être un booléen' })
  @Transform(({ value }) => value === 'true')
  available: boolean;
}
