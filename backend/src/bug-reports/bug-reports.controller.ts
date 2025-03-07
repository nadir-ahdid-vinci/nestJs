import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { BugReportsService } from './bug-reports.service';
import { BugReport } from './entities/bug-report.entity';

@Controller('bug-reports')
export class BugReportsController {
  constructor(private bugReportsService: BugReportsService) {}

  @Get('latest')
  findNumberLatest(): Promise<BugReport[]> {
    return this.bugReportsService.findNumberLatest();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<BugReport> {
    return this.bugReportsService.findOne(id);
  }

  @Get()
  findAll(): Promise<BugReport[]> {
    return this.bugReportsService.findAll();
  }

  @Post()
  create(@Body() createBugReportDto: CreateBugReportDto): Promise<BugReport> {
    return this.bugReportsService.create(createBugReportDto);
  }
}