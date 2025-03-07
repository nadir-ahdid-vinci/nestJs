// applications/dto/create-application.dto.ts (DTO pour la création d'une application)
import { IsString, IsEnum, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ApplicationStatus)
  status: string;

  @IsNumber()
  @Min(1)
  ownerId: number;
}