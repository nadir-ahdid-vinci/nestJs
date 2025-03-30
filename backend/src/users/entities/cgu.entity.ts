import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class CGU {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => User, user => user.cgu)
  user: User[];
}
