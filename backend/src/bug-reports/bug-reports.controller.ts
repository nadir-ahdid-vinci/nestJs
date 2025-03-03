// bug-reports/bug-reports.controller.ts (Contrôleur des rapports de bug)
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { BugReportsService } from './bug-reports.service';
import { BugReport } from './entities/bug-report.entity';

@Controller('bug-reports')
export class BugReportsController {
  constructor(private bugReportsService: BugReportsService) {}

  @Get()
  findAll(): Promise<BugReport[]> {
    return this.bugReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<BugReport> {
    return this.bugReportsService.findOne(id);
  }

  @Post()
  create(@Body() createBugReportDto: CreateBugReportDto): Promise<BugReport> {
    return this.bugReportsService.create(createBugReportDto);
  }
}