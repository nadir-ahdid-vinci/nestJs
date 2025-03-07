import { Controller, Post, Get, Body, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return user;
  }
}