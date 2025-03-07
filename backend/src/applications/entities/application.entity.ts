// applications/application.entity.ts (Modèle Application)
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BugReport } from 'src/bug-reports/entities/bug-report.entity';

export enum ApplicationStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  owner: User;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.OPEN })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => BugReport, bugReport => bugReport.application)
  bugReports: BugReport[];
}