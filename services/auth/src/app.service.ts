import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Redis } from 'ioredis';
import { Repository } from 'typeorm';
import { TOKENS } from './common/constants/token';
import { AuthEvents } from './common/kafka/auth.events';
import { User } from './entities/user.entity';
import { JwtService } from './jwt/jwt.service';
import { PasswordService } from './password/password.service';

@Injectable()
export class AppAuthService {

  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private pw: PasswordService,
    private jwt: JwtService,
    private readonly events: AuthEvents,
    @Inject(TOKENS.REDIS) private readonly redis: Redis,
  ) { }
  async onModuleInit() { await this.events.onModuleInit?.(); }
  async onModuleDestroy() { await this.events.onModuleDestroy?.(); }

  async signup(email: string, fullName: string, password: string) {
    const existed = await this.users.findOne({ where: { email } })
    if (existed) throw new ConflictException('Email already exists')
    const passwordHash = await this.pw.hash(password);
    const user = this.users.create({ email, fullName, passwordHash });
    await this.users.save(user);

    return { id: user.id, email: user.email, fullName: user.fullName };
  }

  async login(email: string, password: string, ip?: string, ua?: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user || !(await this.pw.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwt.signAccess({ sub: user.id, email: user.email });
    const jti = crypto.randomUUID();
    const refreshToken = this.jwt.signRefresh({ sub: user.id, jti })
    // Lưu refresh token vào Redis
    await this.redis.setex(`rt:${user.id}:${jti}`, 60 * 60 * 24 * 7, '1')
    await this.events.publishLogin({ userId: user.id, timestamp: Date.now(), ipAddress: ip ?? null, userAgent: ua ?? null, success: true });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    console.log("🚀 ~ AppAuthService ~ refresh ~ refreshToken:", refreshToken)
    let payload: any;
    try { payload = this.jwt.verifyRefresh(refreshToken); }
    catch { throw new UnauthorizedException('Invalid refresh'); }
    const { sub: userId, jti } = payload;
    const key = `rt:${userId}:${jti}`;
    const ok = await this.redis.get(key);
    if (!ok) throw new UnauthorizedException('Refresh revoked/expired');

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const newAccess = this.jwt.signAccess({ sub: user.id, email: user.email });
    await this.events.publishTokenRefresh({ userId: user.id, timestamp: Date.now(), success: true });
    return { accessToken: newAccess };
  }

  async logout(userId: string, refreshToken?: string, ip?: string) {
    if (refreshToken) {
      try {
        const { jti } = this.jwt.verifyRefresh(refreshToken) as any;
        await this.redis.del(`rt:${userId}:${jti}`);
      } catch {/* ignore */ }
    } else {
      // revoke ALL tokens của user
      const scan = this.redis.scanStream({ match: `rt:${userId}:*` });
      for await (const keys of scan) if (keys.length) await this.redis.del(keys);
    }
    await this.events.publishLogout({ userId, timestamp: Date.now(), ipAddress: ip });
    return { ok: true };
  }
}
