// rewards/dto/create-reward.dto.ts (DTO pour la création d'une récompense)
import { IsString, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateRewardDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  imageUrl: string;

  @IsInt()
  @Min(1)
  price: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsBoolean()
  locked: boolean;
}