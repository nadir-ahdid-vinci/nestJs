import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportStatus } from './entities/report-status.entity';
import { ReportLog } from './entities/report-log.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { BugType } from './entities/bug-types.entity';
import { Parameters } from './entities/parameters.entity';
import { Owasp } from './entities/owasp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ReportStatus, ReportLog, Parameters, BugType, Owasp]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
