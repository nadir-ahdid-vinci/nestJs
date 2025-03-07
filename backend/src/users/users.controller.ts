// users/users.controller.ts (Contrôleur Utilisateur)
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Role('HUNTER')
  @Get()
  async findAll(): Promise<User[]> {
    const users = await this.usersService.findAll();
    if (!users) {
      throw new Error('No users found');
    }
    return users;
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}