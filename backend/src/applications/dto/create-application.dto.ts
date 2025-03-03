// applications/dto/create-application.dto.ts (DTO pour la création d'une application)
import { IsString, IsEnum, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(['OPEN', 'CLOSED'])
  status: string;

  @IsOptional()
  @IsString()
  rewardScale?: string;

  @IsNumber()
  ownerId: number;
}