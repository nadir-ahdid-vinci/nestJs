// users/user.entity.ts (Modèle Utilisateur)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ['HUNTER', 'HUNTER_DEV', 'HUNTER_ADMIN'], default: 'HUNTER' })
  role: string;

  @Column({ default: 0 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;
}