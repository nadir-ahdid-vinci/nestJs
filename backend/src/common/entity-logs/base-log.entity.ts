import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum Action {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum EntityType {
  REWARD = 'REWARD',
  ORDER = 'ORDER',
  APPLICATION = 'APPLICATION',
  ORDER_STATUS = 'ORDER_STATUS',
  // Ajoutez d'autres types d'entités ici
}

@Entity('entity_logs')
export class BaseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column({
    type: 'enum',
    enum: Action,
  })
  action: Action;

  @Column({ type: 'json', nullable: true })
  oldData: any;

  @Column({ type: 'json', nullable: true })
  newData: any;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
