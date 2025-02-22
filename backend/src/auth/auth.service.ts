import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    async getMessages(id: any): Promise<string> {
        return 'Hello World from auth! Number: ' + id;
    }
}
