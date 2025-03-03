import { Module } from '@nestjs/common';
import { BugReportsService } from './bug-reports.service';
import { BugReportsController } from './bug-reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BugReport } from './entities/bug-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BugReport])],
  controllers: [BugReportsController],
  providers: [BugReportsService],
  exports: [BugReportsService],
})
export class BugReportsModule {}
