import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RewardDto {
  @Expose()
  @ApiProperty({
    description: 'Identifiant unique de la récompense',
    example: 1,
  })
  id: number;

  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Expose()
  @ApiProperty({
    description: 'Nom de la récompense',
    example: 'T-shirt collector',
  })
  name: string;

  @IsNotEmpty({ message: 'La description est requise' })
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @Expose()
  @ApiProperty({
    description: 'Description détaillée de la récompense',
    example: "T-shirt édition limitée avec le logo de l'application",
  })
  description: string;

  @IsNumber({}, { message: 'Les points doivent être un nombre' })
  @Expose()
  @ApiProperty({
    description: 'Nombre de points nécessaires pour obtenir la récompense',
    example: 1000,
  })
  points: number;

  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Expose()
  @ApiProperty({
    description: 'Quantité totale de récompenses disponibles',
    example: 100,
  })
  quantity: number;

  @IsOptional()
  @IsBoolean({ message: 'Disponible doit être un booléen' })
  @Expose()
  @ApiProperty({
    description: 'Indique si la récompense est actuellement disponible',
    example: true,
  })
  available: boolean;

  @IsOptional()
  @IsString({ message: 'La photo doit être une chaîne de caractères' })
  @Expose()
  @ApiProperty({
    description: 'Nom du fichier photo de la récompense',
    example: 'tshirt-123456.jpg',
  })
  photo: string;

  @Expose()
  @ApiProperty({
    description: 'Date de création de la récompense',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;
}
