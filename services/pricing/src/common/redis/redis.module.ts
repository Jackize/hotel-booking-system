import { TOKENS, createRedisClient } from '@hotel/ts-common';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
