// rewards/reward.entity.ts (Modèle Récompenses)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  imageUrl: string;

  @Column()
  price: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: false })
  locked: boolean;
}