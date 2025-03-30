import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { CGU } from './cgu.entity';
import { Application } from '../../applications/entities/application.entity';
import { Report } from '../../reports/entities/report.entity';
import { ReportLog } from '../../reports/entities/report-log.entity';
import { UserRole } from '../enums/user-role.enum';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "Email de l'utilisateur",
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({
    description: "Nom de l'utilisateur",
    example: 'John Doe',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: "Points de l'utilisateur",
    example: 100,
    default: 0,
  })
  @Column({ default: 0 })
  points: number;

  @ApiProperty({
    description: "Score de l'utilisateur",
    example: 500,
    default: 0,
  })
  @Column({ default: 0 })
  score: number;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: UserRole,
    example: UserRole.HUNTER,
    default: UserRole.HUNTER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.HUNTER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2025-03-14T10:30:00Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: "Liste des commandes de l'utilisateur",
    type: () => [Order],
  })
  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @ApiProperty({
    description: "CGU acceptées par l'utilisateur",
    type: () => CGU,
  })
  @OneToMany(() => CGU, cgu => cgu.user)
  cgu: CGU;

  @ApiProperty({
    description: "Liste des applications de l'utilisateur",
    type: () => [Application],
  })
  @OneToMany(() => Application, application => application.user)
  applications: Application[];

  @ApiProperty({
    description: "Liste des rapports de l'utilisateur",
    type: () => [Report],
  })
  @OneToMany(() => Report, report => report.user)
  reports: Report[];

  @ApiProperty({
    description: "Liste des logs de rapports de l'utilisateur",
    type: () => [ReportLog],
  })
  @OneToMany(() => ReportLog, reportLog => reportLog.user)
  reportLogs: ReportLog[];
}
