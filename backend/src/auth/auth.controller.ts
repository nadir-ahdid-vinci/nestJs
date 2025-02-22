import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('hello/:id')
    async getHello(@Param('id') id: any): Promise<string> {
        return this.authService.getMessages(id);
    }
}
