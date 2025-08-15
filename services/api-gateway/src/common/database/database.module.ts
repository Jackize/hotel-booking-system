import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDataSource } from 'ts-common/dist/typeorm-helper';
import { TOKENS } from '../constants/token';
@Global()
@Module({
    providers: [
        {
            provide: TOKENS.DB,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const ds = createDataSource({
                    type: 'postgres',
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    username: configService.get<string>('DB_USER'),
                    password: configService.get<string>('DB_PASS'),
                    database: configService.get<string>('DB_NAME'),
                    entities: [], // add entities if needed
                    synchronize: false,
                });
                return ds.initialize();
            },
        },
    ],
    exports: [TOKENS.DB]
})
export class DatabaseModule { }
