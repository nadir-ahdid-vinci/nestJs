// orders/order.entity.ts (Modèle Commandes)
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reward } from '../../rewards/entities/reward.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Reward)
  reward: Reward;

  @Column({ type: 'enum', enum: ['PENDING', 'DELIVERED'], default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}