import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRedisClient } from 'ts-common/dist/redis';
import { TOKENS } from '../constants/token';

@Global()
@Module({
    providers: [
        {
            provide: TOKENS.REDIS,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => createRedisClient(configService.get<string>('REDIS_URL')),
        },
    ],
    exports: [TOKENS.REDIS]
})
export class RedisModule { }
