// users/users.service.ts (Service Utilisateur)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async findAll(): Promise<User[] | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .getMany();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    createUserDto.password = hashedPassword;
    return this.usersRepository.save(createUserDto);
  }
}