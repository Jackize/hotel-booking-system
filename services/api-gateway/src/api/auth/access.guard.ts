import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from './jwt.service';

@Injectable()
export class AccessGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwt: JwtService,
    ) { }

    canActivate(ctx: ExecutionContext): boolean {
        // 1) Skip if route is @Public()
        // const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        //     ctx.getHandler(),
        //     ctx.getClass(),
        // ]);
        // if (isPublic) return true;
        // 2) Otherwise require JWT
        const req = ctx.switchToHttp().getRequest();
        const header = req.headers['authorization'] || req.headers['Authorization'];
        if (!header || !header.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
        const token = header.slice(7);
        req.user = this.jwt.verifyAccess(token); // gắn user vào request
        return true;
    }
}