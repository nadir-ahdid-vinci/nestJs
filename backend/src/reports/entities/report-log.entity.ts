import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ReportLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, report => report.reportLogs)
  report: Report;

  @Column()
  status: string;

  @ManyToOne(() => User, user => user.reportLogs)
  user: User;

  @Column()
  createdAt: Date;

  @Column('json')
  oldValue: Record<string, any>;

  @Column('json')
  newValue: Record<string, any>;
}
