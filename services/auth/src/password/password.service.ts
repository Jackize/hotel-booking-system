import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class PasswordService {
    hash(pw: string) { return bcrypt.hash(pw, 10); }
    compare(pw: string, hash: string) { return bcrypt.compare(pw, hash); }
}