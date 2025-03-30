import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BugType } from './bug-types.entity';

@Entity()
export class Owasp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => BugType, bugType => bugType.owasp)
  bugType: BugType;
}
