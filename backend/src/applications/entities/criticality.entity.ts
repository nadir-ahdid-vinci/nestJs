import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Application } from './application.entity';
import { CriticalityLog } from './criticality-log.entity';

/**
 * Entité représentant un niveau de criticité dans le système
 *
 * Cette entité définit les seuils de valeurs pour différents niveaux de criticité :
 * - low : seuil pour les vulnérabilités de faible importance
 * - medium : seuil pour les vulnérabilités moyennes
 * - high : seuil pour les vulnérabilités importantes
 * - critical : seuil pour les vulnérabilités critiques
 *
 * Les valeurs doivent être dans l'ordre croissant : low < medium < high < critical
 */
@Entity()
export class Criticality {
  /**
   * Identifiant unique du niveau de criticité
   */
  @ApiProperty({
    description: 'Identifiant unique du niveau de criticité',
    example: 1,
    required: true,
  })
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nom du niveau de criticité
   * - Minimum 3 caractères
   * - Maximum 50 caractères
   */
  @ApiProperty({
    description: 'Nom du niveau de criticité',
    example: 'Critique',
    required: true,
  })
  @Column({ length: 50 })
  name: string;

  /**
   * Seuil de valeur basse
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Points attribués pour un bug de niveau CVSS faible',
    example: 50,
    minimum: 0,
  })
  @Column()
  low: number;

  /**
   * Seuil de valeur moyenne
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Points attribués pour un bug de niveau CVSS moyen',
    example: 100,
    minimum: 0,
  })
  @Column()
  medium: number;

  /**
   * Seuil de valeur haute
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Points attribués pour un bug de niveau CVSS élevé',
    example: 200,
    minimum: 0,
  })
  @Column()
  high: number;

  /**
   * Seuil de valeur critique
   * - Minimum : 0
   * - Maximum : 100
   */
  @ApiProperty({
    description: 'Points attribués pour un bug de niveau CVSS critique',
    example: 400,
    minimum: 0,
  })
  @Column()
  critical: number;

  /**
   * Relation avec les applications utilisant ce niveau de criticité
   */
  @ApiProperty({
    description: 'Liste des applications utilisant ce niveau de criticité',
    type: () => [Application],
  })
  @OneToMany(() => Application, application => application.criticality)
  applications: Application[];

  /**
   * Relation avec les logs de ce niveau de criticité
   */
  @ApiProperty({
    description: 'Historique des modifications de la criticité',
    type: () => [CriticalityLog],
  })
  @OneToMany(() => CriticalityLog, log => log.criticality)
  logs: CriticalityLog[];

  /**
   * Date de création du niveau de criticité
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Date de dernière mise à jour du niveau de criticité
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
