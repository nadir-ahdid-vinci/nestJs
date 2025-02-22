import { Controller, Post, Body } from '@nestjs/common';

import { User } from './user.entity'; 
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersServices: UsersService) {}

    @Post()
    async createUser(@Body() user: User) {
        return this.usersServices.createUser(user);
    }

}
