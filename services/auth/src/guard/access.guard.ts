import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "src/jwt/jwt.service";

@Injectable()
export class AccessJwtGuard implements CanActivate {
    constructor(private readonly jwt: JwtService) { }
    canActivate(ctx: ExecutionContext) {
        const req = ctx.switchToHttp().getRequest();
        const auth = req.headers['authorization'];
        if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();
        const token = auth.slice(7);
        req.user = this.jwt.verifyAccess(token);
        return true;
    }
}