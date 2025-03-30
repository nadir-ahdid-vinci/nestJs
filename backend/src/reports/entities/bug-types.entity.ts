import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';
import { Owasp } from './owasp.entity';

@Entity()
export class BugType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  cwe: string;

  @OneToMany(() => Owasp, owasp => owasp.bugType)
  owasp: Owasp[];

  @OneToMany(() => Report, report => report.bugType)
  reports: Report[];
}
