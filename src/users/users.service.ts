import { Injectable } from '@nestjs/common';
import { User } from './user.entity'; // Adjust the import path as necessary
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) 
        private readonly userRepository: Repository<User>
    ) {}

    async findAllUsers() {
        return await this.userRepository.find();
    }

    async createUser(user: User) {
        try {
            await this.userRepository.save(user);
            return "c'est bon ! "  + user.username;
        } catch (error) {
           throw new Error(error);
        }
    }
}
