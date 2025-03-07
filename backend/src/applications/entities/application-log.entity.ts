import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Application } from './application.entity';
import { User } from '../../users/entities/user.entity';

export enum ApplicationAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

@Entity()
export class ApplicationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  application: Application;

  @ManyToOne(() => User, { nullable: true }) // Peut être null si action automatique
  user?: User;

  @Column({ type: 'enum', enum: ApplicationAction })
  action: ApplicationAction;

  @Column({ type: 'json', nullable: true })
  details?: Record<string, any>; // Pour stocker les changements

  @CreateDateColumn()
  createdAt: Date;
}
