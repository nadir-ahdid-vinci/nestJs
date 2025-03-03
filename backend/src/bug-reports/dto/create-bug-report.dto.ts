// bug-reports/dto/create-bug-report.dto.ts (DTO pour la création d'un rapport de bug)
import { IsString, IsInt, IsEnum, Min, Max } from 'class-validator';

export class CreateBugReportDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  applicationId: number;

  @IsEnum(['SUBMITTED', 'VALIDATED', 'DUPLICATED', 'CORRECTED', 'VERIFIED', 'REJECTED', 'CHALLENGED'])
  status: string;

  @IsInt()
  @Min(0)
  @Max(10)
  cvssScore: number;
}
