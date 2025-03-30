import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reward } from '../../rewards/entities/reward.entity';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @ManyToOne(() => Reward, reward => reward.orders)
  reward: Reward;

  @Column()
  createdAt: Date;

  @ManyToOne(() => OrderStatus, orderStatus => orderStatus.orders)
  status: OrderStatus;
}
