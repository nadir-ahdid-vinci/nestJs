import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from '../users/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<UserDto, 'password'>> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'name',
        'points',
        'score',
        'role',
        'createdAt',
      ],
    });

    if (!userEntity) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const isPasswordValid = await bcrypt.compare(password, userEntity.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const { password: _, ...userDto } = plainToClass(UserDto, userEntity);
    return userDto;
  }

  async login(user: Omit<UserDto, 'password'>) {
    const payload = { sub: user.id, role: user.role };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
