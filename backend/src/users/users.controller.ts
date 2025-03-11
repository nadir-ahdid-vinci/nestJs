// users/users.controller.ts (Contrôleur Utilisateur)
import { Controller, Get, Post, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from 'src/auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @Get()
  @Role('HUNTER_ADMIN')
  async findAll(): Promise<User[]> {
    this.logger.log('Tentative de récupération de tous les utilisateurs');
    try {
      const users = await this.usersService.findAll();
      if (!users) {
        this.logger.warn('Aucun utilisateur trouvé dans la base de données');
        throw new Error('No users found');
      }
      this.logger.log(`${users.length} utilisateurs récupérés avec succès`);
      return users;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
      throw error;
    }
  }

  @Get(':email')
  @Role('HUNTER_ADMIN')
  async findByEmail(@Param('email') email: string): Promise<User> {
    this.logger.log(`Tentative de récupération de l'utilisateur avec l'email: ${email}`);
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn(`Aucun utilisateur trouvé avec l'email: ${email}`);
        throw new Error('User not found');
      }
      this.logger.log(`Utilisateur ${email} récupéré avec succès`);
      return user;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'utilisateur ${email}: ${error.message}`);
      throw error;
    }
  }

  @Post()
  @Role('HUNTER_ADMIN')
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Tentative de création d'un nouvel utilisateur: ${createUserDto.email}`);
    try {
      const user = await this.usersService.create(createUserDto);
      this.logger.log(`Utilisateur ${user.email} créé avec succès`);
      return user;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
      throw error;
    }
  }
}