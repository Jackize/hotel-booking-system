import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    constructor(@Inject() readonly config: ConfigService) { }
    private readonly accSecret = this.config.get<string>('JWT_ACCESS_SECRET') || 'secret'
    private readonly refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh'
    private readonly accTTL = this.config.get<string>('ACCESS_EXPIRE')
    private readonly refreshTTL = this.config.get<string>('REFRESH_EXPIRE')

    signAccess(payload: object) {
        // @ts-ignore
        return jwt.sign(payload, this.accSecret, { expiresIn: this.accTTL });
    }

    signRefresh(payload: object) {
        // @ts-ignore
        return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshTTL });
    }

    verifyRefresh(token: string) {
        return jwt.verify(token, this.refreshSecret) as any;
    }

    verifyAccess(token: string) {
        return jwt.verify(token, this.accSecret) as any;
    }
}