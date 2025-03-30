import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { Application } from '../../applications/entities/application.entity';
import { ReportStatus } from './report-status.entity';
import { Parameters } from './parameters.entity';
import { BugType } from './bug-types.entity';
import { ReportLog } from './report-log.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Application, application => application.reports)
  application: Application;

  @ManyToOne(() => ReportStatus, reportStatus => reportStatus.reports)
  reportStatus: ReportStatus;

  @ManyToOne(() => User, user => user.reports)
  user: User;

  @Column()
  name: string;

  @Column()
  scoreCVSS: number;

  @Column()
  pdf: string;

  @Column()
  endPoint: string;

  @Column()
  cvssVector: string;

  @Column()
  submittedAt: Date;

  @OneToMany(() => Parameters, parameters => parameters.report)
  parameters: Parameters[];

  @OneToMany(() => BugType, bugType => bugType.reports)
  bugType: BugType[];

  @OneToMany(() => ReportLog, reportLog => reportLog.report)
  reportLogs: ReportLog[];
}
