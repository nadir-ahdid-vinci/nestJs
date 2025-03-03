// bug-reports/bug-report.entity.ts (Modèle Rapport de Bug)
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity()
export class BugReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Application)
  application: Application;

  @ManyToOne(() => User)
  hunter: User;

  @Column({ type: 'enum', enum: ['SUBMITTED', 'VALIDATED', 'DUPLICATED', 'CORRECTED', 'VERIFIED', 'REJECTED', 'CHALLENGED'], default: 'SUBMITTED' })
  status: string;

  @Column()
  cvssScore: number;

  @Column({ nullable: true })
  pdfUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}