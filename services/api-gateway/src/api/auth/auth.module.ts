import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({
    imports: [HttpModule.register({
        baseURL: `${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/auth`,
        timeout: 10000,
    })],
    controllers: [AuthController],
    // providers: [JwtService, AccessGuard],
    // exports: [JwtService, AccessGuard],
})
export class AuthModule { }