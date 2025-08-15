import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppAuthService } from './app.service';
import { InfraModule } from './common/infra/infra.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';
import { JwtService } from './jwt/jwt.service';
import { PasswordService } from './password/password.service';

@Module({
  imports: [
    InfraModule,
    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  controllers: [AppController],
  providers: [AppAuthService, JwtService, PasswordService],
})
export class AppModule { }
