// bug-reports/bug-reports.service.ts (Service des rapports de bug)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BugReport } from './entities/bug-report.entity';
import { CreateBugReportDto } from './dto/create-bug-report.dto';

@Injectable()
export class BugReportsService {
  constructor(@InjectRepository(BugReport) private bugReportRepo: Repository<BugReport>) {}

  findAll(): Promise<BugReport[]> {
    return this.bugReportRepo.find({ relations: ['hunter', 'application'] });
  }

  async findOne(id: number): Promise<BugReport> {
    const bugReport = await this.bugReportRepo.findOne({ where: { id }, relations: ['hunter', 'application'] });
    if (!bugReport) {
      throw new Error(`BugReport with id ${id} not found`);
    }
    return bugReport;
  }

  async create(createBugReportDto: CreateBugReportDto): Promise<BugReport> {
    return this.bugReportRepo.save(createBugReportDto);
  }

  async findNumberLatest(): Promise<BugReport[]> {
    return this.bugReportRepo.find({
      take: 5,
      order: { createdAt: 'DESC' },
      relations: ['hunter', 'application'],
    });
  }
}