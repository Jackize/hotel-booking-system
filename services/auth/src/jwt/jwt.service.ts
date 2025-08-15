import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    private readonly accSecret = process.env.JWT_ACCESS_SECRET || 'secret'
    private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh'
    private readonly accTTL = 60 * 15
    private readonly refreshTTL = 60 * 60 * 24 * 7

    signAccess(payload: object) {
        return jwt.sign(payload, this.accSecret, { expiresIn: this.accTTL });
    }

    signRefresh(payload: object) {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshTTL });
    }

    verifyRefresh(token: string) {
        return jwt.verify(token, this.refreshSecret) as any;
    }

    verifyAccess(token: string) {
        return jwt.verify(token, this.accSecret) as any;
    }
}