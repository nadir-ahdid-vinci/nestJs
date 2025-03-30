import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { User } from '../../users/entities/user.entity';
import { Application } from '../entities/application.entity';
import {
  StatisticsCalculationException,
  ApplicationNotFoundException,
} from '../../common/exceptions/application.exceptions';

@Injectable()
export class ApplicationStatisticsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  private async checkApplicationExists(applicationId: number): Promise<void> {
    const exists = await this.applicationRepository.exists({
      where: { id: applicationId },
    });
    if (!exists) {
      throw new ApplicationNotFoundException(applicationId);
    }
  }

  async getHallOfFame(applicationId: number) {
    try {
      await this.checkApplicationExists(applicationId);

      const hallOfFame = await this.reportRepository
        .createQueryBuilder('report')
        .select(['user.id', 'user.name', 'COUNT(report.id) as reports_count'])
        .innerJoin('report.user', 'user')
        .where('report.application.id = :applicationId', { applicationId })
        .andWhere('report.status = :status', { status: 'VALIDATED' })
        .groupBy('user.id')
        .orderBy('reports_count', 'DESC')
        .limit(3)
        .getRawMany();

      return hallOfFame;
    } catch (error) {
      if (error instanceof ApplicationNotFoundException) {
        throw error;
      }
      throw new StatisticsCalculationException(applicationId, error.message);
    }
  }

  async getReportStatistics(applicationId: number) {
    try {
      await this.checkApplicationExists(applicationId);

      // Optimisation : une seule requête pour toutes les statistiques
      const statistics = await this.reportRepository
        .createQueryBuilder('report')
        .select([
          'report.criticality',
          'COUNT(report.id) as count',
          'SUM(CASE WHEN report.status = :validatedStatus THEN 1 ELSE 0 END) as validated_count',
          'SUM(CASE WHEN report.status = :pendingStatus THEN 1 ELSE 0 END) as pending_count',
          'SUM(CASE WHEN report.status = :rejectedStatus THEN 1 ELSE 0 END) as rejected_count',
        ])
        .where('report.application.id = :applicationId', { applicationId })
        .setParameter('validatedStatus', 'VALIDATED')
        .setParameter('pendingStatus', 'PENDING')
        .setParameter('rejectedStatus', 'REJECTED')
        .groupBy('report.criticality')
        .getRawMany();

      const totalReports = statistics.reduce((sum, stat) => sum + parseInt(stat.count), 0);

      return {
        byLevel: statistics.map(stat => ({
          criticality: stat.criticality,
          count: parseInt(stat.count),
          validatedCount: parseInt(stat.validated_count),
          pendingCount: parseInt(stat.pending_count),
          rejectedCount: parseInt(stat.rejected_count),
        })),
        total: totalReports,
      };
    } catch (error) {
      if (error instanceof ApplicationNotFoundException) {
        throw error;
      }
      throw new StatisticsCalculationException(applicationId, error.message);
    }
  }
}
