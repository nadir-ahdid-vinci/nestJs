import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;
}