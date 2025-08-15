import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ACCESS_ALG, JWT_ACCESS_SECRET } from './jwt.config';

export type AccessPayload = { sub: string; email?: string;[k: string]: any };

@Injectable()
export class JwtService {
    verifyAccess(token: string): AccessPayload {
        try {
            console.log("🚀 ~ JwtService ~ verifyAccess ~ JWT_ACCESS_SECRET:", JWT_ACCESS_SECRET)
            return jwt.verify(token, JWT_ACCESS_SECRET, { algorithms: [ACCESS_ALG] }) as AccessPayload;
        } catch {
            throw new UnauthorizedException('Invalid access token');
        }
    }
}