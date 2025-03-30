import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Application } from './application.entity';

/**
 * Entité représentant un log d'application
 *
 * Cette entité stocke l'historique des modifications apportées aux applications :
 * - L'action effectuée (création, mise à jour)
 * - Les détails de la modification
 * - L'utilisateur ayant effectué l'action
 * - La date de l'action
 */
export enum ApplicationLogAction {
  CREATED = 'created',
  UPDATED = 'updated',
  CLOSED = 'closed',
}

@Entity()
export class ApplicationLog {
  /**
   * Identifiant unique du log
   */
  @ApiProperty({
    description: 'Identifiant unique du log',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Action effectuée sur l'application
   * - 'create' : création d'une nouvelle application
   * - 'update' : mise à jour d'une application existante
   */
  @ApiProperty({
    description: "Type d'action effectuée",
    enum: ApplicationLogAction,
    example: ApplicationLogAction.CREATED,
  })
  @Column({
    type: 'enum',
    enum: ApplicationLogAction,
  })
  action: ApplicationLogAction;

  /**
   * Détails de la modification au format JSON
   * Contient les champs modifiés et leurs nouvelles valeurs
   */
  @ApiProperty({
    description: 'Valeurs avant modification',
    example: { name: 'Ancien nom', description: 'Ancienne description' },
    required: false,
  })
  @Column('json', { nullable: true })
  previousValues: Record<string, any>;

  @ApiProperty({
    description: 'Nouvelles valeurs après modification',
    example: { name: 'Nouveau nom', description: 'Nouvelle description' },
    required: false,
  })
  @Column('json', { nullable: true })
  newValues: Record<string, any>;

  /**
   * Relation avec l'application concernée
   */
  @ApiProperty({
    description: 'Application concernée',
    type: () => Application,
  })
  @ManyToOne(() => Application, application => application.logs)
  application: Application;

  /**
   * Relation avec l'utilisateur ayant effectué l'action
   */
  @ApiProperty({
    description: "Utilisateur ayant effectué l'action",
    type: () => User,
  })
  @ManyToOne(() => User)
  user: User;

  /**
   * Date de création du log
   */
  @ApiProperty({
    description: "Date de l'action",
    example: '2024-03-14T10:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}
