// users/user.entity.ts (Modèle Utilisateur)
import { Exclude } from 'class-transformer';
import { Application } from 'src/applications/entities/application.entity';
import { BugReport } from 'src/bug-reports/entities/bug-report.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: ['HUNTER', 'HUNTER_DEV', 'HUNTER_ADMIN'], default: 'HUNTER' })
  role: string;

  @Column({ default: 0 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Application, application => application.owner)
  applications: Application[];

  @OneToMany(() => BugReport, bugReport => bugReport.hunter)
  bugReports: BugReport[];

  @OneToMany(() => Order, order => order.user) 
  orders: Order[];

  @Column({ default: false })
  isCgu: boolean;

  @Column({ default: 0 })
  score: number;
}