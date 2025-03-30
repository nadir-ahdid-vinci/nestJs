import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Criticality } from './criticality.entity';

/**
 * Entité représentant un log de criticité
 *
 * Cette entité stocke l'historique des modifications apportées aux niveaux de criticité :
 * - L'action effectuée (création, mise à jour)
 * - Les détails de la modification
 * - L'utilisateur ayant effectué l'action
 * - La date de l'action
 */
export enum CriticalityLogAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

@Entity()
export class CriticalityLog {
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
   * Action effectuée sur le niveau de criticité
   * - 'create' : création d'un nouveau niveau
   * - 'update' : mise à jour d'un niveau existant
   */
  @ApiProperty({
    description: "Type d'action effectuée",
    enum: CriticalityLogAction,
    example: CriticalityLogAction.CREATED,
  })
  @Column({
    type: 'enum',
    enum: CriticalityLogAction,
  })
  action: CriticalityLogAction;

  /**
   * Détails de la modification au format JSON
   * Contient les champs modifiés et leurs nouvelles valeurs
   */
  @ApiProperty({
    description: 'Valeurs avant modification',
    example: { name: 'Ancien nom', low: 100, medium: 200, high: 500, critical: 1000 },
    required: false,
  })
  @Column('json', { nullable: true })
  previousValues: Record<string, any>;

  @ApiProperty({
    description: 'Nouvelles valeurs après modification',
    example: { name: 'Nouveau nom', low: 150, medium: 300, high: 750, critical: 1500 },
    required: false,
  })
  @Column('json', { nullable: true })
  newValues: Record<string, any>;

  /**
   * Relation avec le niveau de criticité concerné
   */
  @ApiProperty({
    description: 'Criticalité concernée',
    type: () => Criticality,
  })
  @ManyToOne(() => Criticality, criticality => criticality.logs)
  criticality: Criticality;

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
