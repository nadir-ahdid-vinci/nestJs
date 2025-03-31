import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerService } from '../logger/logger.service';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private logger: LoggerService,
  ) {
    this.logger.setContext('UsersService');
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    try {
      this.logger.info(`Attempting to create user with email: ${createUserDto.email}`);

      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        this.logger.security(
          `Attempt to create duplicate user with email: ${createUserDto.email}`,
          'UserCreation',
        );
        throw new BadRequestException('Un utilisateur avec cet email existe déjà');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

      const user = this.usersRepository.create({
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        points: createUserDto.points || 0,
        score: createUserDto.score || 0,
        role: createUserDto.role,
      });

      const savedUser = await this.usersRepository.save(user);

      return plainToClass(UserDto, savedUser);
    } catch (error) {
      this.logger.error('Failed to create user', error.stack, 'UserCreation');
      throw new BadRequestException("Erreur lors de la création de l'utilisateur");
    }
  }

  async findAll(): Promise<UserDto[]> {
    try {
      this.logger.debug('Fetching all users');
      const users = await this.usersRepository.createQueryBuilder('user').getMany();
      this.logger.info(`Retrieved ${users.length} users`);
      return users.map(user => plainToClass(UserDto, user));
    } catch (error) {
      this.logger.error('Failed to fetch users', error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<UserDto> {
    try {
      this.logger.debug(`Fetching user with id: ${id}`);
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .getOne();

      if (!user) {
        this.logger.warn(`User not found with id: ${id}`);
        throw new NotFoundException(`User #${id} not found`);
      }

      return plainToClass(UserDto, user);
    } catch (error) {
      this.logger.error(`Failed to fetch user #${id}`, error.stack);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    try {
      this.logger.debug(`Fetching user with email: ${email}`);
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .getOne();

      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        return null;
      }

      return plainToClass(UserDto, user);
    } catch (error) {
      this.logger.error(`Failed to fetch user by email: ${email}`, error.stack);
      throw error;
    }
  }

  async update(
    id: number,
    updateData: UpdateUserDto,
  ): Promise<UserDto> {
    try {
      this.logger.debug(`Attempting to update user #${id}`);

      const user = await this.findOne(id);

      // If updating password, hash it
      if (updateData.password) {
        this.logger.security(`Password change attempted for user #${id}`);
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await this.usersRepository.save({
        ...user,
        ...updateData,
      });

      this.logger.audit('USER_UPDATED', id.toString(), {
        updatedFields: Object.keys(updateData)
      });

      return plainToClass(UserDto, updatedUser);
    } catch (error) {
      this.logger.error(`Failed to update user #${id}`, error.stack);
      throw error;
    }
  }
}
