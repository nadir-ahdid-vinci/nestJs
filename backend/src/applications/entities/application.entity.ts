import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Report } from '../../reports/entities/report.entity';
import { Criticality } from './criticality.entity';
import { ApplicationLog } from './application-log.entity';

export enum ApplicationStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

/**
 * Entité représentant une application dans le système
 *
 * Cette entité stocke les informations principales d'une application :
 * - Identifiant unique
 * - Nom de l'application
 * - Logo (chemin du fichier)
 * - Relations avec l'utilisateur et la criticité
 * - Timestamps de création et mise à jour
 */
@Entity()
export class Application {
  /**
   * Identifiant unique de l'application
   */
  @ApiProperty({
    description: "Identifiant unique de l'application",
    example: 1,
    required: true,
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nom de l'application
   * - Minimum 3 caractères
   * - Maximum 50 caractères
   */
  @ApiProperty({
    description: "Nom de l'application",
    example: 'MonULB',
    required: true,
    minLength: 3,
    maxLength: 50,
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    description: "Description détaillée de l'application",
    example:
      "Application mobile permettant aux étudiants d'accéder à leurs horaires et leurs notes",
    required: true,
  })
  @Column('text')
  description: string;

  @ApiProperty({
    description: "Périmètre de test de l'application (URLs autorisées)",
    example: 'https://monulb.be/*, https://api.monulb.be/*',
    required: true,
    minLength: 5,
    maxLength: 500,
  })
  @Column()
  scope: string;

  /**
   * Chemin du logo de l'application
   * Stocké dans le dossier uploads/logos
   */
  @ApiProperty({
    description: "Logo de l'application",
    example: 'applications/monulb-logo.png',
    required: true,
  })
  @Column({ nullable: true })
  logo: string;

  /**
   * Date de création de l'application
   */
  @ApiProperty({
    description: 'Date de création du programme de bug bounty',
    example: '2024-03-14T10:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Date de dernière mise à jour de l'application
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Relation avec l'utilisateur propriétaire de l'application
   */
  @ApiProperty({
    description: "Gestionnaire de l'application",
    type: () => User,
  })
  @ManyToOne(() => User, user => user.applications)
  user: User;

  /**
   * Relation avec le niveau de criticité de l'application
   */
  @ApiProperty({
    description: "Niveau de criticité de l'application",
    type: () => Criticality,
  })
  @ManyToOne(() => Criticality, criticality => criticality.applications)
  criticality: Criticality;

  @ApiProperty({
    description: 'Liste des rapports de bugs soumis pour cette application',
    type: () => [Report],
  })
  @OneToMany(() => Report, report => report.application)
  reports: Report[];

  /**
   * Relation avec les logs de l'application
   */
  @ApiProperty({
    description: "Historique des modifications de l'application",
    type: () => [ApplicationLog],
  })
  @OneToMany(() => ApplicationLog, log => log.application)
  logs: ApplicationLog[];

  @ApiProperty({
    description: "Statut de l'application",
    enum: ApplicationStatus,
    example: ApplicationStatus.OPEN,
    default: ApplicationStatus.CLOSED,
  })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.CLOSED,
  })
  status: ApplicationStatus;
}
